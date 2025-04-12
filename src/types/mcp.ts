export interface MCPMessage {
  id: string;
  type: "mcp-message";
  payload: {
    model: string;
    apiKey: string;
    message: string;
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
