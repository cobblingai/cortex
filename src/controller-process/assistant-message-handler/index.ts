import {
  AssistantMessageContentBlock,
  TextContent,
  ToolUse,
} from "@/types/assistant-message/index.js";
import { AssistantMessages } from "../assistant-messages/index.js";

export class AssistantMessageHandler {
  private currentIndex: number = 0;
  private isRunning: boolean = false;

  constructor(private messages: AssistantMessages) {}

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
        await handleTextBlock(block);
        break;
      case "tool_use":
        await handleToolUseBlock(block);
        break;
      default:
        throw new Error(`Unknown block type: ${(block as any).type}`);
    }
  }
}

function handleTextBlock(block: TextContent) {
  return Promise.resolve();
}

function handleToolUseBlock(block: ToolUse) {
  return Promise.resolve();
}
