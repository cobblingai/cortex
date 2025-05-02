import { ToolUse } from "@/types/assistant-message/index.js";
import { Task } from "../entity.js";

export async function handleToolUseBlock(task: Task, block: ToolUse) {
  return Promise.resolve();
}
