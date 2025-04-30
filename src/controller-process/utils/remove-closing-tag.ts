import {
  AssistantMessageContentBlock,
  ToolParamName,
} from "@/types/assistant-message/index.js";

export const removeClosingTag = (
  block: AssistantMessageContentBlock,
  tag: ToolParamName,
  text?: string
) => {
  if (!block.partial) {
    return text || "";
  }
  if (!text) {
    return "";
  }
  // This regex dynamically constructs a pattern to match the closing tag:
  // - Optionally matches whitespace before the tag
  // - Matches '<' or '</' optionally followed by any subset of characters from the tag name
  const tagRegex = new RegExp(
    `\\s?<\/?${tag
      .split("")
      .map((char) => `(?:${char})?`)
      .join("")}$`,
    "g"
  );
  return text.replace(tagRegex, "");
};
