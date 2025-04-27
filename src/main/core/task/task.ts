// import { MCPMessageReply } from "@/types/mcp.js";
// import {
//   ApiHandler,
//   ApiConfiguration,
//   buildApiHandler,
// } from "@/main/api/index.js";
// import Anthropic from "@anthropic-ai/sdk";
// import { ChatMessage2 } from "@/types/chat.js";
// import { ApiStream } from "@/main/api/transform/stream.js";
// import { AssistantMessageContentBlock } from "@/types/assistant-message/index.js";
// import { formatResponse } from "../prompts/responses.js";
// import pWaitFor from "p-wait-for";
// import { BlockManager } from "./presentation/block-manager.js";
// import { AssistantMessagePresenter } from "./presentation/assistant-message-presenter.js";
// import { UserContent } from "./index.js";
// import { Queue } from "@/lib/queue/index.js";
// import { ControllerMessage } from "@/types/controller-message.js";

// export class Task {
//   public readonly taskId: string;
//   public isAborted: boolean = false;

//   private postMessageToRenderer: (message: ControllerMessage) => Promise<void>;
//   private api: ApiHandler;
//   private assistantMessageContentBlocks: AssistantMessageContentBlock[] = [];
//   private assistantMessageQueue: Queue<AssistantMessageContentBlock>;
//   /**
//    * Holds the “user” turn content that we build up as we present the assistant’s reply:
//    *  - text blocks (analysis, follow-ups, <feedback> wrappers, etc.)
//    *  - image blocks (screenshots, diagrams, etc.)
//    *
//    * Once all assistant blocks (and any tool-use results) are rendered,
//    * this array is what gets sent back into the LLM as the next user message.
//    */
//   private userMessageContent: (
//     | Anthropic.TextBlockParam
//     | Anthropic.ImageBlockParam
//   )[] = [];
//   public userMessageContentReady = false;

//   private blockManager: BlockManager;
//   private assistantMessagePresenter: AssistantMessagePresenter;

//   // Conversation history for the API
//   private apiConversationHistory: Anthropic.Messages.MessageParam[];
//   // Conversation history for the renderer
//   private rendererConversationHistory: ChatMessage2[];

//   private constructor({
//     postMessageToRenderer,
//     apiConfiguration,
//   }: {
//     postMessageToRenderer: (message: ControllerMessage) => Promise<void>;
//     apiConfiguration: ApiConfiguration;
//   }) {
//     this.taskId = Date.now().toString();
//     this.postMessageToRenderer = postMessageToRenderer;
//     this.api = buildApiHandler({
//       ...apiConfiguration,
//       taskId: this.taskId,
//     });

//     this.blockManager = new BlockManager(this.assistantMessageContentBlocks);
//     this.assistantMessagePresenter = new AssistantMessagePresenter(this);
//   }

//   static async create({
//     postMessageToRenderer,
//     apiConfiguration,
//     task,
//     images,
//   }: {
//     postMessageToRenderer: (message: ControllerMessage) => Promise<void>;
//     apiConfiguration: ApiConfiguration;
//     task?: string;
//     images?: string[];
//   }): Promise<Task> {
//     const instance = new Task({ postMessageToRenderer, apiConfiguration });
//     if (task || images) {
//       await instance.startTask(task, images);
//     }
//     return instance;
//   }

//   public abort() {
//     this.isAborted = true;
//   }

//   public async recordUserTurn(userContent: UserContent) {}

//   public consumeNextUserTurn(): UserContent {
//     throw new Error("Not implemented");
//   }

//   // Note: images are not used in the task loop
//   private async startTask(task?: string, _images?: string[]) {
//     this.apiConversationHistory = [];
//     this.rendererConversationHistory = [];

//     await this.initiateTaskLoop([
//       {
//         type: "text",
//         text: `<task>\n${task}\n</task>`,
//       },
//     ]);
//   }

//   // Entry-point into the “agentic” loop
//   private async initiateTaskLoop(userContent: UserContent): Promise<void> {
//     let nextUserContent = userContent;

//     // keep going until either the LLM does an attempt_completion
//     // or we explicitly abort
//     while (!this.isAborted) {
//       // 1) send nextUserContent → LLM, stream back tool/text chunks,
//       //    execute tools, collect everything into this.userMessageContent
//       const didEndLoop = await this.recursivelyMakeRequests(nextUserContent);

//       if (didEndLoop) {
//         // LLM issued an attempt_completion and we stopped
//         break;
//       } else {
//         nextUserContent = [
//           {
//             type: "text",
//             text: formatResponse.noToolsUsed(),
//           },
//         ];
//       }
//     }
//   }

//   /**
//    * Recursively makes requests to the API until the user content is processed
//    * @param userContent - The user content to process
//    * @returns Whether the loop should stop
//    */
//   private async recursivelyMakeRequests(
//     userContent: UserContent
//   ): Promise<boolean> {
//     const stream = this.attemptApiRequest();

//     let assistantMessage = "";
//     this.assistantMessagePresenter.clear();
//     try {
//       for await (const chunk of stream) {
//         switch (chunk.type) {
//           case "text":
//             assistantMessage += chunk.text;
//             this.assistantMessagePresenter.startProcessing(assistantMessage);
//             break;
//           case "reasoning":
//             break;
//           case "usage":
//             break;
//         }

//         if (this.isAborted) {
//           return true;
//         }
//       }

//       // Once streaming ends, wait until the last block’s tool (if any) finished running
//       await this.waitForToolAndUIUpdates();

//       // Did the LLM call attempt_completion?
//       const didAttemptCompletion = this.detectAttemptCompletion();
//       return didAttemptCompletion;
//     } catch (error) {
//       console.error(error);
//       return true;
//     }
//   }

//   private async waitForToolAndUIUpdates() {
//     // 1. Ensure any partial blocks are finalized and presented
//     this.assistantMessageContentBlocks.forEach((b) => (b.partial = false));
//     this.presentAssistantMessage();

//     // 2. Block until the UI signals it’s consumed the last tool/text
//     await pWaitFor(() => this.userMessageContentReady);
//   }

//   private presentAssistantMessage() {
//     this.assistantMessageQueue.enqueue(this.assistantMessageContentBlocks);
//   }

//   public ensureNotAborted() {
//     if (this.isAborted) {
//       throw new Error("Aborted");
//     }
//   }

//   private async *attemptApiRequest(): ApiStream {
//     const systemMessage =
//       "You are a helpful assistant that can answer questions and help with tasks.";

//     let stream = this.api.createMessage(
//       systemMessage,
//       this.apiConversationHistory
//     );

//     const iterator = stream[Symbol.asyncIterator]();

//     try {
//       // Note: I don't know the reason why the first chunk is not being yielded
//       // awaiting first chunk to see if it will throw an error
//       const firstChunk = await iterator.next();
//       yield firstChunk.value;
//     } catch (error) {
//       console.error(error);
//     }

//     yield* iterator;
//   }
// }
