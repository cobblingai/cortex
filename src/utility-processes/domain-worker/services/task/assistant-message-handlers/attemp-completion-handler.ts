import { ToolUse } from "@/types/assistant-message/index.js";
import { ViewState } from "@/utility-processes/domain-worker/view-state/index.js";
import { tellUser } from "../tell-user.js";
import { removeClosingTag } from "@/utility-processes/domain-worker/utils/remove-closing-tag.js";

export function handleAttemptCompletionBlock(
  block: ToolUse,
  viewState: ViewState
) {
  if (block.name !== "attempt_completion") {
    throw new Error("Invalid block name");
  }

  const result: string | undefined = block.params.result;
  const command: string | undefined = block.params.command;

  try {
    if (block.partial) {
      if (!command) {
        tellUser(
          {
            type: "completion_result",
            text: removeClosingTag(block, "result", result),
            isPartial: true,
          },
          viewState
        );
      }
    } else {
      tellUser(
        {
          type: "completion_result",
          text: result,
          isPartial: false,
        },
        viewState
      );
    }
  } catch (error) {
    console.error("Error attempting completion", error);
  }
}
