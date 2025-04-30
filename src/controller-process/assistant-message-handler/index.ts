import {
  AssistantMessageContentBlock,
  TextContent,
  ToolUse,
} from "@/types/assistant-message/index.js";
import { Task } from "../task/index.js";
import { AssistantMessages } from "../assistant-messages/index.js";
import { TellType } from "@/types/chat.js";
import { handleAskFollowupQuestion } from "./handlers/ask-followup-question.js";
import { ViewState } from "../view-state/index.js";
import Anthropic from "@anthropic-ai/sdk";

export class AssistantMessageHandler {
  private currentIndex: number = 0;
  private isRunning: boolean = false;

  constructor(
    private messages: AssistantMessages,
    private task: Task
  ) {}

  /**
   * Processes pending messages.
   *
   * This will drain the message queue and handle each block in order.
   * If the handler is already running, this call will be ignored to prevent
   * concurrent processing of the same messages.
   *
   * The handler maintains a currentIndex pointer to track progress through the message queue.
   * Each block is cloned before processing to avoid mutations.
   * Any errors during processing are caught and logged, but won't stop subsequent messages.
   *
   * Once all pending messages are processed, isRunning is reset to false to allow future runs.
   */
  public processPendingMessages() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    this.drain()
      .catch(console.error)
      .finally(() => {
        this.isRunning = false;
      });
  }

  public reset() {
    this.currentIndex = 0;
  }

  private async drain() {
    while (this.currentIndex < this.messages.length()) {
      const block = this.messages.cloneMessage(this.currentIndex);
      await this.handleBlock(block);

      if (block.partial) {
        break;
      }

      this.currentIndex++;
    }
  }

  public areAllMessagesProcessed() {
    return this.currentIndex === this.messages.length();
  }

  private async handleBlock(
    block: AssistantMessageContentBlock
  ): Promise<void> {
    switch (block.type) {
      case "text":
        await this.handleTextBlock(block);
        break;
      case "tool_use":
        await this.handleToolUseBlock(block, this.task.getViewState());
        break;
      default:
        throw new Error(`Unknown block type: ${(block as any).type}`);
    }
  }

  private async handleTextBlock(block: TextContent) {
    let content = block.content;
    if (content) {
      content = content.replace(/<thinking>\s?/g, "");
      content = content.replace(/\s?<\/thinking>/g, "");
      const lastOpenBracketIndex = content.lastIndexOf("<");
      if (lastOpenBracketIndex !== -1) {
        const possibleTag = content.slice(lastOpenBracketIndex);
        // Check if there's a '>' after the last '<' (i.e., if the tag is complete) (complete thinking and tool tags will have been removed by now)
        const hasCloseBracket = possibleTag.includes(">");
        if (!hasCloseBracket) {
          // Extract the potential tag name
          let tagContent: string;
          if (possibleTag.startsWith("</")) {
            tagContent = possibleTag.slice(2).trim();
          } else {
            tagContent = possibleTag.slice(1).trim();
          }
          // Check if tagContent is likely an incomplete tag name (letters and underscores only)
          const isLikelyTagName = /^[a-zA-Z_]+$/.test(tagContent);
          // Preemptively remove < or </ to keep from these artifacts showing up in chat (also handles closing thinking tags)
          const isOpeningOrClosing =
            possibleTag === "<" || possibleTag === "</";
          // If the tag is incomplete and at the end, remove it from the content
          if (isOpeningOrClosing || isLikelyTagName) {
            content = content.slice(0, lastOpenBracketIndex).trim();
          }
        }
      }

      if (!block.partial) {
        // Some models add code block artifacts (around the tool calls) which show up at the end of text content
        // matches ``` with at least one char after the last backtick, at the end of the string
        const match = content?.trimEnd().match(/```[a-zA-Z0-9_-]+$/);
        if (match) {
          const matchLength = match[0].length;
          content = content.trimEnd().slice(0, -matchLength);
        }
      }

      this.task.tellUser({
        type: "text",
        content,
        isPartial: block.partial,
      });
    }
    return Promise.resolve();
  }

  private async handleToolUseBlock(block: ToolUse, viewState: ViewState) {
    type ToolResponse =
      | string
      | Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam>;
    const pushToolResult = (content: ToolResponse) => {
      // this.userMessageContent.push({
      //   type: "text",
      //   text: `${toolDescription()} Result:`,
      // });
      // if (typeof content === "string") {
      //   this.userMessageContent.push({
      //     type: "text",
      //     text: content || "(tool did not return anything)",
      //   });
      // } else {
      //   this.userMessageContent.push(...content);
      // }
      // // once a tool result has been collected, ignore all other tool uses since we should only ever present one tool result per message
      // this.didAlreadyUseTool = true;
    };

    const toolDescription = () => {
      switch (block.name) {
        case "use_mcp_tool":
          return `[${block.name} for '${block.params.server_name}']`;
        case "ask_followup_question":
          return `[${block.name} for '${block.params.question}']`;
        case "attempt_completion":
          return `[${block.name}]`;
        //   case "new_task":
        //     return `[${block.name} for creating a new task]`;
        //   case "condense":
        //     return `[${block.name}]`;
      }
    };

    switch (block.name) {
      case "use_mcp_tool":
        break;
      case "ask_followup_question":
        await handleAskFollowupQuestion(
          block,
          viewState,
          pushToolResult,
          this.task.askUser
        );
        break;
      case "attempt_completion":
        break;
    }
  }
}
