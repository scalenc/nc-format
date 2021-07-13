import { Expression } from '../Expressions';
import { Statement } from './Statement';
import { StatementVisitor } from './StatementVisitor';

export enum VariableType {
  ///
  INT,
  ///
  REAL,
  ///
  BOOL,
  ///
  CHAR,
  ///
  STRING,
  ///
  AXIS,
  ///
  FRAME,
}

/// Definition of a variable.
export interface VariableDeclaration {
  /// The name of the variable.
  name: string;

  /// The field lengths of the variable if the variable is an array.
  fieldLengths?: number[];

  /// The initial expression the variable is assigned to.
  initExpression?: Expression;
}

/// A declaration of a variable.
export class Declaration implements Statement {
  constructor(
    /// The type of the variable.
    public type: VariableType,
    /// The maximum length of the variable if being of type <see cref="TeVariableType.STRING" />.
    public stringLength?: number,
    /// The unit of the variable.
    public unit?: number,
    /// The optional lower limit.
    public lowerLimit?: number,
    /// The optional upper limit.
    public upperLimit?: number,
    /// A list of declared variables.
    public variables: VariableDeclaration[] = []
  ) {}

  visit(visitor: StatementVisitor): void {
    visitor.onDeclaration(this);
  }
}
