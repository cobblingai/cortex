import { Logger } from "@/main/utils/logger.js";
import { UtilityProcess } from "electron";

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
