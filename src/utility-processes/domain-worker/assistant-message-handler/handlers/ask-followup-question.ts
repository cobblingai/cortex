import { removeClosingTag } from "@/utility-processes/domain-worker/utils/remove-closing-tag.js";
import { ViewState } from "@/utility-processes/domain-worker/view-state/index.js";
import { findLast, parsePartialArrayString } from "@/shared/utils.js";
import { ToolUse } from "@/types/assistant-message/index.js";
import { AskQuestion } from "@/types/view-message.js";

export async function handleAskFollowupQuestion(
  block: ToolUse,
  viewState: ViewState,
  pushToolResult: (result: string) => void,
  askUser: (
    type: string,
    message: string,
    partial: boolean
  ) => { text: string; images: string[] }
) {
  const question: string | undefined = block.params.question;
  const optionsRaw: string | undefined = block.params.options;
  const sharedMessage = {
    question: removeClosingTag(block, "question", question),
    options: parsePartialArrayString(
      removeClosingTag(block, "options", optionsRaw)
    ),
  } satisfies AskQuestion;

  try {
    if (block.partial) {
      askUser("followup", JSON.stringify(sharedMessage), block.partial);

      return;
    }

    if (!question) {
      pushToolResult(
        await this.sayAndCreateMissingParamError(
          "ask_followup_question",
          "question"
        )
      );

      return;
    }

    const { text, images } = await askUser(
      "followup",
      JSON.stringify(sharedMessage),
      false
    );

    // Check if options contains the text response
    if (
      optionsRaw &&
      text &&
      parsePartialArrayString(optionsRaw).includes(text)
    ) {
      // Valid option selected, don't show user message in UI
      // Update last followup message with selected option
      const lastFollowupMessage = findLast(
        viewState.getAllUIMessages(),
        (m) => m.type === "ask" && m.askType === "followup"
      );
      if (lastFollowupMessage) {
        lastFollowupMessage.content = JSON.stringify({
          ...sharedMessage,
          selected: text,
        } satisfies AskQuestion);
        await this.saveClineMessagesAndUpdateHistory();
      }
    } else {
      await this.say("user_feedback", text ?? "", images);
    }

    // pushToolResult(
    //   formatResponse.toolResult(`<answer>\n${text}\n</answer>`, images)
    // );
  } catch (error) {
    console.error(error);
  }
}

// const pushToolResult = (content: ToolResponse) => {
//   this.userMessageContent.push({
//     type: "text",
//     text: `${toolDescription()} Result:`,
//   });
//   if (typeof content === "string") {
//     this.userMessageContent.push({
//       type: "text",
//       text: content || "(tool did not return anything)",
//     });
//   } else {
//     this.userMessageContent.push(...content);
//   }
//   // once a tool result has been collected, ignore all other tool uses since we should only ever present one tool result per message
//   this.didAlreadyUseTool = true;
// };
