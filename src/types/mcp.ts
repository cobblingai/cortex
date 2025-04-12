import { ChatMessage } from "./file-system";

export interface MCPMessage {
  id: string;
  type: "mcp-message";
  payload: {
    model: string;
    apiKey: string;
    messages: ChatMessage[];
  };
  timestamp: number;
}

export interface MCPMessageReply {
  id: string;
  type: "mcp-message-reply";
  payload: {
    message: string;
  };
  timestamp: number;
}
