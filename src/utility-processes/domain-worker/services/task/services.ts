import { InitializeTaskMessage } from "@/types/controller-message.js";

export async function initialize(message: InitializeTaskMessage) {
  console.log("initialize", message);
  const taskId = message.id;
  return {
    id: taskId,
    status: "initialized",
  };
}

export async function abort() {
  console.log("abort");
}
