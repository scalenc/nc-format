import { Constants } from './Constants';
import { Errors } from './Errors';
import { ParserException } from './ParserException';
import { isLineOrFileEnd, Token, TokenType, tryGetNumberAsInteger } from './Token';

export class Parser {
  index = 0;
  line = 1;
  token?: Token;
  enableLineComments = true;
  enableBraceComments = false;

  constructor(private input: string) {}

  get isOk(): boolean {
    return this.index < this.input.length;
  }
  get char(): string {
    return this.input[this.index];
  }
  get isAtLineEnd(): boolean {
    return this.char === Constants.CARRIAGE_RETURN || this.char === Constants.NEW_LINE;
  }
  get isNameChar(): boolean {
    return Constants.NAME_CHARS.test(this.char);
  }
  get isDigitChar(): boolean {
    return Constants.DIGIT_CHARS.test(this.char);
  }
  get isNumberChar(): boolean {
    return Constants.NUMBER_CHARS.test(this.char);
  }
  get isNumberConstantChar(): boolean {
    return this.char === Constants.NUMBER_CONSTANT_SEPARATOR;
  }
  get isStringChar(): boolean {
    return this.char === Constants.STRING_SEPARATOR;
  }
  get isArgumentSeparatorChar(): boolean {
    return this.char === Constants.ARGUMENT_SEPARATOR;
  }
  get isBraceChar(): boolean {
    return this.char === Constants.OPENING_BRACE || this.char === Constants.CLOSING_BRACE;
  }
  get isColonChar(): boolean {
    return this.char === Constants.COLON;
  }
  get isOperatorChar(): boolean {
    return Constants.OPERATOR_CHARS.includes(this.char);
  }
  get isFieldBraceChar(): boolean {
    return this.char === Constants.DEF_FIELD_BEGIN || this.char === Constants.DEF_FIELD_END;
  }

  assertNotLineOrFileEnd() {
    ParserException.assert(!isLineOrFileEnd(this.token), this, Errors.UNEXPECTED_LINE_OR_FILE_END);
  }

  readIntegerNumber(): number {
    const value = tryGetNumberAsInteger(this.token);
    if (value === undefined) {
      throw new ParserException(this, Errors.EXPECTED_INTEGER);
    }
    this.tryRead();
    return value;
  }

  tryRead(): boolean {
    const whiteSpace = this.trySkipWhiteSpace();

    if (!this.isOk) {
      this.token = undefined;
    } else if (this.isAtLineEnd) {
      this.token = { type: TokenType.NEW_LINE, whiteSpace, value: this.readSingle() };
    } else if (this.enableLineComments && this.char === Constants.COMMENT_CHAR) {
      this.token = { type: TokenType.COMMENT, whiteSpace, value: this.readComment() };
    } else if (this.enableBraceComments && this.char === Constants.OPENING_BRACE) {
      this.token = { type: TokenType.COMMENT, whiteSpace, value: this.readBraceComment() };
    } else if (this.isNameChar) {
      this.token = { type: TokenType.IDENTIFIER, whiteSpace, value: this.readName() };
      this.correctTokenTypeForNamedOperators();
    } else if (this.isNumberConstantChar) {
      this.token = { type: TokenType.NUMBER, whiteSpace, value: this.readNumberConstant() };
    } else if (this.isNumberChar) {
      this.token = { type: TokenType.NUMBER, whiteSpace, value: this.readNumber() };
    } else if (this.isStringChar) {
      this.token = { type: TokenType.STRING, whiteSpace, value: this.readString() };
    } else if (this.isArgumentSeparatorChar) {
      this.token = { type: TokenType.SEPARATOR, whiteSpace, value: this.readSingle() };
    } else if (this.isColonChar) {
      this.token = { type: TokenType.COLON, whiteSpace, value: this.readSingle() };
    } else if (this.isBraceChar) {
      this.token = { type: TokenType.BRACE, whiteSpace, value: this.readSingle() };
    } else if (this.isOperatorChar) {
      this.token = { type: TokenType.OPERATOR, whiteSpace, value: this.readOperator() };
    } else if (this.isFieldBraceChar) {
      this.token = { type: TokenType.FIELD_BRACE, whiteSpace, value: this.readSingle() };
    } else {
      throw new ParserException(this, Errors.INVALID_CHARACTER.replace(/\{0\}/g, this.char));
    }
    return !!this.token;
  }

