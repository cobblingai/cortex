import { UtilityProcessClientTransport } from "@/lib/mcp/client/utility-process";
import { ChatMessage } from "@/types/chat";
import { MCPMessage, MCPMessageReply } from "@/types/mcp";
import { Anthropic } from "@anthropic-ai/sdk";
import {
  MessageParam,
  Tool,
} from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SystemPrompt } from "./prompts/system-prompt";

class MCPClient {
  private mcp: Client;
  private anthropic: Anthropic;
  private transport: UtilityProcessClientTransport | null = null;
  private tools: Tool[] = [];

  constructor() {
    process.parentPort?.once(
      "message",
      async (message: Electron.MessageEvent) => {
        console.info("Received message from main process:", message);
        if (message.data.type === "start") {
          try {
            await this.setupMessageHandler(message);
          } catch (error) {
            console.error(error);
          }
        }
      }
    );
  }

  private async setupMessageHandler(message: Electron.MessageEvent) {
    console.info("Setting up message handler:", message);
    const [port] = message.ports;
    this.transport = new UtilityProcessClientTransport(port);
    this.mcp = new Client({
      name: "mcp-client",
      version: "0.0.1",
    });
    await this.mcp.connect(this.transport);
    const toolsResult = await this.mcp.listTools();
    this.tools = toolsResult.tools.map((tool) => {
      return {
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema,
      };
    });
    console.info(
      "MCP Client initialized with tools:",
      this.tools.map((t) => t.name)
    );
    process.parentPort?.on(
      "message",
      async (message: Electron.MessageEvent) => {
        console.info("Received message from main process:", message);

        const mcpMessage = message.data as MCPMessage;

        if (mcpMessage.type === "mcp-message") {
          const apiKey = mcpMessage.payload.apiKey;
          this.anthropic = new Anthropic({ apiKey });
          const query = mcpMessage.payload.messages;
          const result = await this.processQuery(
            mcpMessage.payload.model,
            query
          );
          const reply: MCPMessageReply = {
            id: mcpMessage.id,
            timestamp: mcpMessage.timestamp,
            type: "mcp-message-reply",
            payload: {
              message: result,
            },
          };
          process.parentPort?.postMessage(reply);
        }
      }
    );
  }

  private async processQuery(model: string, messages: ChatMessage[]) {
    const anthropicMessages: MessageParam[] = messages.map((message) => {
      return {
        role: message.role,
        content: message.content,
      };
    });

    const response = await this.anthropic.messages.create({
      model,
      max_tokens: 2048,
      system: SystemPrompt,
      messages: anthropicMessages,
      tools: this.tools,
    });

    const finalText = [];
    const toolResults = [];

    for (const content of response.content) {
      if (content.type === "text") {
        finalText.push(content.text);
      } else if (content.type === "tool_use") {
        const toolName = content.name;
        const toolArgs = content.input as { [x: string]: unknown } | undefined;

        const result = await this.mcp.callTool({
          name: toolName,
          arguments: toolArgs,
        });
        toolResults.push(result);
        finalText.push(
          `[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`
        );

        messages.push({
          role: "user",
          content: result.content as string,
        });

        const response = await this.anthropic.messages.create({
          model,
          max_tokens: 1000,
          messages,
        });

        finalText.push(
          response.content[0].type === "text" ? response.content[0].text : ""
        );
      }
    }

    return finalText.join("\n");
  }
}

async function main() {
  try {
    const _client = new MCPClient();
  } catch (error) {
    console.error(error);
  }
}

main();
