import type {
  ControllerMessage,
  InitializeTaskMessage,
} from "@/types/controller-message.js";
import type { ViewMessage } from "@/types/view-message.js";
import { MCPMessageReply } from "./mcp.js";
import { MCPMessage } from "./mcp.js";

declare global {
  const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
  const MAIN_WINDOW_VITE_NAME: string;

  interface Window {
    electron: {
      apiKeys: {
        set(service: "openai" | "anthropic", apiKey: string): Promise<void>;
        get(service: "openai" | "anthropic"): Promise<string | null>;
        remove(service: "openai" | "anthropic"): Promise<void>;
      };
      mcp: {
        send(message: MCPMessage): void;
        onReply(callback: (message: MCPMessageReply) => void): void;
        removeListener(callback: (message: MCPMessageReply) => void): void;
      };
      controller: {
        send(message: ControllerMessage): void;
        onViewMessage(callback: (message: ViewMessage) => void): void;
        removeListener(callback: (message: ViewMessage) => void): void;
      };
      settings: {
        onOpen(callback: () => void): void;
        removeListener(callback: () => void): void;
      };
      taskApi: {
        initialize(message: InitializeTaskMessage): Promise<any>;
        abort(): Promise<void>;
      };
    };
  }
}

export {};
