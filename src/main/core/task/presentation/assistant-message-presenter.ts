// import type { Task } from "../task.js";
// import {
//   toolParamNames,
//   ToolUseName,
//   toolUseNames,
//   type AssistantMessageContentBlock,
//   type TextContent,
//   type ToolParamName,
//   type ToolUse,
// } from "@/types/assistant-message/index.js";
// import { handleTextBlock } from "./handlers/text-block-handler.js";
// import { handleToolUseBlock } from "./handlers/tool-use-block-handler.js";
// import { Queue } from "@/lib/queue/index.js";

// export class AssistantMessagePresenter {
//   private queue: Queue<AssistantMessageContentBlock>;

//   /**
//    * Creates a new AssistantMessagePresenter
//    * @param task - The task to present messages for
//    */
//   constructor(private task: Task) {
//     this.queue = new Queue(this.handleBlock);
//   }

//   /**
//    * Starts processing a new message. Note: this will not block the calling thread.
//    * @param message - The message to process
//    */
//   startProcessing(message: string) {
//     this.queue.enqueueMany(this.parseAssistantMessage(message));
//   }

//   isEmpty() {
//     return this.queue.isEmpty();
//   }

//   clear() {
//     this.queue.clear();
//   }

//   private async handleBlock(
//     block: AssistantMessageContentBlock
//   ): Promise<void> {
//     switch (block.type) {
//       case "text":
//         await handleTextBlock(this.task, block);
//         break;
//       case "tool_use":
//         await handleToolUseBlock(this.task, block);
//         break;
//       default:
//         throw new Error(`Unknown block type: ${(block as any).type}`);
//     }
//   }

//   private parseAssistantMessage(message: string) {
//     const contentBlocks: AssistantMessageContentBlock[] = [];
//     let currentTextContent: TextContent | undefined = undefined;
//     let currentTextContentStartIndex = 0;
//     let currentToolUse: ToolUse | undefined = undefined;
//     let currentToolUseStartIndex = 0;
//     let currentParamName: ToolParamName | undefined = undefined;
//     let currentParamValueStartIndex = 0;
//     let accumulator = "";

//     for (let i = 0; i < message.length; i++) {
//       const char = message[i];
//       accumulator += char;

//       // there should not be a param without a tool use
//       if (currentToolUse && currentParamName) {
//         const currentParamValue = accumulator.slice(
//           currentParamValueStartIndex
//         );
//         const paramClosingTag = `</${currentParamName}>`;
//         if (currentParamValue.endsWith(paramClosingTag)) {
//           // end of param value
//           currentToolUse.params[currentParamName] = currentParamValue
//             .slice(0, -paramClosingTag.length)
//             .trim();
//           currentParamName = undefined;
//           continue;
//         } else {
//           // partial param value is accumulating
//           continue;
//         }
//       }

//       // no currentParamName

//       if (currentToolUse) {
//         const currentToolValue = accumulator.slice(currentToolUseStartIndex);
//         const toolUseClosingTag = `</${currentToolUse.name}>`;
//         if (currentToolValue.endsWith(toolUseClosingTag)) {
//           // end of a tool use
//           currentToolUse.partial = false;
//           contentBlocks.push(currentToolUse);
//           currentToolUse = undefined;
//           continue;
//         } else {
//           const possibleParamOpeningTags = toolParamNames.map(
//             (name) => `<${name}>`
//           );
//           for (const paramOpeningTag of possibleParamOpeningTags) {
//             if (accumulator.endsWith(paramOpeningTag)) {
//               // start of a new parameter
//               currentParamName = paramOpeningTag.slice(1, -1) as ToolParamName;
//               currentParamValueStartIndex = accumulator.length;
//               break;
//             }
//           }

//           // partial tool value is accumulating
//           continue;
//         }
//       }

//       // no currentToolUse

//       let didStartToolUse = false;
//       const possibleToolUseOpeningTags = toolUseNames.map(
//         (name) => `<${name}>`
//       );
//       for (const toolUseOpeningTag of possibleToolUseOpeningTags) {
//         if (accumulator.endsWith(toolUseOpeningTag)) {
//           // start of a new tool use
//           currentToolUse = {
//             type: "tool_use",
//             name: toolUseOpeningTag.slice(1, -1) as ToolUseName,
//             params: {},
//             partial: true,
//           };
//           currentToolUseStartIndex = accumulator.length;
//           // this also indicates the end of the current text content
//           if (currentTextContent) {
//             currentTextContent.partial = false;
//             // remove the partially accumulated tool use tag from the end of text (<tool)
//             currentTextContent.content = currentTextContent.content
//               .slice(0, -toolUseOpeningTag.slice(0, -1).length)
//               .trim();
//             contentBlocks.push(currentTextContent);
//             currentTextContent = undefined;
//           }

//           didStartToolUse = true;
//           break;
//         }
//       }

//       if (!didStartToolUse) {
//         // no tool use, so it must be text either at the beginning or between tools
//         if (currentTextContent === undefined) {
//           currentTextContentStartIndex = i;
//         }
//         currentTextContent = {
//           type: "text",
//           content: accumulator.slice(currentTextContentStartIndex).trim(),
//           partial: true,
//         };
//       }
//     }

//     if (currentToolUse) {
//       // stream did not complete tool call, add it as partial
//       if (currentParamName) {
//         // tool call has a parameter that was not completed
//         currentToolUse.params[currentParamName] = accumulator
//           .slice(currentParamValueStartIndex)
//           .trim();
//       }
//       contentBlocks.push(currentToolUse);
//     }

//     // Note: it doesn't matter if check for currentToolUse or currentTextContent, only one of them will be defined since only one can be partial at a time
//     if (currentTextContent) {
//       // stream did not complete text content, add it as partial
//       contentBlocks.push(currentTextContent);
//     }

//     return contentBlocks;
//   }
// }
