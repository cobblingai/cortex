import {
  app,
  BrowserWindow,
  utilityProcess,
  UtilityProcess,
  ipcMain,
  Menu,
} from "electron";
import path, { dirname } from "node:path";
import started from "electron-squirrel-startup";
import { fileURLToPath } from "node:url";
import type { MCPMessage } from "@/types/mcp.js";
import { configManager } from "@/lib/config-manager.js";
import { template } from "./menu/template.js";

const inDevelopment = !app.isPackaged;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MCP Process Management
let mcpClientProcess: UtilityProcess | null = null;
let mcpServerProcess: UtilityProcess | null = null;
let mainWindow: BrowserWindow | null = null;
let restartAttempts = 0;
const MAX_RESTART_ATTEMPTS = 3;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const startMCPProcesses = () => {
  if (restartAttempts >= MAX_RESTART_ATTEMPTS) {
    console.error("Maximum restart attempts reached. Stopping MCP processes.");
    return;
  }

  try {
    let mcpClientPath = path.join(__dirname, "client.js.mjs");
    let mcpServerPath = path.join(__dirname, "server.js.mjs");
    if (app.isPackaged) {
      mcpClientPath = path.join(process.resourcesPath, "client.js.mjs");
      mcpServerPath = path.join(process.resourcesPath, "server.js.mjs");
    }

    // Start MCP Client Process
    mcpClientProcess = utilityProcess.fork(mcpClientPath, [], {
      stdio: "pipe",
    });

    // Start MCP Server Process
    mcpServerProcess = utilityProcess.fork(mcpServerPath, [], {
      stdio: "pipe",
    });

    // Add error handlers
    mcpClientProcess.on("error", (error) => {
      console.error("MCP Client Process error:", error);
      mcpClientProcess = null;
      restartAttempts++;
    });

    mcpServerProcess.on("error", (error) => {
      console.error("MCP Server Process error:", error);
      mcpServerProcess = null;
      restartAttempts++;
    });

    // Handle MCP Client Process Events
    mcpClientProcess.on("message", (message: MCPMessage) => {
      console.log("MCP Client Message:", message);
      // Forward messages to renderer or handle as needed
      mainWindow?.webContents.send("mcp-message-reply", message);
    });

    mcpClientProcess.on("exit", (code: number) => {
      console.log("MCP Client Process exited with code:", code);
      mcpClientProcess = null;
      // Attempt to restart if not a clean exit
      if (code !== 0) {
        restartAttempts++;
        console.log(
          "MCP Client Process error buffer:",
          errorBuffer.toString("utf8")
        );
        setTimeout(startMCPProcesses, 1000);
      }
    });

    // Handle MCP Server Process Events
    mcpServerProcess.on("message", (message: MCPMessage) => {
      console.log("MCP Server Message:", message);
      // Forward messages to renderer or handle as needed
    });

    mcpServerProcess.on("exit", (code: number) => {
      console.log("MCP Server Process exited with code:", code);
      mcpServerProcess = null;
      // Attempt to restart if not a clean exit
      if (code !== 0) {
        restartAttempts++;
        setTimeout(startMCPProcesses, 1000);
      }
    });

    // Handle process spawn events
    mcpClientProcess.on("spawn", () => {
      console.log("MCP Client Process spawned successfully");
      restartAttempts = 0;
    });

    mcpServerProcess.on("spawn", () => {
      console.log("MCP Server Process spawned successfully");
      restartAttempts = 0;
    });

    let errorBuffer = Buffer.from([]);
    mcpClientProcess.stderr?.on("data", (data) => {
      errorBuffer = Buffer.concat([errorBuffer, data]);
      // console.error("MCP Client Process stderr:", data);
    });

    mcpClientProcess.stdout?.on("data", (data) => {
      const buffer = Buffer.concat([errorBuffer, data]);
      console.log("MCP Client Process stdout:", buffer.toString("utf8"));
    });
  } catch (error) {
    console.error("Error starting MCP processes:", error);
    restartAttempts++;
  }
};

const stopMCPProcesses = () => {
  if (mcpClientProcess) {
    mcpClientProcess.kill();
    mcpClientProcess = null;
  }
  if (mcpServerProcess) {
    mcpServerProcess.kill();
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
  if (inDevelopment) {
    mainWindow.webContents.openDevTools();
  }
};

const createAppMenu = () => {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createAppMenu();
  createWindow();
  startMCPProcesses();
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

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Clean up MCP processes before quitting
app.on("before-quit", () => {
  stopMCPProcesses();
});

// Handle IPC messages from renderer
ipcMain.on("mcp-message", (event, message: MCPMessage) => {
  if (mcpClientProcess) {
    mcpClientProcess.postMessage(message);
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

ipcMain.handle("remove-api-key", async (_, service: "openai" | "anthropic") => {
  await configManager.removeApiKey(service);
});

ipcMain.on("open-model-settings", () => {
  console.log("Open model settings");
  mainWindow?.webContents.send("open-model-settings");
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
