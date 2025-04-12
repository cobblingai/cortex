import { UtilityProcessClientTransport } from "@/lib/mcp/client/utility-process";
import { MCPMessageReply } from "@/types/mcp";
import { Anthropic } from "@anthropic-ai/sdk";
import {
  MessageParam,
  Tool,
} from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

class MCPClient {
  private mcp: Client;
  private anthropic: Anthropic;
  private transport: UtilityProcessClientTransport | null = null;
  private tools: Tool[] = [];

  constructor() {
    process.parentPort?.once(
      "message",
      async (message: Electron.MessageEvent) => {
        console.log("Received message from main process:", message);
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
    console.log("Setting up message handler:", message);
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
    console.log(
      "Connected to server with tools:",
      this.tools.map(({ name }) => name)
    );
    process.parentPort?.on(
      "message",
      async (message: Electron.MessageEvent) => {
        console.log("Received message from main process:", message);
        if (message.data.type === "mcp-message") {
          const apiKey = message.data.message.payload.apiKey;
          this.anthropic = new Anthropic({ apiKey });
          const query = message.data.message.payload.message;
          const result = await this.processQuery(query);
          const reply: MCPMessageReply = {
            id: message.data.message.id,
            timestamp: message.data.message.timestamp,
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

  private async processQuery(query: string) {
    const messages: MessageParam[] = [
      {
        role: "user",
        content: query,
      },
    ];

    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages,
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
          model: "claude-3-5-sonnet-20241022",
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
