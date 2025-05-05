import { ApiHandler, ApiProvider } from "@/types/api/index.js";
import { buildApiHandler } from "@/utility-processes/domain-worker/api/index.js";
import Anthropic from "@anthropic-ai/sdk";
import { AIState } from "../../ai-state/index.js";
import { ViewState } from "../../ui/view-state.js";
import { SYSTEM_PROMPT } from "../../prompts/system.js";
import { AsyncQueue } from "../../utils/async-queue.js";
import { AssistantMessageContentBlock } from "@/types/assistant-message/index.js";
import { runBlockProducer } from "./block-producer.js";
import { formatResponse } from "../../prompts/responses.js";
import { runBlockConsumer } from "./block-consumer.js";
import { tellUser } from "./user-interaction/tell-user.js";
import { postStateToView } from "../../ui/index.js";
import { AskController } from "./user-interaction/ask-controller.js";

type UserContentBlock = Anthropic.TextBlockParam | Anthropic.ImageBlockParam;

export class Task {
  public readonly id: string;
  public readonly viewState: ViewState;

  private isAborted = false;
  private userMessageContent: UserContentBlock[] = [];
  private apiHandler: ApiHandler;
  private readonly aiState: AIState;
  private readonly postStateToView: (state: ViewState) => void;
  private readonly askController: AskController;

  constructor(
    public status: "initialized" | "running" | "completed" | "failed",
    private text: string,
    private readonly context: {
      model: string;
      apiKey: string;
      apiProvider: ApiProvider;
    }
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
    this.viewState = new ViewState();
    this.aiState = new AIState();
    this.askController = new AskController(this.viewState);
    this.postStateToView = (state: ViewState) => {
      return postStateToView(state);
    };
  }

  public abort() {
    this.isAborted = true;
  }

  public start() {
    this.startAsync().catch((error) => {
      console.error("[Task] error starting:", error);
    });
  }

  private async startAsync() {
    this.status = "running";
    this.aiState.clear();
    this.viewState.clear();

    this.postStateToView(this.viewState);
    tellUser(
      {
        type: "text",
        text: this.text,
      },
      this.viewState
    );

    let nextUserContentBlocks: UserContentBlock[] = [
      { type: "text", text: `<task>\n${this.text}\n</task>` },
    ];

    while (!this.isAborted) {
      const didComplete = await this.runAgenticLoop(nextUserContentBlocks);

      if (didComplete) {
        break;
      }

      nextUserContentBlocks = [
        {
          type: "text",
          text: formatResponse.noToolsUsed(),
        },
      ];
    }
  }

  private async runAgenticLoop(initialUserContentBlocks: UserContentBlock[]) {
    let nextUserContentBlocks = initialUserContentBlocks;

    while (true) {
      if (this.isAborted) {
        return true;
      }

      if (nextUserContentBlocks.length === 0) {
        console.log("no more user content blocks");
        return true;
      }

      nextUserContentBlocks.push({
        type: "text",
        text: this.getEnvironmentDetails(),
      });

      console.log(
        `nextUserContentBlocks: ${JSON.stringify(nextUserContentBlocks, null, 2)}`
      );

      // 1) Send API request and stream response
      this.userMessageContent = [];
      let didReceiveAnyContent = false;
      let didUseTool = false;
      this.aiState.addMessage({
        role: "user",
        content: nextUserContentBlocks,
      });

      const queue = new AsyncQueue<AssistantMessageContentBlock>();
      queue.registerConsumer((block) =>
        runBlockConsumer(block, this.viewState, this.askController)
      );

      try {
        const stream = this.startApiStream(this.aiState.getMessages());
        // Producer: parses every text chunk into blocks (including partials)
        const streamResult = await runBlockProducer(stream, queue);
        didReceiveAnyContent = streamResult.didReceiveAnyContent;
        didUseTool = streamResult.didUseTool;
      } catch (error) {
        console.error("[Task] error running agentic loop:", error);
        this.status = "failed";
        this.postStateToView(this.viewState);
        return true;
      }

      // 2) If the model returned nothing at all, stop
      if (!didReceiveAnyContent) {
        return false;
      }

      // 3) Wait until all assistant content has been presented
      await queue.onIdle();

      if (!didUseTool) {
        this.userMessageContent.push({
          type: "text",
          text: formatResponse.noToolsUsed(),
        });
      }

      nextUserContentBlocks = this.userMessageContent;
    }
  }

  private startApiStream(messages: readonly Anthropic.Messages.MessageParam[]) {
    const systemPrompt = SYSTEM_PROMPT();
    const stream = this.apiHandler.createMessage(systemPrompt, messages);

    return stream;
  }

  getEnvironmentDetails() {
    let details = "";
    // Add current time information with timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });
    const timeZone = formatter.resolvedOptions().timeZone;
    const timeZoneOffset = -now.getTimezoneOffset() / 60; // Convert to hours and invert sign to match conventional notation
    const timeZoneOffsetStr = `${timeZoneOffset >= 0 ? "+" : ""}${timeZoneOffset}:00`;
    details += `\n\n# Current Time\n${formatter.format(now)} (${timeZone}, UTC${timeZoneOffsetStr})`;

    details += "\n\n# Current Mode";
    // if (this.chatSettings.mode === "plan") {
    //   details += "\nPLAN MODE\n" + formatResponse.planModeInstructions();
    // } else {
    //   details += "\nACT MODE";
    // }
    details += "\nACT MODE";
    return `<environment_details>${details.trim()}</environment_details>`;
  }
}
