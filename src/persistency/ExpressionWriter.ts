import {
  BinaryOperation,
  BinaryOperator,
  Bracket,
  ExpressionVisitor,
  Function as NcFunction,
  Number as NcNumber,
  NumberFormat,
  String as NcString,
  UnaryOperation,
  UnaryOperator,
  Variable,
} from '../models';
import { Constants } from './Constants';
import { TextWriter } from './TextWriter';

export class ExpressionWriter implements ExpressionVisitor {
  constructor(private stream: TextWriter) {}

  onBinaryOperation(o: BinaryOperation): void {
    let op: string;
    switch (o.operator) {
      case BinaryOperator.MULTIPLY:
        op = Constants.MULTIPLY_OPERATOR;
        break;
      case BinaryOperator.DIVIDE:
        op = Constants.DIVIDE_OPERATOR;
        break;
      case BinaryOperator.DIV_DIVIDE:
        op = Constants.SPACE + Constants.DIV_OPERATOR + Constants.SPACE;
        break;
      case BinaryOperator.MODULO:
        op = Constants.SPACE + Constants.MOD_OPERATOR + Constants.SPACE;
        break;
      case BinaryOperator.ADD:
        op = Constants.ADD_OPERATOR;
        break;
      case BinaryOperator.SUBTRACT:
        op = Constants.SUBTRACT_OPERATOR;
        break;
      case BinaryOperator.B_AND:
        op = Constants.SPACE + Constants.B_AND_OPERATOR + Constants.SPACE;
        break;
      case BinaryOperator.B_XOR:
        op = Constants.SPACE + Constants.B_XOR_OPERATOR + Constants.SPACE;
        break;
      case BinaryOperator.B_OR:
        op = Constants.SPACE + Constants.B_OR_OPERATOR + Constants.SPACE;
        break;
      case BinaryOperator.AND:
        op = Constants.SPACE + Constants.AND_OPERATOR + Constants.SPACE;
        break;
      case BinaryOperator.XOR:
        op = Constants.SPACE + Constants.XOR_OPERATOR + Constants.SPACE;
        break;
      case BinaryOperator.OR:
        op = Constants.SPACE + Constants.OR_OPERATOR + Constants.SPACE;
        break;
      case BinaryOperator.CONCAT:
        op = Constants.SPACE + Constants.CONCAT_OPERATOR + Constants.SPACE;
        break;
      case BinaryOperator.EQUAL:
        op = Constants.SPACE + Constants.EQUAL_OPERATOR + Constants.SPACE;
        break;
      case BinaryOperator.INEQUAL:
        op = Constants.SPACE + Constants.INEQUAL_OPERATOR + Constants.SPACE;
        break;
      case BinaryOperator.GREATER:
        op = Constants.SPACE + Constants.GREATER_OPERATOR + Constants.SPACE;
        break;
      case BinaryOperator.LESS:
        op = Constants.SPACE + Constants.LESS_OPERATOR + Constants.SPACE;
        break;
      case BinaryOperator.GREATER_EQUAL:
        op = Constants.SPACE + Constants.GREATER_EQUAL_OPERATOR + Constants.SPACE;
        break;
      case BinaryOperator.LESS_EQUAL:
        op = Constants.SPACE + Constants.LESS_EQUAL_OPERATOR + Constants.SPACE;
        break;
      default:
        throw new Error(`Unknown binary operation ${o.operator}`);
    }

    o.leftExpression.visit(this);
    this.stream.write(op);
    o.rightExpression.visit(this);
  }

  public onBracket(b: Bracket): void {
    this.stream.write(Constants.OPENING_BRACE);
    b.innerExpression.visit(this);
    this.stream.write(Constants.CLOSING_BRACE);
  }

  public onFunction(f: NcFunction): void {
    this.stream.write(f.name);
    this.stream.write(Constants.OPENING_BRACE);
    f.args.forEach((a, i) => {
      if (i > 0) {
        this.stream.write(Constants.ARGUMENT_SEPARATOR);
      }

      if (a !== undefined && a !== null) {
        a.visit(this);
      }
    });
    this.stream.write(Constants.CLOSING_BRACE);
  }

  public onNumber(n: NcNumber): void {
    if (n.isInteger) {
      const value = n.value;
      switch (n.numberFormat) {
        case NumberFormat.HEXADECIMAL:
          this.stream.write(Constants.NUMBER_CONSTANT_SEPARATOR);
          this.stream.write('H');
          this.stream.write(value.toString(16));
          this.stream.write(Constants.NUMBER_CONSTANT_SEPARATOR);
          break;

        case NumberFormat.BINARY:
          this.stream.write(Constants.NUMBER_CONSTANT_SEPARATOR);
          this.stream.write('B');
          this.stream.write(value.toString(2));
          this.stream.write(Constants.NUMBER_CONSTANT_SEPARATOR);
          break;

        case NumberFormat.DECIMAL:
          this.stream.write(value.toString());
          break;

        default:
          throw new Error(`Unknown number format ${n.numberFormat}`);
      }
    } else {
      if (n.numberFormat !== NumberFormat.DECIMAL) {
        throw new Error(`Expected decimal number format for decimal numbers, but found ${n.numberFormat}`);
      }

      this.stream.write(n.value.toString());
    }
  }

  public onString(s: NcString): void {
    this.stream.write(Constants.STRING_SEPARATOR);
    this.stream.write(s.value); // Is there any escaping mechanism?
    this.stream.write(Constants.STRING_SEPARATOR);
  }

  public onUnaryOperation(o: UnaryOperation): void {
    switch (o.operator) {
      case UnaryOperator.NOT:
        this.stream.write(Constants.LOGICAL_NOT_OPERATOR);
        break;
      case UnaryOperator.B_NOT:
        this.stream.write(Constants.BITWISE_NOT_OPERATOR);
        break;
      case UnaryOperator.NEGATE:
        this.stream.write(Constants.MINUS_SIGN);
        break;
      case UnaryOperator.TO_STRING:
        this.stream.write(Constants.CONCAT_OPERATOR);
        break;
      default:
        throw new Error(`Unknown unary operator ${o.operator}`);
    }
    o.expression.visit(this);
  }

  public onVariable(v: Variable): void {
    this.stream.write(v.name);
    if (v.fieldExpressions) {
      this.stream.write(Constants.OPENING_FIELD_BRACE);
      v.fieldExpressions.forEach((e, i) => {
        if (i > 0) {
          this.stream.write(Constants.ARGUMENT_SEPARATOR);
        }

        if (e !== undefined && e !== null) {
          e.visit(this);
        }
      });
      this.stream.write(Constants.CLOSING_FIELD_BRACE);
    }
  }
}
