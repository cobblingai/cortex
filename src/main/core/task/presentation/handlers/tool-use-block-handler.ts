import {
  AssistantMessageContentBlock,
  ToolParamName,
} from "@/types/assistant-message/index.js";
import { Task } from "../../task.js";

export async function handleToolUseBlock(
  task: Task,
  block: AssistantMessageContentBlock
) {
  if (block.type !== "tool_use") {
    return;
  }

  switch (block.name) {
    case "use_mcp_tool":
      await handleMcpTool(task, block);
      break;
    case "attempt_completion":
      await handleAttemptCompletion(task, block);
      break;
    // add more tool cases here as needed
  }
}

export async function handleMcpTool(
  task: Task,
  block: AssistantMessageContentBlock
) {
  // stub: handle MCP tool usage
}

export async function handleAttemptCompletion(
  task: Task,
  block: AssistantMessageContentBlock
) {
  // stub: handle attempt completion
}

const removeClosingTag = (
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
