import { controllerMessageSchema } from "@/types/controller-message.js";
import { Controller } from "./controller/index.js";
import { ViewMessage } from "@/types/view-message.js";
import { ResponseMessage } from "./types.js";
import { RequestMessage } from "./types.js";
import * as taskService from "./services/task/service.js";

if (!process.parentPort) {
  console.error("[Models service] must be spawned via utilityProcess.fork()");
  process.exit(1);
}

// const controller = new Controller((message: ViewMessage) => {
//   process.parentPort.postMessage(message);
// });
// console.info("[Controller] started");

// process.parentPort.on("message", (message: Electron.MessageEvent) => {
//   console.info("[Controller] received message:", message);

//   try {
//     const controllerMessage = controllerMessageSchema.parse(message.data);
//     controller.handleControllerMessage(controllerMessage).catch((error) => {
//       console.error("[Controller] error handling controller message:", error);
//     });
//   } catch (error) {
//     console.error("[Controller] error parsing message:", error);
//   }
// });

const registry: Record<string, Record<string, Function>> = {
  task: {
    initialize: taskService.initialize,
    abort: taskService.abort,
  },
};

process.parentPort.on("message", async (msg: Electron.MessageEvent) => {
  const { id, service, action, args } = msg.data as RequestMessage;
  const resp: ResponseMessage = { id };

  try {
    const svc = registry[service];
    if (!svc) throw new Error(`Unknown service "${service}"`);

    const fn = svc[action];
    if (typeof fn !== "function")
      throw new Error(`Unknown action "${action}" on "${service}"`);

    // Optionally: validate args with Zod/Joi here before calling
    resp.result = await fn(...args);
  } catch (err: any) {
    resp.error = err instanceof Error ? err.message : String(err);
  }

  process.parentPort.postMessage(resp);
});
