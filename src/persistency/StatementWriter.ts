import {
  Assignment,
  StatementVisitor,
  Number as NcNumber,
  Variable,
  Declaration,
  VariableType,
  GCode,
  Goto,
  GotoDirection,
  Instruction,
  FlowControlInstruction,
  FlowControlInstructionType,
  MCode,
} from '../models';
import { Constants } from './Constants';
import { ExpressionWriter } from './ExpressionWriter';
import { TextWriter } from './TextWriter';

export class StatementWriter implements StatementVisitor {
  expressionWriter: ExpressionWriter;

  constructor(private stream: TextWriter) {
    this.expressionWriter = new ExpressionWriter(this.stream);
  }

  public onAssignment(assignment: Assignment): void {
    this.stream.write(assignment.variable);
    if (assignment.variable.length == 1 && !assignment.fieldExpressions && assignment.expression instanceof NcNumber) {
      assignment.expression.visit(this.expressionWriter);
    } else {
      if (assignment.fieldExpressions) {
        new Variable('', assignment.fieldExpressions).visit(this.expressionWriter);
      }
      this.stream.write(Constants.ASSIGNMENT_OPERATOR);
      assignment.expression.visit(this.expressionWriter);
      this.stream.write(Constants.SPACE);
    }
  }

  public onDeclaration(declaration: Declaration): void {
    this.stream.write(Constants.DEF);
    this.stream.write(Constants.SPACE);
    this.stream.write(this.variableTypeToString(declaration.type));
    if (declaration.stringLength !== undefined) {
      this.stream.write(Constants.DEF_FIELD_BEGIN);
      this.stream.write(declaration.stringLength.toString());
      this.stream.write(Constants.DEF_FIELD_END);
    }
    this.stream.write(Constants.SPACE);
    this.writeValueIfDefined(declaration.unit, Constants.DEF_UNIT);
    this.writeValueIfDefined(declaration.lowerLimit, Constants.DEF_LOWER_LIMIT);
    this.writeValueIfDefined(declaration.upperLimit, Constants.DEF_UPPER_LIMIT);
    declaration.variables.forEach((variable, i) => {
      if (i > 0) {
        this.stream.write(Constants.DEF_SEPARATOR);
        this.stream.write(Constants.SPACE);
      }
      this.stream.write(variable.name);
      if (variable.fieldLengths) {
        this.stream.write(Constants.DEF_FIELD_BEGIN);
        this.stream.write(variable.fieldLengths.map((f) => f.toString()).join(Constants.DEF_SEPARATOR));
        this.stream.write(Constants.DEF_FIELD_END);
      }
      if (variable.initExpression) {
        this.stream.write(Constants.ASSIGNMENT_OPERATOR);
        variable.initExpression.visit(this.expressionWriter);
      }
      this.stream.write(Constants.SPACE);
    });
  }

  public onGCode(gCode: GCode): void {
    this.stream.write(Constants.G_CODE);
    this.stream.write(gCode.id < 10 ? `0${gCode.id}` : gCode.id.toString());
    if (gCode.args) {
      throw new Error(`Arguments to G code are not supported!`);
    }
  }

  public onGoto(gotoStatement: Goto): void {
    this.stream.write(Constants.GOTO);
    switch (gotoStatement.direction) {
      case GotoDirection.START:
        this.stream.write(Constants.GOTO_START);
        break;
      case GotoDirection.BACKWARD:
        this.stream.write(Constants.GOTO_BACKWARD);
        break;
      case GotoDirection.FORWARD:
        this.stream.write(Constants.GOTO_FORWARD);
        break;
      case GotoDirection.SEARCH:
        break;
      case GotoDirection.SEARCH_WITHOUT_ERROR:
        this.stream.write(Constants.GOTO_SEARCH_NO_ERRORS);
        break;
      default:
        throw new Error(`Unknown goto direction ${gotoStatement.direction}`);
    }
    this.stream.write(Constants.SPACE);
    if (gotoStatement.target) {
      gotoStatement.target.visit(this.expressionWriter);
      this.stream.write(Constants.SPACE);
    }
  }

