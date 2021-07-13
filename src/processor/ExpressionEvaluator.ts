import {
  BinaryOperation,
  BinaryOperator,
  Bracket,
  Expression,
  ExpressionVisitor,
  Function,
  Number,
  String,
  UnaryOperation,
  UnaryOperator,
  Variable,
} from '../models';
import { Errors } from './Errors';
import { ProcessorException } from './ProcessorException';
import { Variables } from './Variables';

export function asNumber(value: string | number | undefined): number {
  if (typeof value === 'number') {
    return value;
  }
  throw new Error(`Expected value '${value}' to be a number`);
}

export function asInt(value: string | number | undefined): number {
  return Math.trunc(asNumber(value));
}

export function asString(value: string | number | undefined): string {
  if (typeof value === 'string') {
    return value;
  }
  throw new Error(`Expected value '${value}' to be a string`);
}

class ExpressionEvaluator implements ExpressionVisitor {
  value: string | number | undefined;

  constructor(private variables: Variables) {}

  onBinaryOperation(o: BinaryOperation) {
    o.leftExpression.visit(this);
    const left = this.value;
    this.value = undefined;

    o.rightExpression.visit(this);
    const right = this.value;

    switch (o.operator) {
      case BinaryOperator.MULTIPLY:
        this.value = asNumber(left) * asNumber(right);
        break;
      case BinaryOperator.DIVIDE:
        this.value = asNumber(left) / asNumber(right);
        break;
      case BinaryOperator.DIV_DIVIDE:
        this.value = asInt(left) / asInt(right);
        break;
      case BinaryOperator.MODULO:
        this.value = asNumber(left) % asNumber(right);
        break;
      case BinaryOperator.ADD:
        this.value = asNumber(left) + asNumber(right);
        break;
      case BinaryOperator.SUBTRACT:
        this.value = asNumber(left) - asNumber(right);
        break;
      case BinaryOperator.B_AND:
        this.value = asInt(left) & asInt(right);
        break;
      case BinaryOperator.B_XOR:
        this.value = asInt(left) ^ asInt(right);
        break;
      case BinaryOperator.B_OR:
        this.value = asInt(left) | asInt(right);
        break;
      case BinaryOperator.AND:
        this.value = asNumber(left) && asNumber(right) ? 1.0 : 0.0;
        break;
      case BinaryOperator.XOR:
        this.value = !asNumber(left) !== !asNumber(right) ? 1.0 : 0.0;
        break;
      case BinaryOperator.OR:
        this.value = asNumber(left) || asNumber(right) ? 1.0 : 0.0;
        break;
      case BinaryOperator.CONCAT:
        this.value = asString(left) + asString(right);
        break;
      case BinaryOperator.EQUAL:
        this.value = left === right ? 1.0 : 0.0;
        break;
      case BinaryOperator.INEQUAL:
        this.value = left !== right ? 1.0 : 0.0;
        break;
      case BinaryOperator.GREATER:
        this.value = asNumber(left) > asNumber(right) ? 1.0 : 0.0;
        break;
      case BinaryOperator.LESS:
        this.value = asNumber(left) < asNumber(right) ? 1.0 : 0.0;
        break;
      case BinaryOperator.GREATER_EQUAL:
        this.value = asNumber(left) >= asNumber(right) ? 1.0 : 0.0;
        break;
      case BinaryOperator.LESS_EQUAL:
        this.value = asNumber(left) <= asNumber(right) ? 1.0 : 0.0;
        break;
      default:
        throw new Error(`Unknown binary operation ${o.operator}`);
    }
  }

  onBracket(b: Bracket) {
    b.innerExpression.visit(this);
  }

  onFunction(_f: Function) {
    throw new Error('Not yet implemented');
  }

  onNumber(n: Number) {
    this.value = n.value;
  }

  onString(s: String) {
    this.value = s.value;
  }

  onUnaryOperation(o: UnaryOperation) {
    o.expression.visit(this);

    switch (o.operator) {
      case UnaryOperator.NOT:
        this.value = asNumber(this.value) ? 0.0 : 1.0;
        break;
      case UnaryOperator.B_NOT:
        this.value = ~asInt(this.value);
        break;
      case UnaryOperator.NEGATE:
        this.value = -asNumber(this.value);
        break;
      default:
        throw new Error(`Unknown unitary operation ${o.operator}`);
    }
  }

  onVariable(v: Variable) {
    this.value = this.variables.tryGetNumber(v.name);
    if (this.value === undefined) {
      throw new ProcessorException(Errors.UNKNOWN_VARIABLE.replace(/\{0\}/, v.name));
    }
  }
}

export function evaluate(expression: Expression, variables: Variables): number | string | undefined {
  const evaluator = new ExpressionEvaluator(variables);
  expression.visit(evaluator);
  return evaluator.value;
}
