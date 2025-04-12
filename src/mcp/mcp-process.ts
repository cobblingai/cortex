import { MCPMessage, MCPMessageReply } from "@/types/mcp";
import { utilityProcess, UtilityProcess } from "electron";
import { MessagePortMain } from "electron";

class MCPProcess {
  private mcpProcess: UtilityProcess | null = null;
  private scriptPath: string;
  private args: string[];
  private port: MessagePortMain;

  onmessage?: ((message: MCPMessageReply) => void) | undefined;
  onerror?: ((error: Error | string) => void) | undefined;
  onclose?: (() => void) | undefined;

  constructor(scriptPath: string, args: string[], port: MessagePortMain) {
    this.scriptPath = scriptPath;
    this.args = args;
    this.port = port;
  }

  start() {
    console.log("Starting MCP process:", this.scriptPath);
    if (this.mcpProcess) {
      throw new Error(`MCP process: ${this.scriptPath} already started`);
    }

    this.mcpProcess = utilityProcess.fork(this.scriptPath, this.args, {
      stdio: "pipe",
    });

    this.mcpProcess.postMessage({ type: "start" }, [this.port]);

    this.mcpProcess.on("message", (message: MCPMessageReply) => {
      console.log(
        `Received message from MCP process: ${this.scriptPath}`,
        message
      );
      if (message.type === "mcp-message-reply") {
        this.onmessage?.(message);
      }
    });

    this.mcpProcess.stderr?.on("data", (data) => {
      const buffer = Buffer.from(data);
      const string = buffer.toString();
      console.error(`MCP process: ${this.scriptPath} stderr:`, string);
    });

    this.mcpProcess.stdout?.on("data", (data) => {
      const buffer = Buffer.from(data);
      const string = buffer.toString();
      console.log(`MCP process: ${this.scriptPath} stdout:`, string);
    });

    this.mcpProcess.on("error", (error) => {
      console.error(`MCP process: ${this.scriptPath} error:`, error);
      this.onerror?.(error);
    });

    this.mcpProcess.on("exit", (code) => {
      console.log(`MCP process: ${this.scriptPath} exited with code ${code}`);
      this.onclose?.();
    });

    console.log("MCP process started:", this.scriptPath);
  }

  send(message: MCPMessage) {
    console.log("Sending message to MCP process:", message);
    if (this.mcpProcess) {
      this.mcpProcess.postMessage({ type: "mcp-message", message });
    } else {
      console.error("MCP process not found. Cannot send message.");
    }
  }

  cleanup() {
    if (this.mcpProcess) {
      this.mcpProcess.kill();
    }
  }
}

export { MCPProcess };
