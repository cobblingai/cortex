import Anthropic from "@anthropic-ai/sdk";

export class AIState {
  private readonly messages: Anthropic.Messages.MessageParam[];

  constructor() {
    this.messages = [];
  }

  addMessage(message: Anthropic.Messages.MessageParam) {
    this.messages.push(message);
  }

  getMessages() {
    return this.messages;
  }
}
