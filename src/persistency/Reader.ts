import { NcText } from '../models/NcText';
import { BlockReader } from './BlockReader';
import { Parser } from './Parser';

/// Class for reading Siemens NC text.
export class Reader {
  /// Returns NC text read from a string.
  static readFromString(input: string | string[]): NcText {
    const parser = new Parser(Array.isArray(input) ? input.join('\n') : input);
    const reader = new BlockReader(parser);

    const ncText = new NcText();
    for (;;) {
      const block = reader.tryRead();
      if (!block) {
        break;
      }
      ncText.blocks.push(block);
    }
    return ncText;
  }
}
