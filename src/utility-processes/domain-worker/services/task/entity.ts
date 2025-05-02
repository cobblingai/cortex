import { ApiHandler, ApiProvider } from "@/types/api/index.js";
import { buildApiHandler } from "@/utility-processes/domain-worker/api/index.js";
import Anthropic from "@anthropic-ai/sdk";
import { AIState } from "../../ai-state/index.js";
import { ViewState } from "../../view-state/index.js";
import { ViewMessage } from "@/types/view-message.js";
import { SYSTEM_PROMPT } from "../../prompts/system.js";
import { AsyncQueue } from "../../utils/async-queue.js";
import { AssistantMessageContentBlock } from "@/types/assistant-message/index.js";
import { runBlockProducer } from "./block-producer.js";
import { TellType } from "@/types/chat.js";
import { handleTextBlock } from "./assistant-message-handlers/text-block-handler.js";
import { handleToolUseBlock } from "./assistant-message-handlers/too-use-block-handler.js";
import cloneDeep from "clone-deep";

type UserContentBlock = Anthropic.TextBlockParam | Anthropic.ImageBlockParam;

export class Task {
  public readonly id: string;
  public readonly viewState: ViewState;

  private isAborted = false;
  private userMessageContent: UserContentBlock[] = [];
  private apiHandler: ApiHandler;
  private readonly aiState: AIState;

  constructor(
    public status: "initialized" | "running" | "completed" | "failed",
    private text: string,
    private readonly context: {
      model: string;
      apiKey: string;
      apiProvider: ApiProvider;
    },
    private readonly postMessageToView: (message: ViewMessage) => void
  ) {
    if (text) {
      this.id = crypto.randomUUID();
      this.userMessageContent = [];
    }
    this.apiHandler = buildApiHandler({
      apiProvider: this.context.apiProvider,
      apiKey: this.context.apiKey,
      apiModelId: this.context.model,
    });
    this.viewState = new ViewState(this.postMessageToView);
    this.aiState = new AIState();
  }

  public abort() {
    this.isAborted = true;
  }

  public async runAgenticLoop() {
    let nextUserContentBlocks: UserContentBlock[] = [
      { type: "text", text: `<task>\n${this.text}\n</task>` },
    ];

    while (!this.isAborted) {
      this.aiState.addMessage({
        role: "user",
        content: nextUserContentBlocks,
      });

      const systemPrompt = await SYSTEM_PROMPT();
      const stream = this.apiHandler.createMessage(
        systemPrompt,
        this.aiState.getMessages()
      );

      // 2) set up a queue and consume blocks
      const queue = new AsyncQueue<AssistantMessageContentBlock>();
      queue.consume(async (block) => {
        if (block.type === "text") {
          handleTextBlock(this, cloneDeep(block));
        } else {
          handleToolUseBlock(this, cloneDeep(block));
        }

        if (block.partial) {
          return "peekAndPause";
        }
        return "advance";
      });

      // Producer: parses every text chunk into blocks (including partials)
      await runBlockProducer(stream, queue);

      break;

      // // 5) check for completion signal in the collected userMessageContent
      // if (this.userMessageContent.some((b) => b.signalsCompletion)) {
      //   break; // exit the loop → task completed
      // }

      nextUserContentBlocks = this.userMessageContent;
      this.userMessageContent = [];
    }
  }

  private finishStreamPresentation() {
    // this.viewState.postStateToView();
  }
}