  public onInstruction(instruction: Instruction): void {
    this.stream.write(instruction.name);
    if (instruction.expressions) {
      this.stream.write(Constants.OPENING_BRACE);
      instruction.expressions.forEach((e, i) => {
        if (i > 0) {
          this.stream.write(Constants.ARGUMENT_SEPARATOR);
        }

        e?.visit(this.expressionWriter);
      });
      this.stream.write(Constants.CLOSING_BRACE);
    } else {
      this.stream.write(Constants.SPACE);
    }
  }

  public onFlowControlInstruction(instruction: FlowControlInstruction): void {
    let writeOneExpression = false;
    switch (instruction.type) {
      case FlowControlInstructionType.IF:
        this.stream.write(Constants.IF);
        writeOneExpression = true;
        break;
      case FlowControlInstructionType.ELSE:
        this.stream.write(Constants.ELSE);
        break;
      case FlowControlInstructionType.ENDIF:
        this.stream.write(Constants.ENDIF);
        break;
      case FlowControlInstructionType.WHILE:
        this.stream.write(Constants.WHILE);
        writeOneExpression = true;
        break;
      case FlowControlInstructionType.ENDWHILE:
        this.stream.write(Constants.ENDWHILE);
        break;
      case FlowControlInstructionType.REPEAT:
        this.stream.write(Constants.REPEAT);
        break;
      case FlowControlInstructionType.UNTIL:
        this.stream.write(Constants.UNTIL);
        writeOneExpression = true;
        break;
      case FlowControlInstructionType.LOOP:
        this.stream.write(Constants.LOOP);
        break;
      case FlowControlInstructionType.ENDLOOP:
        this.stream.write(Constants.ENDLOOP);
        break;
      case FlowControlInstructionType.FOR:
        if (!instruction.expressions || instruction.expressions.length < 3) {
          throw new Error(`Expected three expressions for flow control instruction FOR`);
        }
        this.stream.write(Constants.FOR);
        this.stream.write(Constants.SPACE);
        instruction.expressions[0].visit(this.expressionWriter);
        this.stream.write(Constants.ASSIGNMENT_OPERATOR);
        instruction.expressions[1].visit(this.expressionWriter);
        this.stream.write(Constants.SPACE + Constants.FOR_TO + Constants.SPACE);
        instruction.expressions[2].visit(this.expressionWriter);
        break;
      case FlowControlInstructionType.ENDFOR:
        this.stream.write(Constants.ENDFOR);
        break;
      default:
        throw new Error(`Unknown flow control instruction ${instruction.type}`);
    }
    if (writeOneExpression) {
      if (!instruction.expressions || instruction.expressions.length !== 1) {
        throw new Error(`Expected one expression for flow control instruction ${instruction.type}`);
      }
      this.stream.write(Constants.SPACE);
      instruction.expressions[0].visit(this.expressionWriter);
    }
    this.stream.write(Constants.SPACE);
  }

  public onMCode(mCode: MCode): void {
    this.stream.write(Constants.M_CODE);
    this.stream.write(mCode.id < 10 ? `0${mCode.id}` : mCode.id.toString());
  }

  private writeValueIfDefined(value: number | undefined, token: string) {
    if (value !== undefined) {
      this.stream.write(token);
      this.stream.write(Constants.SPACE);
      this.stream.write(value.toString());
      this.stream.write(Constants.SPACE);
    }
  }

  private variableTypeToString(type: VariableType): string {
    switch (type) {
      case VariableType.INT:
        return Constants.DEF_INT;
      case VariableType.REAL:
        return Constants.DEF_REAL;
      case VariableType.BOOL:
        return Constants.DEF_BOOL;
      case VariableType.CHAR:
        return Constants.DEF_CHAR;
      case VariableType.STRING:
        return Constants.DEF_STRING;
      case VariableType.AXIS:
        return Constants.DEF_AXIS;
      case VariableType.FRAME:
        return Constants.DEF_FRAME;
      default:
        throw new Error(`Unknown tpye '${type}'`);
    }
  }
}
