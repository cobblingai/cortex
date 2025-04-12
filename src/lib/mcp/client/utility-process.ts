import {
  serializeMessage,
  deserializeMessage,
} from "@modelcontextprotocol/sdk/shared/stdio.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import { MessagePortMain } from "electron";

export class UtilityProcessClientTransport implements Transport {
  private _started = false;

  onclose?: (() => void) | undefined;
  onerror?: ((error: Error) => void) | undefined;
  onmessage?: ((message: JSONRPCMessage) => void) | undefined;
  sessionId?: string | undefined;

  constructor(private port: MessagePortMain) {}

  async start(): Promise<void> {
    if (this._started) {
      throw new Error(
        "UtilityProcessClientTransport already started! If using Server class, note that connect() calls start() automatically."
      );
    }

    this._started = true;

    this.port.on("message", (messageEvent: Electron.MessageEvent) => {
      const message = deserializeMessage(messageEvent.data);
      this.onmessage?.(message);
    });

    this.port.on("close", () => {
      this.onclose?.();
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
