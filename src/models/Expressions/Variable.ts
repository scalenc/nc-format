import { Expression } from './Expression';
import { ExpressionVisitor } from './ExpressionVisitor';

/// A variable, such as e.g. `X` or `F` or ...
export class Variable implements Expression {
  constructor(
    /// The name of the variable.
    public name: string,
    /// Optional field expressions, such as `X` in `$AA_IW[X]`.
    /// Note, may be null.
    public fieldExpressions?: (Expression | null)[]
  ) {}

  visit(visitor: ExpressionVisitor): void {
    visitor.onVariable(this);
  }
}
