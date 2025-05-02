// import { ViewMessage } from "@/types/view-message.js";
// import { buildApiHandler } from "../api/index.js";
// import type { ApiProvider } from "@/types/api/index.js";
// import { ViewState } from "../view-state/index.js";
// import { TellType, UIMessage } from "@/types/chat.js";
// import Anthropic from "@anthropic-ai/sdk";
// import { AIState } from "../ai-state/index.js";
// import { AssistantMessageHandler } from "../assistant-message-handler/index.js";
// import { AssistantMessages } from "../assistant-messages/index.js";
// import { SYSTEM_PROMPT } from "../prompts/system.js";
// import pWaitFor from "p-wait-for";

// type UserContentBlock = Anthropic.ContentBlockParam;

// export class Task {
//   private readonly assistantMessages: AssistantMessages;
//   private readonly assistantMessageHandler: AssistantMessageHandler;
//   private isAborted: boolean = false;
//   constructor(
//     private readonly id: string,
//     private readonly text: string,
//     private readonly images: string[],
//     private readonly context: {
//       model: string;
//       apiKey: string;
//       apiProvider: ApiProvider;
//     },
//     private readonly viewState: ViewState,
//     private readonly aiState: AIState
//   ) {
//     this.assistantMessages = new AssistantMessages();
//     this.assistantMessageHandler = new AssistantMessageHandler(
//       this.assistantMessages,
//       this
//     );
//   }

//   /**
//    * Kicks off the task but does NOT await it.
//    * Any errors in execute() get caught and logged.
//    */
//   public start() {
//     this.execute()
//       .catch((error) => {
//         console.error(`Task ${this.id} failed`, error);
//       })
//       .finally(() => {
//         console.log(`Task ${this.id} finished`);
//       });
//   }

//   public abort() {
//     console.log(`Task ${this.id} aborted`);
//     this.isAborted = true;
//   }

//   private async execute() {
//     console.log(`Task ${this.id} executing`);

//     const apiHandler = buildApiHandler({
//       apiProvider: this.context.apiProvider,
//       apiKey: this.context.apiKey,
//       apiModelId: this.context.model,
//     });

//     const userContentBlocks: UserContentBlock[] = [
//       {
//         type: "text",
//         text: `<task>\n${this.text}\n</task>`,
//       },
//     ];

//     this.aiState.addMessage({
//       role: "user",
//       content: userContentBlocks,
//     });

//     const systemPrompt = await SYSTEM_PROMPT();
//     const stream = apiHandler.createMessage(
//       systemPrompt,
//       this.aiState.getMessages()
//     );

//     let assistantMessage = "";
//     this.assistantMessages.clear();
//     this.assistantMessageHandler.reset();

//     for await (const chunk of stream) {
//       switch (chunk.type) {
//         case "reasoning":
//           break;
//         case "usage":
//           break;
//         case "text":
//           assistantMessage += chunk.text;
//           this.assistantMessages.addChunkAndReparse(chunk.text);
//           this.assistantMessageHandler.processPendingMessages();
//           break;
//       }
//     }

//     const processedCount =
//       this.assistantMessages.setPartialMessagesToNonPartial();
//     if (processedCount > 0) {
//       this.assistantMessageHandler.processPendingMessages();
//     }

//     await pWaitFor(() =>
//       this.assistantMessageHandler.areAllMessagesProcessed()
//     );
//   }

//   public tellUser(message: {
//     type: TellType;
//     content: string;
//     isPartial?: boolean;
//   }) {
//     if (this.isAborted) {
//       return;
//     }

//     if (message.isPartial !== undefined) {
//       const lastUIMessage = this.viewState.lastUIMessage();
//       const isUpdatingLastUIMessage =
//         lastUIMessage &&
//         lastUIMessage.isPartial &&
//         lastUIMessage.type === "tell" &&
//         lastUIMessage.tellType === message.type;

//       if (message.isPartial) {
//         if (isUpdatingLastUIMessage) {
//           // update the last message
//           lastUIMessage.content += message.content;
//           this.viewState.postPartialUIMessage(lastUIMessage);
//         } else {
//           // this is a new message, so we need to add it to the view state
//           this.viewState.addUIMessage({
//             id: crypto.randomUUID(),
//             type: "tell",
//             tellType: message.type,
//             content: message.content,
//             isPartial: true,
//           });
//           this.viewState.postStateToView();
//         }
//       } else {
//         if (isUpdatingLastUIMessage) {
//           // update the last message
//           lastUIMessage.content += message.content;
//           lastUIMessage.isPartial = false;
//           this.viewState.postPartialUIMessage(lastUIMessage);
//         } else {
//           this.viewState.addUIMessage({
//             id: crypto.randomUUID(),
//             type: "tell",
//             tellType: message.type,
//             content: message.content,
//           });
//           this.viewState.postStateToView();
//         }
//       }
//     }
//   }

//   public askUser(type: string, message: string) {
//     return { text: "", images: [] };
//   }

//   public getViewState() {
//     return this.viewState;
//   }
// }
