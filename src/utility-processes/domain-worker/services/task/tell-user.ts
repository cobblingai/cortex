import { TellType } from "@/types/chat.js";
import { ViewState } from "../../view-state/index.js";

export function tellUser(
  message: {
    type: TellType;
    content?: string;
    isPartial?: boolean;
  },
  viewState: ViewState
) {
  if (message.isPartial !== undefined) {
    const lastUIMessage = viewState.lastUIMessage();
    const isUpdatingLastUIMessage =
      lastUIMessage &&
      lastUIMessage.isPartial &&
      lastUIMessage.type === "tell" &&
      lastUIMessage.tellType === message.type;

    if (message.isPartial) {
      if (isUpdatingLastUIMessage) {
        // update the last message
        lastUIMessage.content = message.content;
        viewState.postPartialUIMessage(lastUIMessage);
      } else {
        // this is a new message, so we need to add it to the view state
        viewState.addUIMessage({
          id: crypto.randomUUID(),
          type: "tell",
          tellType: message.type,
          content: message.content,
          isPartial: true,
        });
        viewState.postStateToView();
      }
    } else {
      if (isUpdatingLastUIMessage) {
        // update the last message
        lastUIMessage.content = message.content;
        lastUIMessage.isPartial = false;
        viewState.postPartialUIMessage(lastUIMessage);
      } else {
        viewState.addUIMessage({
          id: crypto.randomUUID(),
          type: "tell",
          tellType: message.type,
          content: message.content,
        });
        viewState.postStateToView();
      }
    }
  }
}
