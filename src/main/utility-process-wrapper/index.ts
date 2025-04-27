import { Logger } from "@/main/utils/logger.js";
import { ControllerMessage } from "@/types/controller-message.js";
import { ViewMessage } from "@/types/view-message.js";
import { utilityProcess, UtilityProcess } from "electron";

const logger = Logger.getInstance();

class UtilityProcessWrapper {
  private process: UtilityProcess | null = null;
  private modulePath: string;
  private args: string[];

  onmessage?: ((message: ControllerMessage) => Promise<void>) | undefined;
  onerror?: ((error: Error | string) => void) | undefined;
  onclose?: (() => void) | undefined;

  constructor(scriptPath: string, args: string[]) {
    this.modulePath = scriptPath;
    this.args = args;
  }

  start() {
    logger.info(`Starting utility process: ${this.modulePath}`);
    if (this.process) {
      throw new Error(`Utility process: ${this.modulePath} already started`);
    }

    this.process = utilityProcess.fork(this.modulePath, this.args, {
      stdio: "pipe",
    });

    this.listenToMessagesFromUtilityProcess(async (message) => {
      await this.onmessage?.(message);
    });

    this.process.stderr?.on("data", (data) => {
      const s = data.toString("utf-8");
      logger.error(`Utility process: ${this.modulePath} stderr: ${s}`);
    });
    this.process.stderr?.on("error", (error) => {
      logger.error(
        `Utility process: ${this.modulePath} stderr error: ${error}`
      );
    });

    this.process.stdout?.on("data", (data) => {
      const s = data.toString("utf-8");
      logger.info(`Utility process: ${this.modulePath} stdout: ${s}`);
    });

    this.process.on("error", (error) => {
      logger.error(`Utility process: ${this.modulePath} error: ${error}`);
      this.onerror?.(error);
    });

    this.process.on("exit", (code) => {
      logger.info(
        `Utility process: ${this.modulePath} exited with code ${code}`
      );
      this.onclose?.();
    });
  }

  private listenToMessagesFromUtilityProcess(
    callback: (message: ControllerMessage) => Promise<void>
  ) {
    this.process?.on("message", async (message: ControllerMessage) => {
      await callback(message);
    });
  }

  postMessageToUtilityProcess(message: ViewMessage) {
    if (this.process) {
      logger.info("Sending message to utility process:", message);
      this.process.postMessage(message);
    } else {
      logger.error("Utility process not found. Cannot send message.");
    }
  }

  cleanup() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}

export { UtilityProcessWrapper };
