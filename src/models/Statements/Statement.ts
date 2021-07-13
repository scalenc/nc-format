import { StatementVisitor } from './StatementVisitor';

/// Statement interface.
export interface Statement {
  /// Visitor pattern.
  ///
  /// For every statement implementation derived from this interface,
  /// a certain function exists in <see cref="TiStatementVisitor" />,
  /// which is called when calling the Visit function.
  /// Thus, implement <see cref="TiStatementVisitor" /> for statement specific
  /// code and pass to this function.
  visit(visitor: StatementVisitor): void;
}
