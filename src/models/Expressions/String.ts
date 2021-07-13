import { Expression } from './Expression';
import { ExpressionVisitor } from './ExpressionVisitor';

/// String.
export class String implements Expression {
  constructor(
    /// The value of the string.
    public value: string
  ) {}

  visit(visitor: ExpressionVisitor): void {
    visitor.onString(this);
  }
}
