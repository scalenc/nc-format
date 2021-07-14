/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BinaryOperation, Expression } from '../models/Expressions';
import { Errors } from './Errors';
import { Parser } from './Parser';
import { ParserException } from './ParserException';
import * as Expressions from '../models/Expressions';
import { Token, TokenType, tryParseNumber } from './Token';
import { Constants } from './Constants';

const UNARY_OPERATORS: Record<string, Expressions.UnaryOperator> = {
  [Constants.BITWISE_NOT_OPERATOR]: Expressions.UnaryOperator.B_NOT,
  [Constants.LOGICAL_NOT_OPERATOR]: Expressions.UnaryOperator.NOT,
  [Constants.MINUS_SIGN]: Expressions.UnaryOperator.NEGATE,
  [Constants.CONCAT_OPERATOR]: Expressions.UnaryOperator.TO_STRING,
};

const BINARY_OPERATORS: Record<string, Expressions.BinaryOperator> = {
  [Constants.MULTIPLY_OPERATOR]: Expressions.BinaryOperator.MULTIPLY,
  [Constants.DIVIDE_OPERATOR]: Expressions.BinaryOperator.DIVIDE,
  [Constants.ADD_OPERATOR]: Expressions.BinaryOperator.ADD,
  [Constants.SUBTRACT_OPERATOR]: Expressions.BinaryOperator.SUBTRACT,
  [Constants.CONCAT_OPERATOR]: Expressions.BinaryOperator.CONCAT,
  [Constants.EQUAL_OPERATOR]: Expressions.BinaryOperator.EQUAL,
  [Constants.INEQUAL_OPERATOR]: Expressions.BinaryOperator.INEQUAL,
  [Constants.LESS_OPERATOR]: Expressions.BinaryOperator.LESS,
  [Constants.LESS_EQUAL_OPERATOR]: Expressions.BinaryOperator.LESS_EQUAL,
  [Constants.GREATER_EQUAL_OPERATOR]: Expressions.BinaryOperator.GREATER_EQUAL,
  [Constants.GREATER_OPERATOR]: Expressions.BinaryOperator.GREATER,
  [Constants.DIV_OPERATOR]: Expressions.BinaryOperator.DIV_DIVIDE,
  [Constants.MOD_OPERATOR]: Expressions.BinaryOperator.MODULO,
  [Constants.B_AND_OPERATOR]: Expressions.BinaryOperator.B_AND,
  [Constants.B_XOR_OPERATOR]: Expressions.BinaryOperator.B_XOR,
  [Constants.B_OR_OPERATOR]: Expressions.BinaryOperator.B_OR,
  [Constants.AND_OPERATOR]: Expressions.BinaryOperator.AND,
  [Constants.XOR_OPERATOR]: Expressions.BinaryOperator.XOR,
  [Constants.OR_OPERATOR]: Expressions.BinaryOperator.OR,
};

export class ExpressionReader {
  constructor(private parser: Parser) {}

  readExpression(): Expression {
    let operant = this.readOperant();

    let binaryOperator = this.tryReadBinaryOperator();
    if (binaryOperator) {
      const stack: BinaryOperation[] = [];
      for (; binaryOperator; binaryOperator = this.tryReadBinaryOperator()) {
        while (stack.length > 0 && this.firstHasLowerOrEqualPriority(binaryOperator, stack[stack.length - 1].operator)) {
          stack.pop();
        }

        const binaryOperation = new Expressions.BinaryOperation(binaryOperator, undefined as unknown as Expression, undefined as unknown as Expression);
        if (stack.length === 0) {
          binaryOperation.leftExpression = operant;
          operant = binaryOperation;
        } else {
          binaryOperation.leftExpression = stack[stack.length - 1].rightExpression;
          stack[stack.length - 1].rightExpression = binaryOperation;
        }
        stack.push(binaryOperation);

        binaryOperation.rightExpression = this.readOperant();
      }
    }

    return operant;
  }

  private readOperant(): Expression {
    const unaryOperator = this.tryReadUnaryOperator();
    if (unaryOperator) {
      const unaryOperation = new Expressions.UnaryOperation(unaryOperator, this.readOperant());
      return this.tryMergeNegativeNumber(unaryOperation);
    }

    this.assertNotLineOrFileEnd();

    let expression: Expression;
    if (this.isNumberToken(this.parser.token)) {
      expression = this.readNumber();
    } else if (this.isNameToken(this.parser.token)) {
      expression = this.readVariableOrFunction();
    } else if (this.isOpeningBracket(this.parser.token)) {
      expression = this.readBracket();
    } else if (this.isString(this.parser.token)) {
      expression = this.readString();
    } else {
      throw new ParserException(this.parser, Errors.EXPECTED_OPERANT);
    }
    return expression;
  }

