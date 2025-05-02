import { TextContent } from "@/types/assistant-message/index.js";
import { Task } from "../entity.js";
import { tellUser } from "../tell-user.js";

export async function handleTextBlock(task: Task, block: TextContent) {
  let content = block.content;
  if (content) {
    content = content.replace(/<thinking>\s?/g, "");
    content = content.replace(/\s?<\/thinking>/g, "");
    const lastOpenBracketIndex = content.lastIndexOf("<");
    if (lastOpenBracketIndex !== -1) {
      const possibleTag = content.slice(lastOpenBracketIndex);
      // Check if there's a '>' after the last '<' (i.e., if the tag is complete) (complete thinking and tool tags will have been removed by now)
      const hasCloseBracket = possibleTag.includes(">");
      if (!hasCloseBracket) {
        // Extract the potential tag name
        let tagContent: string;
        if (possibleTag.startsWith("</")) {
          tagContent = possibleTag.slice(2).trim();
        } else {
          tagContent = possibleTag.slice(1).trim();
        }
        // Check if tagContent is likely an incomplete tag name (letters and underscores only)
        const isLikelyTagName = /^[a-zA-Z_]+$/.test(tagContent);
        // Preemptively remove < or </ to keep from these artifacts showing up in chat (also handles closing thinking tags)
        const isOpeningOrClosing = possibleTag === "<" || possibleTag === "</";
        // If the tag is incomplete and at the end, remove it from the content
        if (isOpeningOrClosing || isLikelyTagName) {
          content = content.slice(0, lastOpenBracketIndex).trim();
        }
      }
    }

    if (!block.partial) {
      // Some models add code block artifacts (around the tool calls) which show up at the end of text content
      // matches ``` with at least one char after the last backtick, at the end of the string
      const match = content?.trimEnd().match(/```[a-zA-Z0-9_-]+$/);
      if (match) {
        const matchLength = match[0].length;
        content = content.trimEnd().slice(0, -matchLength);
      }
    }

    tellUser(
      {
        type: "text",
        content,
        isPartial: block.partial,
      },
      task.viewState
    );
  }
  return Promise.resolve();
}
