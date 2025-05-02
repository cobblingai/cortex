import { Logger } from "@/main/utils/logger.js";
import { ipcChannels } from "@/shared/ipc-channels.js";
import { ViewMessage } from "@/types/view-message.js";
import { UtilityProcess, webContents, WebContents } from "electron";

export function registerStdoutStderrEvents(
  domainWorker: UtilityProcess,
  logger: Logger
) {
  domainWorker.stdout?.on("data", (data) => {
    logger.info(data.toString("utf-8"));
  });

  domainWorker.stderr?.on("data", (data) => {
    logger.error(data.toString("utf-8"));
  });
}
