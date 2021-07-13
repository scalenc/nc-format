import { Statement } from './Statement';
import { StatementVisitor } from './StatementVisitor';

/// M word statement.
/// E.g. `M21`
export class MCode implements Statement {
  constructor(
    /// The M code id.
    /// For e.g. `M21` the Id is 21.
    public id: number
  ) {}

  visit(visitor: StatementVisitor): void {
    visitor.onMCode(this);
  }
}
