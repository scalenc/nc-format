import { Block, NcText, Statement } from '../models';
import { Constants } from './Constants';
import { StatementWriter } from './StatementWriter';
import { TextWriter } from './TextWriter';

export class Writer {
  private stream = new TextWriter();

  get text(): string {
    return this.stream.text;
  }

  public static toStrings(ncText: NcText): string[] {
    return ncText.blocks.map(Writer.write);
  }

  public static toString(ncText: NcText, newLineChar = '\n'): string {
    return this.toStrings(ncText).join(newLineChar);
  }

  public static write(block: Block): string {
    return new Writer().write(block).text.trimEnd();
  }

  private write(block: Block): Writer {
    this.writeLineNumber(block.blockNumber).writeLabels(block.labels).writeStatements(block.statements).writeComment(block.comment);
    return this;
  }

  private writeLineNumber(blockNumber?: number): Writer {
    if (blockNumber) {
      this.stream.write(Constants.NUMBER_TOKEN);
      this.stream.write(blockNumber.toString());
    }
    return this;
  }

  private writeLabels(labels: string[]): Writer {
    labels.forEach((label) => {
      this.stream.write(label);
      this.stream.write(Constants.COLON);
    });
    return this;
  }

  private writeStatements(statements: Statement[]): Writer {
    if (statements.length) {
      const statementWriter = new StatementWriter(this.stream);
      statements.forEach((statement) => statement.visit(statementWriter));
    }
    return this;
  }

  private writeComment(comment?: string): void {
    if (comment) {
      this.stream.write(Constants.COMMENT_CHAR);
      this.stream.write(comment);
    }
  }
}
