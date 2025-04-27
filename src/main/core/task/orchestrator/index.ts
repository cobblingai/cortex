// // src/task/orchestrator/TaskOrchestrator.ts
// import pWaitFor from "p-wait-for";
// import type { Task } from "../task.js";
// import type { AssistantMessagePresenter } from "../presentation/assistant-message-presenter.js";
// import { UserContent } from "../index.js";
// import { ApiRequestStreamer } from "../api/api-request-streamer.js";

// /**
//  * Coordinates the main agentic loop:
//  * 1. Sends user content to the API
//  * 2. Streams assistant messages and executes tools via the presenter
//  * 3. Waits for userMessageContent to be ready
//  * 4. Repeats until task is aborted or completed
//  */
// export class TaskOrchestrator {
//   constructor(
//     private task: Task,
//     private apiStreamer: ApiRequestStreamer,
//     private presenter: AssistantMessagePresenter
//   ) {}

//   /**
//    * Start the orchestration loop with initial user content.
//    */
//   async start(initialContent: UserContent) {
//     let nextUserContent = initialContent;

//     // Main loop
//     while (!this.task.isAborted) {
//       // 1) Record and send user content to LLM
//       await this.task.recordUserTurn(nextUserContent);
//       await this.apiStreamer.sendUserContent(nextUserContent);

//       // 2) Stream and present assistant response (text + tools)
//       await this.presenter.present();

//       // 3) Wait until presenter signals "user turn ready"
//       await pWaitFor(() => this.task.userMessageContentReady);

//       // 4) Grab the new userMessageContent for next iteration
//       nextUserContent = this.task.consumeNextUserTurn();
//     }
//   }
// }
