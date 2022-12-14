import { expect } from 'chai';
import { BinaryOperation, BinaryOperator, Number } from '../../src';
import { ExpressionReader } from '../../src/persistency/ExpressionReader';
import { Parser } from '../../src/persistency/Parser';

describe(ExpressionReader.name, () => {
  it('should parse `-1`', () => {
    const parser = new Parser('-1');
    parser.tryRead();
    const reader = new ExpressionReader(parser);
    const expression = reader.readExpression();
    expect(expression).to.be.instanceOf(Number).with.property('value', -1);
  });

  it('should parse `AF*0.50`', () => {
    const parser = new Parser('AF*0.50');
    parser.tryRead();
    const reader = new ExpressionReader(parser);
    const expression = reader.readExpression();
    expect(expression).to.be.instanceOf(BinaryOperation).with.property('operator', BinaryOperator.MULTIPLY);
  });
});
