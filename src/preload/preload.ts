// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { MCPMessage } from "@/types/mcp.js";
import { ControllerMessage } from "@/types/controller-message.js";
import { ViewMessage } from "@/types/view-message.js";
import { ipcChannels } from "@/shared/ipc-channels.js";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  // ipcRenderer: {
  //   send: (channel: string, data: any) => {
  //     // whitelist channels
  //     const validChannels = ["mcp-message"];
  //     if (validChannels.includes(channel)) {
  //       ipcRenderer.invoke(channel, data);
  //     }
  //   },
  //   on: (channel: string, func: (...args: any[]) => void) => {
  //     const validChannels = ["mcp-message-reply", "open-settings"];
  //     if (validChannels.includes(channel)) {
  //       // Strip event as it includes `sender`
  //       ipcRenderer.on(channel, (event, ...args) => func(...args));
  //     }
  //   },
  //   removeListener: (channel: string, func: (...args: any[]) => void) => {
  //     const validChannels = ["mcp-message-reply", "open-settings"];
  //     if (validChannels.includes(channel)) {
  //       ipcRenderer.removeListener(channel, func);
  //     }
  //   },
  // },

  apiKeys: {
    set: (service: "openai" | "anthropic", apiKey: string) =>
      ipcRenderer.invoke("set-api-key", service, apiKey),
    get: (service: "openai" | "anthropic") =>
      ipcRenderer.invoke("get-api-key", service),
    remove: (service: "openai" | "anthropic") =>
      ipcRenderer.invoke("remove-api-key", service),
  },

  mcp: {
    send: (message: MCPMessage) => ipcRenderer.send("mcp-message", message),
    onReply: (callback: (message: MCPMessage) => void) =>
      ipcRenderer.on("mcp-message-reply", (_event, message: MCPMessage) =>
        callback(message)
      ),
    removeListener: (callback: (message: MCPMessage) => void) => {
      ipcRenderer.removeListener(
        "mcp-message-reply",
        (_event, message: MCPMessage) => callback(message)
      );
    },
  },

  controller: {
    send: (message: ControllerMessage) =>
      ipcRenderer.send(ipcChannels.controller.message, message),
    onViewMessage: (callback: (message: ViewMessage) => void) =>
      ipcRenderer.on(
        ipcChannels.controller.message,
        (_event, message: ViewMessage) => callback(message)
      ),
    removeListener: (callback: (message: ViewMessage) => void) => {
      ipcRenderer.removeListener(
        ipcChannels.controller.message,
        (_event, message: ViewMessage) => callback(message)
      );
    },
  },

  settings: {
    onOpen: (callback: () => void) =>
      ipcRenderer.on("open-settings", () => callback()),
    removeListener: (callback: () => void) => {
      ipcRenderer.removeListener("open-settings", () => callback());
    },
  },
});
