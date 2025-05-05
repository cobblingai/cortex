import { ipcChannels } from "@/shared/ipc-channels.js";
import { ViewMessage } from "@/types/view-message.js";
import { UtilityProcess, WebContents } from "electron";

export function registerViewEvents(
  domainWorker: UtilityProcess,
  webContents: WebContents
) {
  domainWorker.on("message", (message: ViewMessage) => {
    webContents.send(ipcChannels.view.message, message);
  });
}
