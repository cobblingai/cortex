// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel: string, data: any) => {
      // whitelist channels
      const validChannels = ["mcp-message"];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      const validChannels = ["mcp-message-reply", "open-settings"];
      if (validChannels.includes(channel)) {
        // Strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    removeListener: (channel: string, func: (...args: any[]) => void) => {
      const validChannels = ["mcp-message-reply", "open-settings"];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
  },

  apiKeys: {
    set: (service: "openai" | "anthropic", apiKey: string) =>
      ipcRenderer.invoke("set-api-key", service, apiKey),
    get: (service: "openai" | "anthropic") =>
      ipcRenderer.invoke("get-api-key", service),
    remove: (service: "openai" | "anthropic") =>
      ipcRenderer.invoke("remove-api-key", service),
  },
});
