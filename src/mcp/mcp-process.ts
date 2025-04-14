import { Logger } from "@/lib/logger";
import { MCPMessage, MCPMessageReply } from "@/types/mcp";
import { utilityProcess, UtilityProcess } from "electron";
import { MessagePortMain } from "electron";

const logger = Logger.getInstance();

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
    logger.info(`Starting MCP process: ${this.scriptPath}`);
    if (this.mcpProcess) {
      throw new Error(`MCP process: ${this.scriptPath} already started`);
    }

    this.mcpProcess = utilityProcess.fork(this.scriptPath, this.args, {
      stdio: "pipe",
    });

    this.mcpProcess.postMessage({ type: "start" }, [this.port]);

    this.mcpProcess.on("message", (message: MCPMessageReply) => {
      logger.info(
        `Received message from MCP process: ${this.scriptPath} ${message}`
      );
      if (message.type === "mcp-message-reply") {
        this.onmessage?.(message);
      }
    });

    this.mcpProcess.stderr?.on("data", (data) => {
      const s = data.toString("utf-8");
      logger.error(`MCP process: ${this.scriptPath} stderr: ${s}`);
    });
    this.mcpProcess.stderr?.on("error", (error) => {
      logger.error(`MCP process: ${this.scriptPath} stderr error: ${error}`);
    });

    this.mcpProcess.stdout?.on("data", (data) => {
      const s = data.toString("utf-8");
      logger.info(`MCP process: ${this.scriptPath} stdout: ${s}`);
    });

    this.mcpProcess.on("error", (error) => {
      logger.error(`MCP process: ${this.scriptPath} error: ${error}`);
      this.onerror?.(error);
    });

    this.mcpProcess.on("exit", (code) => {
      logger.info(`MCP process: ${this.scriptPath} exited with code ${code}`);
      this.onclose?.();
    });
  }

  send(message: MCPMessage) {
    if (this.mcpProcess) {
      logger.info("Sending message to MCP process:", message);
      this.mcpProcess.postMessage(message);
    } else {
      logger.error("MCP process not found. Cannot send message.");
    }
  }

  cleanup() {
    if (this.mcpProcess) {
      this.mcpProcess.kill();
      this.mcpProcess = null;
    }
  }
}

export { MCPProcess };
