import { Block } from '../models/Block';
import { Constants } from './Constants';
import { Number } from '../models/Expressions';
import { Assignment } from '../models/Statements/Assignment';
import { Instruction } from '../models/Statements/Instruction';
import { Statement } from '../models/Statements/Statement';
import { Errors } from './Errors';
import { Parser } from './Parser';
import { ParserException } from './ParserException';
import { StatementReader } from './StatementReader';
import { Token, TokenType } from './Token';

export class BlockReader {
  statementReader: StatementReader;
  statement?: Statement;

  constructor(private parser: Parser) {
    this.statementReader = new StatementReader(parser);
  }

  tryRead(): Block | undefined {
    if (this.isEndOfFile()) {
      return undefined;
    }

    if (this.isEndOfLine()) {
      // Special handling for empty lines, since otherwise, line number is not accounted correctly.
      const line = this.parser.line - 1;
      this.skipLineEnd();
      return new Block(line);
    }

    const line = this.parser.line;

    this.statement = this.statementReader.tryRead();

    const blockNumber = this.tryReadBlockNumber();

    const labels = this.readAllLabels();

    const statements = this.readAllStatements();

    const comment = this.tryReadComment();

    this.skipLineEnd();

    return new Block(line, blockNumber, labels, statements, comment);
  }

  tryReadBlockNumber() {
    if (this.statement instanceof Assignment && this.statement.variable.toUpperCase() === Constants.NUMBER_TOKEN) {
      if (this.statement.expression instanceof Number && this.statement.expression.isInteger) {
        const blockNumber = this.statement.expression.value;
        this.statement = this.statementReader.tryRead();
        return blockNumber;
      }
      throw new ParserException(this.parser, Errors.EXPECTED_BLOCK_NUMBER_BUT_FOUND_EXPRESSION);
    }
    return undefined;
  }

  readAllLabels(): string[] {
    const labels: string[] = [];
    for (;;) {
      const label = this.tryReadLabel();
      if (!label) {
        return labels;
      }
      labels.push(label);
    }
  }

  tryReadLabel(): string | undefined {
    if (this.statement instanceof Instruction && !this.statement.expressions && this.isLabelToken(this.parser.token)) {
      const label = this.statement.name;

      this.parser.tryRead(); // Skip ':'.
      this.statement = this.statementReader.tryRead();
      return label;
    }
    return undefined;
  }

  readAllStatements(): Statement[] | undefined {
    if (!this.statement) {
      return undefined;
    }
    const statements: Statement[] = [];
    do {
      statements.push(this.statement);
      this.statement = this.statementReader.tryRead();
    } while (this.statement);
    return statements;
  }

  tryReadComment(): string | undefined {
    if (this.parser.token?.type === TokenType.COMMENT) {
      const comment = this.parser.token.value;
      this.parser.tryRead();
      return comment;
    }
  }

  skipLineEnd() {
    if (this.parser.token) {
      if (this.parser.token.type !== TokenType.NEW_LINE) {
        throw new ParserException(this.parser, Errors.EXPECTED_LINE_END);
      }
      this.parser.tryRead();
    }
  }

  isEndOfFile(): boolean {
    return !this.parser.token && !this.parser.tryRead();
  }

  isEndOfLine(): boolean {
    return this.parser.token?.type === TokenType.NEW_LINE;
  }

  isLabelToken(token: Token | undefined): boolean {
    return token?.type === TokenType.COLON;
  }
}
