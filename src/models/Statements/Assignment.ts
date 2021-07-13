import { Expression } from '../Expressions';
import { Statement } from './Statement';
import { StatementVisitor } from './StatementVisitor';

/// Variable assignment statement.
/// </summary>
/// <remarks>
/// These assignments of a variables are equivalent
/// ```
/// X10
/// X=10
/// ```
/// A variable can also be assigned to a formula:
/// ```
/// X=Y+10
/// ```
export class Assignment implements Statement {
  constructor(
    /// The variable which is assigned.
    public variable: string,
    /// Optional field expressions, such as `X` in `$AA_IW[X]`.
    /// Note, may be null.
    public fieldExpressions: (Expression | null)[] | undefined,
    /// The expression the variable is assigned to.
    public expression: Expression
  ) {}

  visit(visitor: StatementVisitor): void {
    visitor.onAssignment(this);
  }
}
