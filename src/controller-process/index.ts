import { viewMessageSchema } from "@/types/view-message.js";
import { Controller } from "./controller/index.js";
import { ControllerMessage } from "@/types/controller-message.js";

if (!process.parentPort) {
  console.error("[Controller] must be spawned via utilityProcess.fork()");
  process.exit(1);
}

const controller = new Controller((message: ControllerMessage) => {
  process.parentPort.postMessage(message);
});
console.info("[Controller] started");

process.parentPort.on("message", (message: Electron.MessageEvent) => {
  console.info("[Controller] received message:", message);

  try {
    const viewMessage = viewMessageSchema.parse(message.data);
    controller.handleViewMessage(viewMessage).catch((error) => {
      console.error("[Controller] error handling view message:", error);
    });
  } catch (error) {
    console.error("[Controller] error parsing message:", error);
  }
});
