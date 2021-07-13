import { Block } from './Block';

/// The NC text consisting of NC blocks.
///
/// This is the root class for NC text representations.
///
/// A NC text consists of blocks (<see cref="TcBlock" />) which are the different lines in the file.
/// These blocks are executed at once by the NC interpreter.
///
/// Blocks in turn consist of multiple statements (<see cref="Statements.TiStatement" />), which are
/// for example NC words, such as G or M words (<see cref="Statements.TcGCode" />, <see cref="Statements.TcMCode" />).
/// Or assignments where also other words such as X, Y, Z, ... words are accounted to (<see cref="Statements.TcAssignment" />).
/// For all classes statements, please refer to <see cref="Statements.TiStatementVisitor" />.
///
/// In order to resolve assignments or arguments passed to instruction statements (<see cref="Statements.TcInstruction" />,
/// <see cref="Statements.TeFlowControlInstruction" />), values or formulas are represented as expressions
/// (<see cref="Expressions.TiExpression" />).
/// For all expression classes, please see <see cref="Expressions.TiExpressionVisitor" />.
export class NcText {
  /// The blocks the NC text consists of.
  /// E.g. the following NC text constists of two blocks.
  /// ```
  /// N100X10
  /// N200Y10
  /// ```
  /// See also:
  /// - <see cref="Persistency.TcReader" /> or <see cref="Persistency.TcBeckhoffReader" /> to read NC text.
  /// - <see cref="Persistency.TcWriter" /> or <see cref="Persistency.TcBeckhoffWriter" /> to read NC text.
  blocks: Block[] = [];
}
