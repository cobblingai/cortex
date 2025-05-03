import { NewTaskMessage } from "@/types/controller-message.js";
import { Task } from "./entity.js";
import { ViewMessage } from "@/types/view-message.js";

let currentTask: Task | null = null;

export async function newTask(message: NewTaskMessage) {
  console.log("newTask", message);
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
  currentTask.start();

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
