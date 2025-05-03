import { ToolUse } from "@/types/assistant-message/index.js";
import { ViewState } from "@/utility-processes/domain-worker/view-state/index.js";
import { handleAttemptCompletionBlock } from "./attemp-completion-handler.js";

export function handleToolUseBlock(block: ToolUse, viewState: ViewState) {
  switch (block.name) {
    case "attempt_completion":
      handleAttemptCompletionBlock(block, viewState);
      break;
    case "use_mcp_tool":
      break;
    case "ask_followup_question":
      break;
  }
}
