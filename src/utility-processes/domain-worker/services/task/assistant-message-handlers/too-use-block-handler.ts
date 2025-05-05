import { ToolUse } from "@/types/assistant-message/index.js";
import { ViewState } from "@/utility-processes/domain-worker/ui/view-state.js";
import { handleAttemptCompletionBlock } from "./attemp-completion-handler.js";
import { handleAskFollowupQuestionBlock } from "./ask-followup-question-handler.js";
import { AskController } from "../user-interaction/ask-controller.js";

export function handleToolUseBlock(
  block: ToolUse,
  viewState: ViewState,
  askController: AskController
) {
  switch (block.name) {
    case "attempt_completion":
      handleAttemptCompletionBlock(block, viewState, askController);
      break;
    case "use_mcp_tool":
      break;
    case "ask_followup_question":
      handleAskFollowupQuestionBlock(block, viewState);
      break;
  }
}