  private readNumber(): Expression {
    if (!this.parser.token) {
      throw new ParserException(this.parser, Errors.INVALID_NUMBER);
    }
    const value = tryParseNumber(this.parser.token);
    if (value === undefined) {
      throw new ParserException(this.parser, Errors.INVALID_NUMBER);
    }

    const isInteger = !this.parser.token.value.includes(Constants.DECIMAL_CHAR);
    const numberFormat = 'hH'.includes(this.parser.token.value[0])
      ? Expressions.NumberFormat.HEXADECIMAL
      : 'bB'.includes(this.parser.token.value[0])
      ? Expressions.NumberFormat.BINARY
      : Expressions.NumberFormat.DECIMAL;
    const number = new Expressions.Number(value, isInteger, numberFormat);

    if (this.parser.tryRead() && this.isNumberExponent(this.parser.token)) {
      this.parser.tryRead(); // Skip 'EX'.
      const exponentSign = this.tryReadSignToken();

      this.assertNotLineOrFileEnd();
      ParserException.expected(this.isDecimalNumberToken(this.parser.token), this.parser, Errors.EXPECTED_NUMBER);

      const exponent = exponentSign * +this.parser.token.value;
      number.value *= Math.pow(10, exponent);
      number.isInteger = false;
    }

    return number;
  }

  private readVariableOrFunction(): Expression {
    const name = this.parser.token!.value;
    const expression = this.parser.tryRead() && this.isOpeningBracket(this.parser.token) ? this.readFunction(name) : this.readVariable(name);
    return expression;
  }

  private readFunction(name: string): Expression {
    return new Expressions.Function(name, this.readParameterList());
  }

  private readVariable(name: string): Expression {
    if (
      name.length === 1 &&
      this.parser.token &&
      !this.parser.token.whiteSpace &&
      this.isDecimalNumberToken(this.parser.token) &&
      !this.parser.token.value.includes(Constants.DECIMAL_CHAR)
    ) {
      name += this.parser.token.value;
      this.parser.tryRead();
    }

    const fieldExpressions = this.parser.token && this.isOpeningFieldBracket(this.parser.token) ? this.readParameterList(true) : undefined;
    return new Expressions.Variable(name, fieldExpressions);
  }

  private readParameterList(fieldBrace = false): (Expression | null)[] {
    this.parser.tryRead(); // Skip '[' or '('.

    const parameters: (Expression | null)[] = [];
    for (;;) {
      this.assertNotLineOrFileEnd();

      if (fieldBrace ? this.isClosingFieldBracket(this.parser.token) : this.isClosingBracket(this.parser.token)) {
        this.parser.tryRead(); // Skip ']' or ')'.
        break;
      }

      if (this.isArgumentSeparator(this.parser.token)) {
        parameters.push(null);
      } else {
        parameters.push(this.readExpression());
      }

      if (this.isArgumentSeparator(this.parser.token)) {
        this.parser.tryRead(); // Skip ','.
      }
    }

    return parameters;
  }

  private readBracket(): Expression {
    this.parser.tryRead(); // Skip '('.
    const expression = new Expressions.Bracket(this.readExpression());
    this.assertNotLineOrFileEnd();
    ParserException.expected(this.isClosingBracket(this.parser.token), this.parser, Errors.EXPECTED_CLOSING_BRACE);
    this.parser.tryRead(); // Skip ')'.
    return expression;
  }

  private readString(): Expression {
    const expression = new Expressions.String(this.parser.token!.value);
    this.parser.tryRead();
    return expression;
  }

  private tryReadBinaryOperator(): Expressions.BinaryOperator | undefined {
    if (!this.isOperatorToken(this.parser.token)) {
      return undefined;
    }
    const binaryOperator = BINARY_OPERATORS[this.parser.token!.value.toUpperCase()];
    ParserException.expected(!!binaryOperator, this.parser, Errors.EXPECTED_BINARY_OPERATOR);

    this.parser.tryRead();
    return binaryOperator;
  }

  private tryReadUnaryOperator(): Expressions.UnaryOperator | undefined {
    if (!this.isOperatorToken(this.parser.token)) {
      return undefined;
    }
    if (this.parser.token!.value === Constants.PLUS_SIGN) {
      this.parser.tryRead(); // Just skip operator.
      return undefined;
    }
    const unaryOperator = UNARY_OPERATORS[this.parser.token!.value.toUpperCase()];
    ParserException.expected(!!unaryOperator, this.parser, Errors.EXPECTED_OPERANT);
    this.parser.tryRead();
    return unaryOperator;
  }

