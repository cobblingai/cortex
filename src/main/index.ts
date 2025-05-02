import { app, BrowserWindow, ipcMain, Menu } from "electron";
import path, { dirname } from "node:path";
import started from "electron-squirrel-startup";
import { fileURLToPath } from "node:url";
import type { MCPMessage, MCPMessageReply } from "@/types/mcp.js";
import { configManager } from "@/lib/config-manager.js";
import { getMenuTemplate } from "./menu/template.js";
import { Logger } from "./utils/logger.js";
import { MCPProcessManager } from "./mcp/mcp-process-manager.js";
import { UtilityProcessWrapper } from "./utility-process-wrapper/index.js";
import { ipcChannels } from "@/shared/ipc-channels.js";
import { ViewMessage } from "@/types/view-message.js";
import { ControllerMessage } from "@/types/controller-message.js";
import { spawnDomainWorker } from "./processes.js";
import { registerTaskController } from "./ipc/controllers/task-controller.js";
import { registerViewEvents } from "./ipc/events/view-events.js";
import { registerStdoutStderrEvents } from "./ipc/events/stdout-stderr-events.js";

const inDevelopment = !app.isPackaged;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logger = Logger.getInstance();

let controllerProcess: UtilityProcessWrapper | null = null;

// MCP Process Management
const mcpProcessManager = MCPProcessManager.getInstance({
  clientFileName: "mcp-client.js",
  server: {
    fileName: "filesystem-es.js",
    args: [],
  },
});
let mainWindow: BrowserWindow | null = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const startMCPProcesses = () => {
  try {
    mcpProcessManager.startProcesses((message: MCPMessageReply) => {
      logger.info(
        "MCP Client Process Message reply sent to renderer:",
        message
      );
      if (!mainWindow) {
        logger.error("Main window not found. Cannot send message to renderer.");
        return;
      }
      mainWindow.webContents.send("mcp-message-reply", message);
    });
  } catch (error) {
    logger.error("Error starting MCP processes:", error);
  }
};

const stopMCPProcesses = () => {
  mcpProcessManager.cleanupProcesses();
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
  if (inDevelopment) {
    mainWindow.webContents.openDevTools();
  }
};

const createAppMenu = (onOpenSettings: () => void) => {
  const menu = Menu.buildFromTemplate(getMenuTemplate(onOpenSettings));
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
  createWindow();
  if (!mainWindow?.webContents) {
    logger.error("Main window not found. Cannot register view events.");
    return;
  }

  createAppMenu(() => mainWindow?.webContents.send("open-settings"));

  // initializeControllerProcess();

  const domainWorker = spawnDomainWorker();

  registerTaskController(domainWorker);
  registerViewEvents(domainWorker, mainWindow.webContents);
  registerStdoutStderrEvents(domainWorker, logger);

  app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Handle IPC messages from renderer
  ipcMain.on("mcp-message", (_event, message: MCPMessage) => {
    logger.info("MCP Message received from renderer:", message);

    startMCPProcesses();

    mcpProcessManager.sendMessage(message);
  });

  ipcMain.on(
    ipcChannels.controller.message,
    (_event, message: ControllerMessage) => {
      logger.info("Controller Message received from renderer:", message);
      controllerProcess?.postMessageToUtilityProcess(message);
    }
  );

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

  // ipcMain.on("open-settings", () => {
  //   logger.info("Open settings");
  //   mainWindow?.webContents.send("open-settings");
  // });
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

const getUtilityProcessModulePath = (filename: string): string => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, filename);
  }
  return path.join(__dirname, filename);
};

const initializeControllerProcess = () => {
  controllerProcess = new UtilityProcessWrapper(
    getUtilityProcessModulePath("controller-process-es.js"),
    []
  );
  controllerProcess.onmessage = async (message: ViewMessage) => {
    logger.info("Controller Process sending message to renderer:", message);
    mainWindow?.webContents.send(ipcChannels.view.message, message);
  };
  controllerProcess.start();
};
