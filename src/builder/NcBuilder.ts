import { Block, NcText } from '../models';
import { BlockBuilder } from './BlockBuilder';

export class NcBuilder {
  text = new NcText();

  constructor(private options?: { blockNumberIncrement?: number }) {}

  static block(block: Block | ((b: BlockBuilder) => void)): NcBuilder {
    return new NcBuilder().block(block);
  }

  block(block: Block | ((b: BlockBuilder) => void)): NcBuilder {
    if (typeof block === 'function') {
      const blockBuilder = new BlockBuilder();
      blockBuilder.block.line = this.text.blocks.length + 1;
      if (this.options?.blockNumberIncrement) {
        blockBuilder.block.blockNumber = (this.text.blocks[this.text.blocks.length - 1]?.blockNumber ?? 0) + this.options.blockNumberIncrement;
      }
      block(blockBuilder);
      this.text.blocks.push(blockBuilder.block);
    } else {
      block.line = this.text.blocks.length + 1;
      if (this.options?.blockNumberIncrement) {
        block.blockNumber = (this.text.blocks[this.text.blocks.length - 1]?.blockNumber ?? 0) + this.options.blockNumberIncrement;
      }
      this.text.blocks.push(block);
    }
    return this;
  }
}
