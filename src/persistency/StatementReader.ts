import { BinaryOperation, BinaryOperator, Expression, Function, Number, String, Variable } from '../models/Expressions';
import { Assignment } from '../models/Statements/Assignment';
import { FlowControlInstruction, FlowControlInstructionType } from '../models/Statements/FlowControlInstruction';
import { GCode } from '../models/Statements/GCode';
import { Goto, GotoDirection } from '../models/Statements/Goto';
import { Instruction } from '../models/Statements/Instruction';
import { MCode } from '../models/Statements/MCode';
import { Statement } from '../models/Statements/Statement';
import { Constants } from './Constants';
import { DeclarationReader } from './DeclarationReader';
import { Errors } from './Errors';
import { ExpressionReader } from './ExpressionReader';
import { Parser } from './Parser';
import { ParserException } from './ParserException';
import {
  isAssignmentOperator,
  isCloseingFieldBrace,
  isDeclaration,
  isFlowControlInstruction,
  isGCode,
  isGoto,
  isLineOrFileEnd,
  isMCode,
  isOpeningFieldBrace,
  isToKeyword,
  TokenType,
} from './Token';

export class StatementReader {
  private expressionReader: ExpressionReader;
  enableGCodeArguments = false;
  enableStringInstructions = false;

  constructor(private parser: Parser) {
    this.expressionReader = new ExpressionReader(parser);
  }

  public read(): Statement {
    const statement = this.tryRead();
    if (!statement) {
      throw new ParserException(this.parser, Errors.UNEXPECTED_LINE_OR_FILE_END);
    }
    return statement;
  }

  public tryRead(): Statement | undefined {
    if (isLineOrFileEnd(this.parser.token)) {
      return undefined;
    }

    if (isGCode(this.parser.token)) {
      return this.readGCode();
    } else if (isMCode(this.parser.token)) {
      return this.readMCode();
    } else if (isGoto(this.parser.token)) {
      return this.readGoto();
    } else if (isDeclaration(this.parser.token)) {
      return this.readDeclaration();
    } else if (isFlowControlInstruction(this.parser.token)) {
      return this.readFlowControlInstruction();
    } else {
      return this.readAssignmentOrInstruction();
    }
  }

  private readGCode(): Statement {
    this.parser.tryRead(); // Skip 'G'.
    this.parser.assertNotLineOrFileEnd();

    const id = this.parser.readIntegerNumber();
    const args = this.enableGCodeArguments && isOpeningFieldBrace(this.parser.token) ? this.readFieldBraceArguments() : undefined;
    return new GCode(id, args);
  }

  private readFieldBraceArguments(): Expression[] {
    const args: Expression[] = [];
    while (this.parser.tryRead()) {
      // Skip '[', or ','
      this.parser.assertNotLineOrFileEnd();
      args.push(this.expressionReader.readExpression());
      if (this.parser.token?.type !== TokenType.SEPARATOR) {
        break;
      }
    }

    ParserException.assert(isCloseingFieldBrace(this.parser.token), this.parser, Errors.EXPECTED_CLOSING_FIELD_BRACE);
    this.parser.tryRead(); // Skip ']'.

    return args;
  }

  readMCode(): Statement {
    this.parser.tryRead(); // Skip 'M'.
    this.parser.assertNotLineOrFileEnd();

    return new MCode(this.parser.readIntegerNumber());
  }

  readGoto(): Statement {
    let direction = GotoDirection.SEARCH;
    if (this.parser.token && this.parser.token.value.length !== Constants.GOTO.length) {
      switch (this.parser.token.value[Constants.GOTO.length].toUpperCase()) {
        case Constants.GOTO_START:
          direction = GotoDirection.START;
          break;
        case Constants.GOTO_BACKWARD:
          direction = GotoDirection.BACKWARD;
          break;
        case Constants.GOTO_FORWARD:
          direction = GotoDirection.FORWARD;
          break;
        case Constants.GOTO_SEARCH_NO_ERRORS:
          direction = GotoDirection.SEARCH_WITHOUT_ERROR;
          break;
        default:
          ParserException.fail(this.parser, Errors.EXPECTED_GOTO);
          break;
      }
    }

    this.parser.tryRead();
    let target: Expression | undefined = undefined;
    if (direction !== GotoDirection.START) {
      this.parser.assertNotLineOrFileEnd();
      target = this.expressionReader.readExpression();
    }

    return new Goto(direction, target);
  }

  readDeclaration(): Statement {
    const declarationReader = new DeclarationReader(this.parser);
    return declarationReader.readDeclaration();
  }

