import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import { MessagePortMain } from "electron";
import {
  deserializeMessage,
  serializeMessage,
} from "@modelcontextprotocol/sdk/shared/stdio.js";

export class UtilityProcessServerTransport implements Transport {
  sessionId?: string | undefined;
  onclose?: (() => void) | undefined;
  onerror?: ((error: Error) => void) | undefined;
  onmessage?: ((message: JSONRPCMessage) => void) | undefined;

  constructor(private port: MessagePortMain) {}

  async start(): Promise<void> {
    this.port.on("message", (messageEvent: Electron.MessageEvent) => {
      const message = deserializeMessage(messageEvent.data);
      this.onmessage?.(message);
    });
    this.port.start();
  }

  async send(message: JSONRPCMessage): Promise<void> {
    this.port.postMessage(serializeMessage(message));
  }

  async close(): Promise<void> {
    this.port.close();
  }
}
