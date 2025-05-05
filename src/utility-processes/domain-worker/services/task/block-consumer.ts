import { AssistantMessageContentBlock } from "@/types/assistant-message/index.js";
import { handleTextBlock } from "./assistant-message-handlers/text-block-handler.js";
import { handleToolUseBlock } from "./assistant-message-handlers/too-use-block-handler.js";
import cloneDeep from "clone-deep";
import { ViewState } from "../../ui/view-state.js";
import { AskController } from "./user-interaction/ask-controller.js";

export async function runBlockConsumer(
  block: AssistantMessageContentBlock,
  viewState: ViewState,
  askController: AskController
) {
  // need to create copy bc while stream is updating the array, it could be updating the reference block properties too
  const clone = cloneDeep(block);

  if (clone.type === "text") {
    handleTextBlock(clone, viewState);
  } else {
    handleToolUseBlock(clone, viewState, askController);
  }

  if (clone.partial) {
    return "peekAndPause";
  }
  return "advance";
}
