import { Expression } from '../Expressions';
import { Statement } from './Statement';
import { StatementVisitor } from './StatementVisitor';

/// Instruction such as a function call with or without arguments.
/// E.g. the following code is an instruction with name "TC_LASER_ON" and five arguments:
/// ```
/// TC_LASER_ON(9,"SS010MD0-N2S0-30-2",10,100,1)
/// ```
export class Instruction implements Statement {
  constructor(
    /// The name of the command.
    public name: string,
    /// The arguments of the command, or null.
    public expressions?: (Expression | null)[]
  ) {}

  visit(visitor: StatementVisitor): void {
    visitor.onInstruction(this);
  }
}
