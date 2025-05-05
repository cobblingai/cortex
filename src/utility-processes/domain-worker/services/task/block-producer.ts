// src/task/presentation/blockProducer.ts
import { parseAssistantMessage } from "./parser.js";
import { AsyncQueue } from "../../utils/async-queue.js";
import { AssistantMessageContentBlock } from "@/types/assistant-message/index.js";
import { ApiStreamChunk } from "@/types/api/transform/stream.js";

/**
 * Reads the raw LLM stream, reparses the _entire_ buffer on each text chunk,
 * and enqueues _all_ blocks (complete or partial) that haven't yet been emitted.
 */
export async function runBlockProducer(
  stream: AsyncIterable<ApiStreamChunk>,
  queue: AsyncQueue<AssistantMessageContentBlock>
) {
  let buffer = "";
  let blocks: AssistantMessageContentBlock[] = [];

  for await (const chunk of stream) {
    if (chunk.type !== "text") continue;
    buffer += chunk.text;
    // re-parse entire conversation so far
    blocks = parseAssistantMessage(buffer);

    queue.replace(blocks);
  }

  // when stream closes, re-emit any final block updates
  const finalBlocks = blocks.map((b) => ({
    ...b,
    partial: false,
  }));
  queue.replace(finalBlocks);

  queue.end();

  return {
    didReceiveAnyContent: buffer.length > 0,
    didUseTool: blocks.some((b) => b.type === "tool_use"),
  };
}
