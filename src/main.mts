import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  MessageChannelMain,
} from "electron";
import path, { dirname } from "node:path";
import started from "electron-squirrel-startup";
import { fileURLToPath } from "node:url";
import type { MCPMessage, MCPMessageReply } from "@/types/mcp.js";
import { configManager } from "@/lib/config-manager.js";
import { template } from "./menu/template.js";
// import { MCPProcess } from "./mcp/process.js";
import { MCPProcess } from "./mcp/mcp-process.js";

const inDevelopment = !app.isPackaged;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MCP Process Management
// let mcpProcess: UtilityProcess | null = null;
let mcpClientProcess: MCPProcess | null = null;
let mcpServerProcess: MCPProcess | null = null;
let mainWindow: BrowserWindow | null = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const startMCPProcesses = () => {
  try {
    let mcpClientPath = path.join(__dirname, "mcp-client.mjs");
    let mcpServerPath = path.join(__dirname, "mcp-server.mjs");
    if (app.isPackaged) {
      mcpClientPath = path.join(process.resourcesPath, "mcp-client.mjs");
      mcpServerPath = path.join(process.resourcesPath, "mcp-server.mjs");
    }

    const { port1, port2 } = new MessageChannelMain();

    mcpServerProcess = new MCPProcess(mcpServerPath, [], port1);
    mcpClientProcess = new MCPProcess(mcpClientPath, [], port2);

    mcpClientProcess.onmessage = (message: MCPMessageReply) => {
      console.log(
        "MCP Client Process Message reply sent to renderer:",
        message
      );
      if (!mainWindow) {
        console.error(
          "Main window not found. Cannot send message to renderer."
        );
        return;
      }
      mainWindow.webContents.send("mcp-message-reply", message);
    };

    mcpServerProcess.start();
    mcpClientProcess.start();
  } catch (error) {
    console.error("Error starting MCP processes:", error);
  }
};

const stopMCPProcesses = () => {
  if (mcpClientProcess) {
    mcpClientProcess.cleanup();
    mcpClientProcess = null;
  }
  if (mcpServerProcess) {
    mcpServerProcess.cleanup();
    mcpServerProcess = null;
  }
};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // devTools: inDevelopment,
      // contextIsolation: true,
      // nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  // if (inDevelopment) {
  mainWindow.webContents.openDevTools();
  // }
};

const createAppMenu = () => {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

/**
 * When the app is ready, create the app menu, create the window, start the MCP processes, and handle the activate event.
 * Then, handle the API key management IPC handlers.
 *
 * Note: Electron exposes app.whenReady() as a helper specifically for the ready event to avoid subtle pitfalls with
 * directly listening to that event in particular. See electron/electron#21972 for details.
 */
app.whenReady().then(() => {
  createAppMenu();
  createWindow();

  app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Handle IPC messages from renderer
  ipcMain.on("mcp-message", (_event, message: MCPMessage) => {
    console.log("MCP Message received from renderer:", message);

    startMCPProcesses();

    if (mcpClientProcess) {
      mcpClientProcess.send(message);
    } else {
      console.error("MCP Client Process not found. Cannot send message.");
    }
  });

  // API Key Management IPC Handlers
  ipcMain.handle(
    "set-api-key",
    async (_, service: "openai" | "anthropic", apiKey: string) => {
      await configManager.setApiKey(service, apiKey);
    }
  );

  ipcMain.handle("get-api-key", async (_, service: "openai" | "anthropic") => {
    return await configManager.getApiKey(service);
  });

  ipcMain.handle(
    "remove-api-key",
    async (_, service: "openai" | "anthropic") => {
      await configManager.removeApiKey(service);
    }
  );

  ipcMain.on("open-settings", () => {
    console.log("Open settings");
    mainWindow?.webContents.send("open-settings");
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    stopMCPProcesses();
    app.quit();
  }
});

// Clean up MCP processes before quitting
app.on("before-quit", () => {
  stopMCPProcesses();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
