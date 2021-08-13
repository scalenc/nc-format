import { Assignment, Block, Expression, GCode, Instruction, MCode, Number, String } from '../models';

type Value = number | string | Expression;

export class BlockBuilder {
  block = new Block();

  N(blockNumber: number): BlockBuilder {
    this.block.blockNumber = blockNumber;
    return this;
  }

  label(name: string): BlockBuilder {
    this.block.labels.push(name);
    return this;
  }

  comment(comment: string): BlockBuilder {
    this.block.comment = comment;
    return this;
  }

  G(code: number): BlockBuilder {
    this.block.statements.push(new GCode(code));
    return this;
  }

  get metric(): BlockBuilder {
    return this.G(71);
  }

  get absolute(): BlockBuilder {
    return this.G(90);
  }

  get relative(): BlockBuilder {
    return this.G(91);
  }

  get quick(): BlockBuilder {
    return this.G(0);
  }

  get linear(): BlockBuilder {
    return this.G(1);
  }

  get clockwise(): BlockBuilder {
    return this.G(2);
  }

  get counterClockwise(): BlockBuilder {
    return this.G(3);
  }

  M(code: number): BlockBuilder {
    this.block.statements.push(new MCode(code));
    return this;
  }

  get endMainProgram(): BlockBuilder {
    return this.M(30);
  }

  get endSubProgram(): BlockBuilder {
    return this.M(17);
  }

  set(name: string, value: Value): BlockBuilder {
    const expression = this.toExpression(value);
    this.block.statements.push(new Assignment(name, undefined, expression));
    return this;
  }

  X(value: Value): BlockBuilder {
    return this.set('X', value);
  }

  Y(value: Value): BlockBuilder {
    return this.set('Y', value);
  }

  I(value: Value): BlockBuilder {
    return this.set('I', value);
  }

  J(value: Value): BlockBuilder {
    return this.set('J', value);
  }

  F(value: Value): BlockBuilder {
    return this.set('F', value);
  }

  call(name: string, args?: Value[]): BlockBuilder {
    const expressions = args?.map(this.toExpression.bind(this));
    this.block.statements.push(new Instruction(name, expressions));
    return this;
  }

  private toExpression(value: Value): Expression {
    return typeof value === 'number' ? new Number(value, false) : typeof value === 'string' ? new String(value) : value;
  }
}
