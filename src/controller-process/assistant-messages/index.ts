import {
  AssistantMessageContentBlock,
  ToolParamName,
  TextContent,
  ToolUse,
  toolParamNames,
  toolUseNames,
  ToolUseName,
} from "@/types/assistant-message/index.js";
import cloneDeep from "clone-deep";

export class AssistantMessages {
  private assisantMessages: AssistantMessageContentBlock[] = [];

  constructor() {}

  /**
   * Adds a chunk of assistant message and reparses the message.
   *
   * Why re-parse the entire message on each chunk?
   *
   * Because we’re dealing with a stream of text that can arbitrarily split XML‐style tags, code fences, and tool‐call markers across chunk boundaries, we need to re-parse the entire accumulated string on each new chunk to:
   * 1. Close out partial blocks
   * A <text> block that started in one chunk may only finish (i.e. its closing tag or end of code fence) once later content arrives. By re-running the full parse, we can convert that “partial” block into a “complete” one the moment its end marker shows up.
   *
   * 2. Maintain correct block boundaries
   * Things like code fences (js … ) or <tool_use> tags must be recognized as single blocks. If you only appended new blocks piecemeal, you could end up with mangled or split blocks.
   *
   * 3. Allow incremental presentation
   * Even though we regenerate the entire assistantMessageContent array, our presenter keeps a currentIndex pointer so it only ever renders the new blocks. The old ones stay rendered and we never repeat them.
   *
   * If we didn’t reset (re-parse) each time, then:
   * - A code fence that starts in chunk N and ends in chunk N+2 would never be recognized as a single block.
   * - A <tool_use> tag split across chunks would be mis‐parsed.
   * - You’d have to write fragile incremental-parsing logic to stitch partial tags back together.
   *
   * By re-parsing the entire buffer on every chunk, we keep the parser simple and reliable—while our presenter’s index ensures you only display the new content.
   *
   * @param chunk - The chunk of assistant message to add.
   */
  public addChunkAndReparse(chunk: string) {
    this.assisantMessages = parseAssistantMessage(chunk);
  }

  public length(): number {
    return this.assisantMessages.length;
  }

  public cloneMessage(index: number): AssistantMessageContentBlock {
    return cloneDeep(this.assisantMessages[index]);
  }

  public clear() {
    this.assisantMessages = [];
  }

  public setPartialMessagesToNonPartial() {
    let count = 0;
    this.assisantMessages.forEach((message) => {
      if (message.partial) {
        message.partial = false;
        count++;
      }
    });
    return count;
  }
}

function parseAssistantMessage(message: string) {
  const contentBlocks: AssistantMessageContentBlock[] = [];
  let currentTextContent: TextContent | undefined = undefined;
  let currentTextContentStartIndex = 0;
  let currentToolUse: ToolUse | undefined = undefined;
  let currentToolUseStartIndex = 0;
  let currentParamName: ToolParamName | undefined = undefined;
  let currentParamValueStartIndex = 0;
  let accumulator = "";

  for (let i = 0; i < message.length; i++) {
    const char = message[i];
    accumulator += char;

    // there should not be a param without a tool use
    if (currentToolUse && currentParamName) {
      const currentParamValue = accumulator.slice(currentParamValueStartIndex);
      const paramClosingTag = `</${currentParamName}>`;
      if (currentParamValue.endsWith(paramClosingTag)) {
        // end of param value
        currentToolUse.params[currentParamName] = currentParamValue
          .slice(0, -paramClosingTag.length)
          .trim();
        currentParamName = undefined;
        continue;
      } else {
        // partial param value is accumulating
        continue;
      }
    }

    // no currentParamName

    if (currentToolUse) {
      const currentToolValue = accumulator.slice(currentToolUseStartIndex);
      const toolUseClosingTag = `</${currentToolUse.name}>`;
      if (currentToolValue.endsWith(toolUseClosingTag)) {
        // end of a tool use
        currentToolUse.partial = false;
        contentBlocks.push(currentToolUse);
        currentToolUse = undefined;
        continue;
      } else {
        const possibleParamOpeningTags = toolParamNames.map(
          (name) => `<${name}>`
        );
        for (const paramOpeningTag of possibleParamOpeningTags) {
          if (accumulator.endsWith(paramOpeningTag)) {
            // start of a new parameter
            currentParamName = paramOpeningTag.slice(1, -1) as ToolParamName;
            currentParamValueStartIndex = accumulator.length;
            break;
          }
        }

        // partial tool value is accumulating
        continue;
      }
    }

    // no currentToolUse

    let didStartToolUse = false;
    const possibleToolUseOpeningTags = toolUseNames.map((name) => `<${name}>`);
    for (const toolUseOpeningTag of possibleToolUseOpeningTags) {
      if (accumulator.endsWith(toolUseOpeningTag)) {
        // start of a new tool use
        currentToolUse = {
          type: "tool_use",
          name: toolUseOpeningTag.slice(1, -1) as ToolUseName,
          params: {},
          partial: true,
        };
        currentToolUseStartIndex = accumulator.length;
        // this also indicates the end of the current text content
        if (currentTextContent) {
          currentTextContent.partial = false;
          // remove the partially accumulated tool use tag from the end of text (<tool)
          currentTextContent.content = currentTextContent.content
            .slice(0, -toolUseOpeningTag.slice(0, -1).length)
            .trim();
          contentBlocks.push(currentTextContent);
          currentTextContent = undefined;
        }

        didStartToolUse = true;
        break;
      }
    }

    if (!didStartToolUse) {
      // no tool use, so it must be text either at the beginning or between tools
      if (currentTextContent === undefined) {
        currentTextContentStartIndex = i;
      }
      currentTextContent = {
        type: "text",
        content: accumulator.slice(currentTextContentStartIndex).trim(),
        partial: true,
      };
    }
  }

  if (currentToolUse) {
    // stream did not complete tool call, add it as partial
    if (currentParamName) {
      // tool call has a parameter that was not completed
      currentToolUse.params[currentParamName] = accumulator
        .slice(currentParamValueStartIndex)
        .trim();
    }
    contentBlocks.push(currentToolUse);
  }

  // Note: it doesn't matter if check for currentToolUse or currentTextContent, only one of them will be defined since only one can be partial at a time
  if (currentTextContent) {
    // stream did not complete text content, add it as partial
    contentBlocks.push(currentTextContent);
  }

  return contentBlocks;
}
