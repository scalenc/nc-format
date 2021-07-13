import { Expression } from '../Expressions';
import { Statement } from './Statement';
import { StatementVisitor } from './StatementVisitor';

export enum FlowControlInstructionType {
  /// <summary>Begin of an `IF` section: `IF condition`</summary>
  IF,
  /// <summary>`ELSE` branch of an `IF` section</summary>
  ELSE,
  /// <summary>End of an `IF` section</summary>
  ENDIF,
  /// <summary>Begin of a `WHILE` section: `WHILE condition`</summary>
  WHILE,
  /// <summary>End of a `WHILE` section</summary>
  ENDWHILE,
  /// <summary>Begin of a `REPEAT UNTIL` section</summary>
  REPEAT,
  /// <summary>End of a `REPEAT UNTIL` section: `UNTIL condition`</summary>
  UNTIL,
  /// <summary>Begin of a infinite `LOOP` section</summary>
  LOOP,
  /// <summary>End of a infinite `LOOP` section</summary>
  ENDLOOP,
  /// <summary>Begin of a `FOR` section: `FOR variable, initial value, final value`</summary>
  FOR,
  /// <summary>End of a `FOR` section</summary>
  ENDFOR,
}

/// This class represents a flow control instruction such as `IF`, `WHILE`, `UNTIL`, `FOR`, ...
export class FlowControlInstruction implements Statement {
  constructor(
    /// The type of the flow control instruction.
    public type: FlowControlInstructionType,
    /// The list of arguments to the instruction.
    /// For an `IF`, `WHILE`, `UNTIL` instruction, a single expression is expected as the condition.
    /// For an `FOR` instruction, three expressions are expected: the variable, the initial value, and the final value.
    public expressions?: Expression[]
  ) {}

  visit(visitor: StatementVisitor): void {
    visitor.onFlowControlInstruction(this);
  }
}
