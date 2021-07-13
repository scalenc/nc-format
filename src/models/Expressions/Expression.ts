import { ExpressionVisitor } from './ExpressionVisitor';

/// Expression inferface representing a number, string, formula.
export interface Expression {
  /// Visitor pattern.
  ///
  /// For every expression implementation derived from this interface,
  /// a certain function exists in <see cref="TiExpressionVisitor" />,
  /// which is called when calling the Visit function.
  /// Thus, implement <see cref="TiExpressionVisitor" /> for expression specific
  /// code and pass to this function.
  visit(visitor: ExpressionVisitor): void;
}
