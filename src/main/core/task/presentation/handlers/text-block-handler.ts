// import { AssistantMessageContentBlock } from "@/types/assistant-message/index.js";
// import type { Task } from "../../task.js";

// export async function handleTextBlock(
//   task: Task,
//   block: AssistantMessageContentBlock
// ) {
//   if (block.type !== "text") {
//     return;
//   }

//   const cleaned =
//     block.content
//       ?.replace(/<thinking>\s?/g, "")
//       .replace(/\s?<\/thinking>/g, "")
//       .trim() ?? "";
//   await task.say("text", cleaned, undefined, block.partial);
// }
