import { UIMessage } from "@/types/chat.js";

export class ViewState {
  private uiMessages: UIMessage[];

  constructor() {
    this.uiMessages = [];
  }

  public addUIMessage(message: UIMessage) {
    this.uiMessages.push(message);
  }

  public lastUIMessage() {
    return this.uiMessages.at(-1);
  }

  public getAllUIMessages(): readonly UIMessage[] {
    return this.uiMessages;
  }

  public clear() {
    this.uiMessages = [];
  }
}
