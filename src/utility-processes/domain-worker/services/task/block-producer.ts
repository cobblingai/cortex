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
  let emittedCount = 0;

  for await (const chunk of stream) {
    if (chunk.type !== "text") continue;
    buffer += chunk.text;

    // re-parse entire conversation so far
    const blocks = parseAssistantMessage(buffer);

    // emit every new block (including partials)
    while (emittedCount < blocks.length) {
      queue.push(blocks[emittedCount]);
      emittedCount++;
    }
  }

  // when stream closes, re-emit any final block updates
  const finalBlocks = parseAssistantMessage(buffer).map((b) => ({
    ...b,
    partial: false,
  }));
  // if a block was partial before, and now final, re-emit it
  for (let i = 0; i < finalBlocks.length; i++) {
    if (i < emittedCount) {
      queue.push(finalBlocks[i]);
    } else {
      // brand-new tail block
      queue.push(finalBlocks[i]);
    }
  }

  queue.end();
}
