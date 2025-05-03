import Anthropic from "@anthropic-ai/sdk";

export class AIState {
  private messages: Anthropic.Messages.MessageParam[];

  constructor() {
    this.messages = [];
  }

  addMessage(message: Anthropic.Messages.MessageParam) {
    this.messages.push(message);
  }

  getMessages(): readonly Anthropic.Messages.MessageParam[] {
    return this.messages;
  }

  clear() {
    this.messages = [];
  }
}
