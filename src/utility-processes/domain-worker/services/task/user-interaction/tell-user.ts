import { TellType } from "@/types/chat.js";
import { ViewState } from "../../../ui/view-state.js";
import {
  postPartialUIMessage,
  postStateToView,
} from "../../../ui/view-bridge.js";
export function tellUser(
  message: {
    type: TellType;
    text?: string;
    isPartial?: boolean;
  },
  viewState: ViewState
) {
  if (message.isPartial === undefined) {
    tellUserNormalMessage(message, viewState);
    return;
  }

  const lastUIMessage = viewState.lastUIMessage();
  const isUpdatingLastUIMessage =
    lastUIMessage &&
    lastUIMessage.isPartial &&
    lastUIMessage.type === "tell" &&
    lastUIMessage.tellType === message.type;

  if (message.isPartial) {
    if (isUpdatingLastUIMessage) {
      // update the last message
      lastUIMessage.content = message.text;
      postPartialUIMessage(lastUIMessage);
    } else {
      // this is a new message, so we need to add it to the view state
      viewState.addUIMessage({
        id: crypto.randomUUID(),
        type: "tell",
        tellType: message.type,
        content: message.text,
        isPartial: true,
      });
      postStateToView(viewState);
    }
  } else {
    if (isUpdatingLastUIMessage) {
      // update the last message
      lastUIMessage.content = message.text;
      lastUIMessage.isPartial = false;
      postPartialUIMessage(lastUIMessage);
    } else {
      viewState.addUIMessage({
        id: crypto.randomUUID(),
        type: "tell",
        tellType: message.type,
        content: message.text,
      });
      postStateToView(viewState);
    }
  }
}

function tellUserNormalMessage(
  message: {
    type: TellType;
    text?: string;
  },
  viewState: ViewState
) {
  viewState.addUIMessage({
    id: crypto.randomUUID(),
    type: "tell",
    tellType: message.type,
    content: message.text,
  });
  postStateToView(viewState);
}
