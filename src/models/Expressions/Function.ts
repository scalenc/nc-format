import { Expression } from './Expression';
import { ExpressionVisitor } from './ExpressionVisitor';

/// Function call.
export class Function implements Expression {
  constructor(
    /// The name of the function.
    public name: string,
    /// The arguments of the function, or null.
    public args: (Expression | null)[]
  ) {}

  visit(visitor: ExpressionVisitor): void {
    visitor.onFunction(this);
  }
}
