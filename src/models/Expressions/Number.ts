import { Expression } from './Expression';
import { ExpressionVisitor } from './ExpressionVisitor';

export enum NumberFormat {
  /// Decimal format (default).
  DECIMAL,
  /// Hexadecimal format, as 'H12AB'
  HEXADECIMAL,
  /// Binary format, as 'B00110011'
  BINARY,
}

/// Number.
export class Number implements Expression {
  constructor(
    /// The value of the number.
    public value: number,
    /// Flag if the value is an integer, rather for persistency purpose.
    public isInteger: boolean,
    /// The format of the number in the NC.
    public numberFormat = NumberFormat.DECIMAL
  ) {}

  visit(visitor: ExpressionVisitor): void {
    visitor.onNumber(this);
  }
}
