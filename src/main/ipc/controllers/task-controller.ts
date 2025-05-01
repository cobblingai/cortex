import { callWorker } from "@/main/utils/call-worker.js";
import { ipcChannels } from "@/shared/ipc-channels.js";
import { initializeTaskSchema } from "@/types/controller-message.js";
import { ipcMain, UtilityProcess } from "electron";

export function registerTaskController(domainWorker: UtilityProcess) {
  ipcMain.handle(ipcChannels.task.initialize, async (_event, args) => {
    const initializeTaskMessage = initializeTaskSchema.parse(args);
    const result = await callWorker(domainWorker, "task", "initialize", [
      initializeTaskMessage,
    ]);
    return result;
  });

  ipcMain.handle(ipcChannels.task.abort, async (_event, args) => {
    await callWorker(domainWorker, "task", "abort", []);
  });
}