  private tryMergeNegativeNumber(unaryOperation: Expressions.UnaryOperation): Expression {
    if (unaryOperation.operator === Expressions.UnaryOperator.NEGATE && unaryOperation.expression instanceof Expressions.Number) {
      unaryOperation.expression.value = -unaryOperation.expression.value;
      return unaryOperation.expression;
    }
    return unaryOperation;
  }

  private tryReadSignToken(): number {
    if (!this.isSignToken(this.parser.token)) {
      return +1;
    }
    const sign = this.parser.token!.value === Constants.MINUS_SIGN ? -1 : +1;
    this.parser.tryRead();
    return sign;
  }

  private isLineOrFileEnd(token: Token | undefined): boolean {
    return !token || token.type === TokenType.NEW_LINE || token.type === TokenType.COMMENT;
  }

  private isSignToken(token: Token | undefined): boolean {
    return token?.type === TokenType.OPERATOR && (token.value === Constants.PLUS_SIGN || token.value === Constants.MINUS_SIGN);
  }

  private isOperatorToken(token: Token | undefined): boolean {
    return token?.type === TokenType.OPERATOR && !(token.value.length === 1 && token.value[0] === Constants.ASSIGNMENT_OPERATOR);
  }

  private isDecimalNumberToken(token: Token | undefined): boolean {
    return this.isNumberToken(token) && Constants.DIGIT_CHARS.test(token!.value[0]);
  }

  private isNumberToken(token: Token | undefined): boolean {
    return token?.type === TokenType.NUMBER;
  }

  private isNumberExponent(token: Token | undefined): boolean {
    return token?.type === TokenType.IDENTIFIER && !token.whiteSpace && token.value.toUpperCase() === Constants.NUMBER_EXPONENT;
  }

  private isNameToken(token: Token | undefined): boolean {
    return token?.type === TokenType.IDENTIFIER;
  }

  private isOpeningBracket(token: Token | undefined): boolean {
    return token?.type === TokenType.BRACE && token.value.length === 1 && token.value[0] === Constants.OPENING_BRACE;
  }

  private isClosingBracket(token: Token | undefined): boolean {
    return token?.type === TokenType.BRACE && token.value.length === 1 && token.value[0] === Constants.CLOSING_BRACE;
  }

  private isOpeningFieldBracket(token: Token | undefined): boolean {
    return token?.type === TokenType.FIELD_BRACE && token.value.length === 1 && token.value[0] === Constants.OPENING_FIELD_BRACE;
  }

  private isClosingFieldBracket(token: Token | undefined): boolean {
    return token?.type === TokenType.FIELD_BRACE && token.value.length === 1 && token.value[0] === Constants.CLOSING_FIELD_BRACE;
  }

  private isArgumentSeparator(token: Token | undefined): boolean {
    return token?.type === TokenType.SEPARATOR;
  }

  private isString(token: Token | undefined): boolean {
    return token?.type === TokenType.STRING;
  }

  assertNotLineOrFileEnd(): void {
    ParserException.assert(!this.isLineOrFileEnd(this.parser.token), this.parser, Errors.UNEXPECTED_LINE_OR_FILE_END);
  }

  firstHasLowerOrEqualPriority(operation1: Expressions.BinaryOperator, operation2: Expressions.BinaryOperator): boolean {
    const priority1 = this.getPriority(operation1);
    const priority2 = this.getPriority(operation2);
    return priority1 <= priority2;
  }

  getPriority(binaryOperator: Expressions.BinaryOperator): number {
    switch (binaryOperator) {
      case Expressions.BinaryOperator.MULTIPLY:
      case Expressions.BinaryOperator.DIVIDE:
      case Expressions.BinaryOperator.DIV_DIVIDE:
      case Expressions.BinaryOperator.MODULO:
        return 10;
      case Expressions.BinaryOperator.ADD:
      case Expressions.BinaryOperator.SUBTRACT:
        return 9;
      case Expressions.BinaryOperator.B_AND:
        return 8;
      case Expressions.BinaryOperator.B_XOR:
        return 7;
      case Expressions.BinaryOperator.B_OR:
        return 6;
      case Expressions.BinaryOperator.AND:
        return 5;
      case Expressions.BinaryOperator.XOR:
        return 4;
      case Expressions.BinaryOperator.OR:
        return 3;
      case Expressions.BinaryOperator.CONCAT:
        return 2;
      default:
        return 1;
    }
  }
}
