import { InitializeTaskMessage } from "@/types/controller-message.js";
import { Task } from "./entity.js";
import { ViewMessage } from "@/types/view-message.js";

let currentTask: Task | null = null;

export async function initialize(message: InitializeTaskMessage) {
  console.log("initialize", message);
  if (currentTask) {
    console.log("aborting previous task:", currentTask.id);
    currentTask.abort();
    currentTask = null;
  }

  currentTask = new Task(
    "initialized",
    message.payload.text,
    message.payload.context,
    (message: ViewMessage) => {
      process.parentPort.postMessage(message);
    }
  );
  // Don't await this, it will block the main thread
  currentTask.runAgenticLoop();

  return {
    id: currentTask.id,
    status: currentTask.status,
  };
}

export async function abort() {
  console.log("abort");
  if (currentTask) {
    currentTask.abort();
    currentTask = null;
  }
}
