import { Expression, Number } from '../models/Expressions';
import { Declaration, VariableDeclaration, VariableType } from '../models/Statements/Declaration';
import { Statement } from '../models/Statements/Statement';
import { Constants } from './Constants';
import { Errors } from './Errors';
import { ExpressionReader } from './ExpressionReader';
import { Parser } from './Parser';
import { ParserException } from './ParserException';
import { isAssignmentOperator, Token, TokenType } from './Token';

export class DeclarationReader {
  private expressionReader: ExpressionReader;
  constructor(private parser: Parser) {
    this.expressionReader = new ExpressionReader(parser);
  }

  public readDeclaration(): Statement {
    this.parser.tryRead(); // Skip 'DEF'.
    this.parser.assertNotLineOrFileEnd();

    const type = this.toVariableType();
    this.parser.tryRead(); // Skip variable type.

    const declaration = new Declaration(type);
    if (type === VariableType.STRING && this.isFieldBeginToken(this.parser.token)) {
      declaration.stringLength = this.readStringLength();
    }

    if (this.parser.token != null && this.isUnitToken(this.parser.token)) {
      this.parser.tryRead(); // Skip 'PHU'
      declaration.unit = this.parser.readIntegerNumber();
    }

    if (this.parser.token != null && this.isLowerLimitToken(this.parser.token)) {
      this.parser.tryRead(); // Skip 'LLI'
      declaration.lowerLimit = this.readDoubleNumber();
    }

    if (this.parser.token != null && this.isUpperLimitToken(this.parser.token)) {
      this.parser.tryRead(); // Skip 'ULI'
      declaration.upperLimit = this.readDoubleNumber();
    }

    declaration.variables = this.readVariables();

    return declaration;
  }

  private readStringLength(): number {
    this.parser.tryRead(); // Skip '['
    this.parser.assertNotLineOrFileEnd();

    const stringLength = this.parser.readIntegerNumber();

    if (!this.isFieldEndToken(this.parser.token)) {
      throw new ParserException(this.parser, Errors.EXPECTED_CLOSING_FIELD_BRACE);
    }
    this.parser.tryRead(); // Skip ']'

    return stringLength;
  }

  private readVariables(): VariableDeclaration[] {
    this.parser.assertNotLineOrFileEnd();

    const variables: VariableDeclaration[] = [];
    for (;;) {
      if (this.parser.token?.type !== TokenType.IDENTIFIER) {
        throw new ParserException(this.parser, Errors.EXPECTED_VARIABLE_NAME);
      }

      variables.push(this.readVariable());

      if (!this.isSeparatorToken(this.parser.token)) {
        break;
      }
      this.parser.tryRead(); // Skip ','
    }

    return variables;
  }

  private readVariable(): VariableDeclaration {
    const name = this.parser.token!.value;
    const fieldLengths = this.parser.tryRead() && this.isFieldBeginToken(this.parser.token) ? this.readFieldLengths() : undefined;
    const initExpression = isAssignmentOperator(this.parser.token) ? this.readInitExpression() : undefined;
    return { name, fieldLengths, initExpression };
  }

  private readFieldLengths(): number[] {
    const fieldLengths: number[] = [];
    do {
      this.parser.tryRead(); // Skip '[' or ','
      fieldLengths.push(this.parser.readIntegerNumber());
    } while (this.isSeparatorToken(this.parser.token));

    if (!this.isFieldEndToken(this.parser.token)) {
      throw new ParserException(this.parser, Errors.EXPECTED_CLOSING_FIELD_BRACE);
    }

    this.parser.tryRead(); // Skip ']'

    return fieldLengths;
  }

  private readInitExpression(): Expression {
    this.parser.tryRead(); // Skip '='.
    return this.expressionReader.readExpression();
  }

  toVariableType(): VariableType {
    if (this.parser.token?.type === TokenType.IDENTIFIER) {
      switch (this.parser.token.value.toUpperCase()) {
        case Constants.DEF_INT:
          return VariableType.INT;
        case Constants.DEF_REAL:
          return VariableType.REAL;
        case Constants.DEF_BOOL:
          return VariableType.BOOL;
        case Constants.DEF_CHAR:
          return VariableType.CHAR;
        case Constants.DEF_STRING:
          return VariableType.STRING;
        case Constants.DEF_AXIS:
          return VariableType.AXIS;
        case Constants.DEF_FRAME:
          return VariableType.FRAME;
      }
    }
    throw new ParserException(this.parser, Errors.EXPECTED_VARIABLE_TYPE);
  }

  readDoubleNumber(): number {
    const expression = this.expressionReader.readExpression();
    if (expression instanceof Number) {
      return expression.value;
    }
    throw new ParserException(this.parser, Errors.EXPECTED_NUMBER);
  }

  isFieldBeginToken(token: Token | undefined): boolean {
    return token?.type === TokenType.FIELD_BRACE && token.value.length === 1 && token.value[0] === Constants.DEF_FIELD_BEGIN;
  }

  private isFieldEndToken(token: Token | undefined): boolean {
    return token?.type === TokenType.FIELD_BRACE && token.value.length === 1 && token.value[0] === Constants.DEF_FIELD_END;
  }

  private isUnitToken(token: Token): boolean {
    return token.type === TokenType.IDENTIFIER && token.value === Constants.DEF_UNIT;
  }

  private isLowerLimitToken(token: Token): boolean {
    return token.type === TokenType.IDENTIFIER && token.value === Constants.DEF_LOWER_LIMIT;
  }

  private isUpperLimitToken(token: Token): boolean {
    return token.type === TokenType.IDENTIFIER && token.value === Constants.DEF_UPPER_LIMIT;
  }

  private isSeparatorToken(token: Token | undefined): boolean {
    return token?.type === TokenType.SEPARATOR && token.value.length === 1 && token.value[0] === Constants.DEF_SEPARATOR;
  }
}
