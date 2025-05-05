import { ToolUse } from "@/types/assistant-message/index.js";
import { ViewState } from "@/utility-processes/domain-worker/ui/view-state.js";
import { tellUser } from "../user-interaction/tell-user.js";
import { removeClosingTag } from "@/utility-processes/domain-worker/utils/remove-closing-tag.js";
import { AskController } from "../user-interaction/ask-controller.js";

export async function handleAttemptCompletionBlock(
  block: ToolUse,
  viewState: ViewState,
  askController: AskController
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
      const answer = await askController.ask("completion_result", "", false);
      console.log("answer", answer);
    }
  } catch (error) {
    console.error("Error attempting completion", error);
  }
}
