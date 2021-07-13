import { Expression } from '../Expressions';
import { Statement } from './Statement';
import { StatementVisitor } from './StatementVisitor';

/// G word statement.
/// E.g. `G90`
export class GCode implements Statement {
  constructor(
    /// The G code id.
    /// For e.g. `G90` the Id is 90.
    public id: number,
    /// Optional arguments to the G word, or null if none.
    public args?: Expression[]
  ) {}

  visit(visitor: StatementVisitor): void {
    visitor.onGCode(this);
  }
}
