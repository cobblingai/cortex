import { MessageChannelMain } from "electron";
import path from "node:path";
import { app } from "electron";
import { MCPProcess } from "./mcp-process.js";
import { Logger } from "../utils/logger.js";
import type { MCPMessage, MCPMessageReply } from "@/types/mcp.js";

export interface MCPConfig {
  clientFileName: string;
  server: {
    fileName: string;
    args: string[];
  };
}

export class MCPProcessManager {
  private static instance: MCPProcessManager;
  private mcpClientProcess: MCPProcess | null = null;
  private mcpServerProcess: MCPProcess | null = null;
  private logger = Logger.getInstance();
  private config: MCPConfig;

  private constructor(
    config: MCPConfig = {
      clientFileName: "mcp-client.mjs",
      server: {
        fileName: "mcp-server.mjs",
        args: [],
      },
    }
  ) {
    this.config = config;
  }

  public static getInstance(config?: MCPConfig): MCPProcessManager {
    if (!MCPProcessManager.instance) {
      MCPProcessManager.instance = new MCPProcessManager(config);
    }
    return MCPProcessManager.instance;
  }

  public startProcesses(onClientMessage: (message: MCPMessageReply) => void) {
    try {
      if (this.mcpClientProcess && this.mcpServerProcess) {
        this.logger.error("MCP processes already started. Cannot start again.");
        return;
      }

      this.cleanupProcesses();

      const { port1, port2 } = new MessageChannelMain();

      const mcpClientPath = this.getMCPPath(this.config.clientFileName);
      const mcpServerPath = this.getMCPPath(this.config.server.fileName);

      this.mcpServerProcess = new MCPProcess(
        mcpServerPath,
        this.config.server.args,
        port1
      );
      this.mcpClientProcess = new MCPProcess(mcpClientPath, [], port2);

      this.mcpClientProcess.onmessage = onClientMessage;

      this.mcpServerProcess.start();
      this.mcpClientProcess.start();
    } catch (error) {
      this.logger.error("Error starting MCP processes:", error);
    }
  }

  public cleanupProcesses() {
    if (this.mcpClientProcess) {
      this.mcpClientProcess.cleanup();
      this.mcpClientProcess = null;
    }
    if (this.mcpServerProcess) {
      this.mcpServerProcess.cleanup();
      this.mcpServerProcess = null;
    }
  }

  public getClientProcess(): MCPProcess | null {
    return this.mcpClientProcess;
  }

  public sendMessage(message: MCPMessage) {
    if (this.mcpClientProcess) {
      this.mcpClientProcess.send(message);
    } else {
      this.logger.error("MCP Client Process not found. Cannot send message.");
    }
  }

  private getMCPPath(filename: string): string {
    if (app.isPackaged) {
      return path.join(process.resourcesPath, filename);
    }
    return path.join(__dirname, filename);
  }
}
