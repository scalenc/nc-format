import { Expression } from './Expression';
import { ExpressionVisitor } from './ExpressionVisitor';

/// The operators for unary operations.
export enum UnaryOperator {
  /// <summary>Logical not: `NOT`.</summary>
  NOT,
  /// <summary>Bitwise not: `B_NOT`.</summary>
  B_NOT,
  /// <summary>Sign / Negation of numerical values: `-`</summary>
  NEGATE,
  /// <summary>String conversion: `&lt;&lt;`</summary>
  TO_STRING,
}

/// Unary operation, such as negation.
export class UnaryOperation implements Expression {
  constructor(
    /// Operator of this unary operation.
    public operator: UnaryOperator,
    /// The target expression this unary operation applied to.
    public expression: Expression
  ) {}

  visit(visitor: ExpressionVisitor): void {
    visitor.onUnaryOperation(this);
  }
}
