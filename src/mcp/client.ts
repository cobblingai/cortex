import { EventEmitter } from "events";
import type { MCPMessage } from "@/types/mcp";

class MCPClient extends EventEmitter {
  private messageQueue: MCPMessage[] = [];
  private isProcessing: boolean = false;

  constructor() {
    super();
    this.setupMessageHandlers();
  }

  private setupMessageHandlers() {
    if (!process.parentPort) {
      throw new Error("MCPClient must be run as a UtilityProcess");
    }

    // Handle messages from main process
    process.parentPort.on("message", (messageEvent: { data: MCPMessage }) => {
      this.handleIncomingMessage(messageEvent.data);
    });

    // Handle process termination
    process.on("SIGTERM", () => {
      this.cleanup();
    });
  }

  private handleIncomingMessage(message: MCPMessage) {
    // Add message to queue
    this.messageQueue.push(message);

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (!message) continue;

        // Process the message
        await this.processMessage(message);

        // Acknowledge message processing
        this.sendToMain({
          id: message.id,
          type: "ack",
          payload: { status: "processed" },
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Error processing message queue:", error);
      // Notify main process of error
      this.sendToMain({
        id: "error",
        type: "error",
        payload: { error: error.message },
        timestamp: Date.now(),
      });
    } finally {
      this.isProcessing = false;
    }
  }

  private async processMessage(message: MCPMessage) {
    // Emit the message for any listeners
    this.emit("message", message);

    // Process based on message type
    switch (message.type) {
      case "ping":
        await this.handlePing(message);
        break;
      case "data":
        await this.handleData(message);
        break;
      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }

  private async handlePing(message: MCPMessage) {
    // Simple ping-pong implementation
    this.sendToMain({
      id: message.id,
      type: "pong",
      payload: { timestamp: Date.now() },
      timestamp: Date.now(),
    });
  }

  private async handleData(message: MCPMessage) {
    // Process data message
    // This is where you'd implement your specific data handling logic
    console.log("Processing data message:", message);
    this.sendToMain({
      id: message.id,
      type: "data",
      payload: { message: "Data processed" },
      timestamp: Date.now(),
    });
  }

  private sendToMain(message: MCPMessage) {
    if (!process.parentPort) return;
    process.parentPort.postMessage(message);
  }

  private cleanup() {
    // Cleanup resources before process termination
    this.messageQueue = [];
    this.isProcessing = false;
  }
}

// Initialize the MCP client
const client = new MCPClient();

// Export for testing purposes
export { MCPClient, MCPMessage };

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});
