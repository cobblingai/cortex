import { controllerMessageSchema } from "@/types/controller-message.js";
import { Controller } from "./controller/index.js";
import { ViewMessage } from "@/types/view-message.js";
if (!process.parentPort) {
  console.error("[Controller] must be spawned via utilityProcess.fork()");
  process.exit(1);
}

const controller = new Controller((message: ViewMessage) => {
  process.parentPort.postMessage(message);
});
console.info("[Controller] started");

process.parentPort.on("message", (message: Electron.MessageEvent) => {
  console.info("[Controller] received message:", message);

  try {
    const controllerMessage = controllerMessageSchema.parse(message.data);
    controller.handleControllerMessage(controllerMessage).catch((error) => {
      console.error("[Controller] error handling controller message:", error);
    });
  } catch (error) {
    console.error("[Controller] error parsing message:", error);
  }
});
