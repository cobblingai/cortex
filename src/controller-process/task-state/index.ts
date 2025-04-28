import { UIMessage } from "@/types/chat.js";
import { ViewMessage } from "@/types/view-message.js";

export class TaskState {
  private readonly uiMessages: UIMessage[];

  constructor(
    private readonly postMessageToView: (message: ViewMessage) => void
  ) {
    this.uiMessages = [];
  }

  addUIMessageAndPostToView(message: UIMessage) {
    this.uiMessages.push(message);
    this.postMessageToView({
      type: "state",
      payload: {
        state: {
          uiMessages: this.uiMessages,
        },
      },
    });
  }
}
