import { Expression } from './Expression';
import { ExpressionVisitor } from './ExpressionVisitor';

/// Brackets around other expressions.
export class Bracket implements Expression {
  constructor(
    /// The inner expression within the backets.
    public innerExpression: Expression
  ) {}

  public visit(visitor: ExpressionVisitor): void {
    visitor.onBracket(this);
  }
}
