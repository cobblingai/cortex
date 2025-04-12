import type { MCPMessage } from "@/types/mcp";
import { utilityProcess, UtilityProcess } from "electron";

class MCPProcess {
  private mcpProcess: UtilityProcess | null = null;
  private messageQueue: MCPMessage[] = [];
  private isProcessing: boolean = false;

  private serverScriptPath: string;
  private clientScriptPath: string;
  private apiKey: string;

  onclose?: () => void;
  onerror?: (error: Error | string) => void;
  onmessage?: (message: MCPMessage) => void;

  isStarted: boolean = false;

  constructor(
    serverScriptPath: string,
    clientScriptPath: string,
    apiKey: string
  ) {
    this.serverScriptPath = serverScriptPath;
    this.clientScriptPath = clientScriptPath;
    this.apiKey = apiKey;
  }

  start() {
    if (this.mcpProcess) {
      throw new Error("MCPProcess already started");
    }

    this.mcpProcess = utilityProcess.fork(
      this.clientScriptPath,
      [this.serverScriptPath, this.apiKey],
      {
        stdio: "pipe",
      }
    );

    // Handle process spawn events
    this.mcpProcess.on("spawn", () => {
      console.log("MCP Process spawned successfully");
    });

    // Add error handlers
    this.mcpProcess.on("error", (error) => {
      console.error("MCP Process error:", error);
      this.mcpProcess = null;
      this.onerror?.(error);
    });

    // Handle MCP Client Process Events
    this.mcpProcess.on("message", async (message: MCPMessage) => {
      console.log("MCP Process Message received from client:", message);
      this.messageQueue.push(message);
      // Process queue if not already processing
      if (!this.isProcessing) {
        this.processQueue();
      }
    });

    this.mcpProcess.stderr?.on("data", (data) => {
      console.error("MCP Process stderr:", data.toString("utf8"));
    });

    this.mcpProcess.stdout?.on("data", (data) => {
      console.log("MCP Process stdout:", data.toString("utf8"));
    });

    this.mcpProcess.on("exit", (code: number) => {
      console.log("MCP Process exited with code:", code);
      this.mcpProcess = null;
    });

    this.isStarted = true;
  }

  private async processQueue() {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (!message) {
          break;
        }

        this.onmessage?.(message);
      }
    } catch (error) {
      console.error("Error processing message queue:", error);
      this.onerror?.(error);
    } finally {
      this.isProcessing = false;
    }
  }

  cleanup() {
    // Cleanup resources before process termination
    this.messageQueue = [];
    this.isProcessing = false;
    this.mcpProcess?.kill();
    this.isStarted = false;
  }

  send(message: MCPMessage) {
    if (!this.mcpProcess) {
      throw new Error("MCP Process not started");
    }

    this.mcpProcess.postMessage(message);
  }
}

// Export for testing purposes
export { MCPProcess, MCPMessage };
