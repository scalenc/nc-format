import { expect } from 'chai';
import { NcBuilder, Writer } from '../../src';

describe(NcBuilder.name, () => {
  it('should generate expected NC', () => {
    const nc = NcBuilder.block((b) => b.linear.X(10).Y(20)).block((b) => b.clockwise.X(30).I(10).J(10)).text;
    const actual = Writer.toString(nc);
    expect(actual).deep.equals('G01X10Y20\nG02X30I10J10');
  });
});
