/* eslint-disable @typescript-eslint/ban-types */
import { BinaryOperation } from './BinaryOperation';
import { Bracket } from './Bracket';
import { Function } from './Function';
import { Number } from './Number';
import { String } from './String';
import { UnaryOperation } from './UnaryOperation';
import { Variable } from './Variable';

/// Visitor pattern.
///
/// For every expression implementation derived from the <see cref="TiExpression" /> interface,
/// a certain function exists in this class, which is called when calling the
/// <see cref="TiExpression.Visit(TiExpressionVisitor)" /> function.
/// Thus, implement this interface for expression specific code.
export interface ExpressionVisitor {
  onBinaryOperation(op: BinaryOperation): void;
  onBracket(op: Bracket): void;
  onFunction(op: Function): void;
  onNumber(op: Number): void;
  onString(op: String): void;
  onUnaryOperation(o: UnaryOperation): void;
  onVariable(op: Variable): void;
}
