import { Expression } from './Expression';
import { ExpressionVisitor } from './ExpressionVisitor';

/// The operators for binary operations.
export enum BinaryOperator {
  MULTIPLY,
  DIVIDE,
  DIV_DIVIDE,
  MODULO,
  ADD,
  SUBTRACT,
  B_AND,
  B_XOR,
  B_OR,
  AND,
  XOR,
  OR,
  CONCAT,
  EQUAL,
  INEQUAL,
  GREATER,
  LESS,
  GREATER_EQUAL,
  LESS_EQUAL,
}

/// Binary operation, such as addition, subtraction, ...
export class BinaryOperation implements Expression {
  constructor(
    /// The operator for this binary operation.
    public operator = BinaryOperator.ADD,
    /// The left expression.
    public leftExpression: Expression,
    /// The right expression.
    public rightExpression: Expression
  ) {}

  visit(visitor: ExpressionVisitor) {
    visitor.onBinaryOperation(this);
  }
}
