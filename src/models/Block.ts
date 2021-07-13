import { Statement } from './Statements/Statement';

/// An NC block consisting of multiple statements.
export class Block {
  constructor(
    /// The actual number of the line in the NC text.
    public line = 0,

    /// The number of the block as assigned by the `N` word.
    /// For a line starting with `N100` the block number is 100.
    public blockNumber?: number,

    /// List of labels targeting this line.
    /// E.g. the block `lab1:N100X100` has one label called `lab1`.
    public labels: string[] = [],

    /// The statements the block consists of.
    public statements: Statement[] = [],

    /// The line comment after the block.
    /// E.g. the block `N100X100 ; This is a comment` ends with the comment " This is a comment".
    public comment?: string
  ) {}
}
