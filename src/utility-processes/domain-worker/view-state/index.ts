import { UIMessage } from "@/types/chat.js";
import { ViewMessage } from "@/types/view-message.js";

export class ViewState {
  private uiMessages: UIMessage[];

  constructor(
    private readonly postMessageToView: (message: ViewMessage) => void
  ) {
    this.uiMessages = [];
  }

  public addUIMessage(message: UIMessage) {
    this.uiMessages.push(message);
  }

  public postStateToView() {
    this.postMessageToView({
      type: "state",
      payload: {
        state: {
          uiMessages: this.uiMessages,
        },
      },
    });
  }

  public postPartialUIMessage(message: UIMessage) {
    this.postMessageToView({
      type: "partial",
      payload: { partial: message },
    });
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