  private readComment(): string {
    return this.readWhile(() => !this.isAtLineEnd, 1);
  }

  private readBraceComment(): string {
    const comment = this.readWhile(() => !this.isAtLineEnd && this.char != Constants.CLOSING_BRACE, 1);
    if (this.char === Constants.CLOSING_BRACE) {
      this.tryReadNextChar(); // Skip end of comment.
      this.trySkipWhiteSpace();
      ParserException.assert(this.isAtLineEnd, this, Errors.ADDTIONAL_CHARS_AFTER_BRACE_COMMENT);
    }
    return comment;
  }

  private readName(): string {
    const i = this.index;
    return this.readWhile(() => this.isNameChar || (this.isDigitChar && !this.isSpecialName(i)));
  }

  private isSpecialName(startIndex: number) {
    return (
      // One-character names with subsequent digit are assignments, e.g. 'N100'.
      this.index - startIndex === 1 ||
      // 'EX' with subsequent digit are exponents for numbers, e.g. '1EX3'.
      (this.index - startIndex === 2 && this.input.substring(startIndex, this.index).toUpperCase() === Constants.NUMBER_EXPONENT)
    );
  }

  private readNumber(): string {
    let hasDot = this.char === '.';
    return this.readWhile(() => {
      if (this.char === '.') {
        ParserException.assert(!hasDot, this, Errors.TOO_MANY_DECIMAL_CHARS);
        hasDot = true;
      }
      return this.isNumberChar;
    });
  }

  private readNumberConstant(): string {
    const content = this.readWhile(() => !this.isAtLineEnd && !this.isNumberConstantChar, 1);
    ParserException.assert(this.isOk && this.isNumberConstantChar, this, Errors.MISSING_STRING_END);
    this.tryReadNextChar(); // Skip end of number constant.
    return content;
  }

  private readString(): string {
    const content = this.readWhile(() => !this.isAtLineEnd && !this.isStringChar, 1);
    ParserException.assert(this.isOk && this.isStringChar, this, Errors.MISSING_STRING_END);
    this.tryReadNextChar(); // Skip end of string.
    return content;
  }

  private readOperator(): string {
    let s = this.readSingle();
    while (this.isOk && this.isOperatorChar && this.isValidOperator(s + this.char)) {
      s += this.char;
      this.tryReadNextChar();
    }
    return s;
  }

  isValidOperator(s: string): boolean {
    if (s.length === 2) {
      if (s[0] === Constants.LESS_OPERATOR_CHAR) {
        return s[1] === Constants.LESS_OPERATOR_CHAR || s[1] === Constants.EQUAL_OPERATOR_CHAR || s[1] === Constants.GREATER_OPERATOR_CHAR;
      }

      return (s[0] === Constants.GREATER_OPERATOR_CHAR || s[0] === Constants.EQUAL_OPERATOR_CHAR) && s[1] === Constants.EQUAL_OPERATOR_CHAR;
    }

    return s.length === 1;
  }

  correctTokenTypeForNamedOperators() {
    if (Constants.NAMED_OPERATORS.includes(this.token!.value.toUpperCase())) {
      this.token!.type = TokenType.OPERATOR;
    }
  }

  trySkipWhiteSpace(): string {
    const isWhiteSpace = () => !this.isAtLineEnd && Constants.WHITE_SPACE_CHARS.test(this.char);
    return isWhiteSpace() ? this.readWhile(isWhiteSpace) : '';
  }

  private readSingle(): string {
    const c = this.char;
    this.tryReadNextChar();
    return c;
  }

  private readWhile(predicate: () => boolean, skipFirst = 0): string {
    const i = this.index + skipFirst;
    while (this.tryReadNextChar() && predicate()) {}

    return this.input.substring(i, this.index);
  }

  private tryReadNextChar(): boolean {
    if (this.isOk) {
      ++this.index;

      if (this.isAtLineEnd) {
        ++this.line;
        if (this.char === Constants.CARRIAGE_RETURN && this.input[this.index + 1] === Constants.NEW_LINE) {
          ++this.index;
        }
      }
    }
    return this.isOk;
  }
}
