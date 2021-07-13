import { Expression } from '../Expressions';
import { Statement } from './Statement';
import { StatementVisitor } from './StatementVisitor';

/// The searching direction.
export enum GotoDirection {
  /// <summary>Goto the program start.</summary>
  START,
  /// <summary>Looking for the target from the current position into the backward direction.</summary>
  BACKWARD,
  /// <summary>Looking for the target from the current position into the forward direction.</summary>
  FORWARD,
  /// <summary>Looking for the target from the current position first into the forward then into the backward directions.</summary>
  SEARCH,
  /// <summary>Looking for the target from the current position into both directions without errors if not found.</summary>
  SEARCH_WITHOUT_ERROR,
}

/// Goto instruction.
export class Goto implements Statement {
  constructor(
    /// The searching direction.
    public direction: GotoDirection,
    /// The target where to goto.
    public target?: Expression
  ) {}

  visit(visitor: StatementVisitor): void {
    visitor.onGoto(this);
  }
}
