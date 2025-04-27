import { AssistantMessageContentBlock } from "@/types/assistant-message/index.js";

export class BlockManager {
  private index = 0;

  constructor(private blocks: AssistantMessageContentBlock[]) {}

  getNextBlock() {
    return this.blocks[this.index++];
  }

  hasMoreBlocks(): boolean {
    return this.index < this.blocks.length;
  }

  shouldRecurse(block: AssistantMessageContentBlock): boolean {
    const isFinal = !block.partial;
    const more = this.hasMoreBlocks();
    return isFinal && more;
  }

  finish() {}
}
