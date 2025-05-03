import { callWorker } from "@/main/utils/call-worker.js";
import { ipcChannels } from "@/shared/ipc-channels.js";
import { newTaskSchema } from "@/types/controller-message.js";
import { ipcMain, UtilityProcess } from "electron";

export function registerTaskController(domainWorker: UtilityProcess) {
  ipcMain.handle(ipcChannels.task.newTask, async (_event, args) => {
    const newTaskMessage = newTaskSchema.parse(args);
    const result = await callWorker(domainWorker, "task", "newTask", [
      newTaskMessage,
    ]);
    return result;
  });

  ipcMain.handle(ipcChannels.task.abort, async (_event, args) => {
    await callWorker(domainWorker, "task", "abort", []);
  });
}