  readFlowControlInstruction(): Statement {
    const name = this.parser.token?.value.toUpperCase();
    this.parser.tryRead(); // Skip instruction keyword.

    let type: FlowControlInstructionType;
    let expressions: Expression[] | undefined;
    switch (name) {
      case Constants.IF:
        type = FlowControlInstructionType.IF;
        expressions = [this.expressionReader.readExpression()];
        break;
      case Constants.ELSE:
        type = FlowControlInstructionType.ELSE;
        break;
      case Constants.ENDIF:
        type = FlowControlInstructionType.ENDIF;
        break;
      case Constants.WHILE:
        type = FlowControlInstructionType.WHILE;
        expressions = [this.expressionReader.readExpression()];
        break;
      case Constants.ENDWHILE:
        type = FlowControlInstructionType.ENDWHILE;
        break;
      case Constants.REPEAT:
        type = FlowControlInstructionType.REPEAT;
        break;
      case Constants.UNTIL:
        type = FlowControlInstructionType.UNTIL;
        expressions = [this.expressionReader.readExpression()];
        break;
      case Constants.LOOP:
        type = FlowControlInstructionType.LOOP;
        break;
      case Constants.ENDLOOP:
        type = FlowControlInstructionType.ENDLOOP;
        break;
      case Constants.FOR: {
        type = FlowControlInstructionType.FOR;
        const assignment = this.readAssignmentOrInstruction();
        if (!(assignment instanceof Assignment)) {
          throw new ParserException(this.parser, Errors.EXPECTED_ASSIGNMENT_BUT_INSTRUCTION);
        }
        if (!isToKeyword(this.parser.token)) {
          throw new ParserException(this.parser, Errors.EXPECTED_TO_KEYWORD);
        }
        this.parser.tryRead(); // Skip 'TO'.
        const expression = this.expressionReader.readExpression();
        expressions = [new Variable(assignment.variable), assignment.expression, expression];
        break;
      }
      case Constants.ENDFOR:
        type = FlowControlInstructionType.ENDFOR;
        break;
      default:
        throw new Error(`Expected flow control instruction but found ${name}`);
    }

    return new FlowControlInstruction(type, expressions);
  }

  readAssignmentOrInstruction(): Statement {
    const expression = this.expressionReader.readExpression();
    if (expression instanceof Variable) {
      if (isAssignmentOperator(this.parser.token)) {
        return this.readExplicitAssignment(expression);
      }

      if (expression.fieldExpressions) {
        throw new ParserException(this.parser, Errors.UNEXPECTED_FIELD_BRACES);
      }

      if (expression.name.length === 1) {
        return this.readInlineAssignment(expression.name);
      }

      if (Constants.DIGIT_CHARS.test(expression.name[1])) {
        return this.splitInlineAssignment(expression.name);
      }

      return new Instruction(expression.name);
    }

    if (expression instanceof Function) {
      return new Instruction(expression.name, expression.args);
    }

    if (expression instanceof BinaryOperation) {
      return this.extractInlineAssignmentWithSign(expression);
    }

    if (this.enableStringInstructions && expression instanceof String) {
      return new Instruction(`${Constants.STRING_SEPARATOR}${expression.value}${Constants.STRING_SEPARATOR}`);
    }

    throw new ParserException(this.parser, Errors.EXPECTED_ASSIGNMENT_OR_INSTRUCTION_BUT_FOUND_EXPRESSION);
  }

  readExplicitAssignment(variable: Variable): Statement {
    this.parser.tryRead(); // Skip '='.
    const expression = this.expressionReader.readExpression();

    return new Assignment(variable.name, variable.fieldExpressions, expression);
  }

  readInlineAssignment(name: string): Statement {
    const expression = this.expressionReader.readExpression();

    return new Assignment(name, undefined, expression);
  }

  splitInlineAssignment(name: string): Statement {
    return new Assignment(name.substring(0, 1), undefined, new Number(+name.substring(1), true));
  }

  extractInlineAssignmentWithSign(binaryOperation: BinaryOperation): Assignment {
    // Note, there might be more complicated expressions which are not supported by this algorithm,
    // e.g. X-1.2+3 which should read as X = -1.2+3, but is {{X - 1.2} + 3}. Thus, the left expression
    // is no number but a binary '-' operation.
    if (binaryOperation.operator === BinaryOperator.ADD || binaryOperation.operator === BinaryOperator.SUBTRACT) {
      if (
        binaryOperation.leftExpression instanceof Variable &&
        !binaryOperation.leftExpression.fieldExpressions &&
        binaryOperation.leftExpression.name.length === 1
      ) {
        if (binaryOperation.operator === BinaryOperator.SUBTRACT) {
          if (binaryOperation.rightExpression instanceof Number) {
            binaryOperation.rightExpression.value = -binaryOperation.rightExpression.value;
          }
        }

        return new Assignment(binaryOperation.leftExpression.name, undefined, binaryOperation.rightExpression);
      }
    }

    throw new ParserException(this.parser, Errors.EXPECTED_ASSIGNMENT_OR_INSTRUCTION_BUT_FOUND_EXPRESSION);
  }
}
