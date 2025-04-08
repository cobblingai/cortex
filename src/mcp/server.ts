import { EventEmitter } from "events";
import type { MCPMessage } from "@/types/mcp";

interface MCPConnection {
  id: string;
  lastActive: number;
  status: "connected" | "disconnected";
}

class MCPServer extends EventEmitter {
  private connections: Map<string, MCPConnection> = new Map();
  private messageQueue: MCPMessage[] = [];
  private isProcessing: boolean = false;
  private connectionTimeout: number = 30000; // 30 seconds

  constructor() {
    super();
    this.setupMessageHandlers();
    this.startConnectionMonitor();
  }

  private setupMessageHandlers() {
    if (!process.parentPort) {
      throw new Error("MCPServer must be run as a UtilityProcess");
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

  private startConnectionMonitor() {
    setInterval(() => {
      const now = Date.now();
      for (const [id, connection] of this.connections.entries()) {
        if (now - connection.lastActive > this.connectionTimeout) {
          this.handleDisconnection(id);
        }
      }
    }, 5000); // Check every 5 seconds
  }

  private handleIncomingMessage(message: MCPMessage) {
    // Update connection status
    if (message.type === "connect") {
      this.handleConnection(message);
      return;
    }

    // Add message to queue
    this.messageQueue.push(message);

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private handleConnection(message: MCPMessage) {
    const connectionId = message.payload.connectionId;
    this.connections.set(connectionId, {
      id: connectionId,
      lastActive: Date.now(),
      status: "connected",
    });

    this.sendToMain({
      id: message.id,
      type: "connection_ack",
      payload: { connectionId, status: "connected" },
      timestamp: Date.now(),
    });
  }

  private handleDisconnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.status = "disconnected";
      this.connections.delete(connectionId);

      this.sendToMain({
        id: "disconnect",
        type: "disconnect",
        payload: { connectionId },
        timestamp: Date.now(),
      });
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

        // Update connection activity
        if (message.payload.connectionId) {
          const connection = this.connections.get(message.payload.connectionId);
          if (connection) {
            connection.lastActive = Date.now();
          }
        }

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
      case "disconnect":
        this.handleDisconnection(message.payload.connectionId);
        break;
      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }

  private async handlePing(message: MCPMessage) {
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
  }

  private sendToMain(message: MCPMessage) {
    if (!process.parentPort) return;
    process.parentPort.postMessage(message);
  }

  private cleanup() {
    // Cleanup resources before process termination
    this.messageQueue = [];
    this.isProcessing = false;
    this.connections.clear();
  }
}

// Initialize the MCP server
const server = new MCPServer();

// Export for testing purposes
export { MCPServer, MCPMessage, MCPConnection };
