import { NewTaskMessage } from "@/types/controller-message.js";
import { Task } from "./entity.js";
import { ViewMessage } from "@/types/view-message.js";
import { ViewState } from "../../ui/view-state.js";
import { postStateToView } from "../../ui/index.js";

let currentTask: Task | null = null;

export async function newTask(message: NewTaskMessage) {
  console.log("[Task] newTask", message);
  if (currentTask) {
    console.log("[Task] aborting previous task:", currentTask.id);
    currentTask.abort();
    currentTask = null;
  }

  currentTask = new Task(
    "initialized",
    message.payload.text,
    message.payload.context
  );
  currentTask.start();

  return {
    id: currentTask.id,
    status: currentTask.status,
  };
}

export async function abort() {
  console.log("[Task] abort");
  if (currentTask) {
    currentTask.abort();
    currentTask = null;
    postStateToView(new ViewState());
  }
}
