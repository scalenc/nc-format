import { Parser } from './Parser';

export class ParserException extends Error {
  constructor(public parser: Parser, message: string) {
    super(`ERROR in line ${parser.line}: ${message.replace(/\{0\}/g, parser.token?.value ?? '')}`);
  }

  static assert(condition: boolean, parser: Parser, message: string) {
    if (!condition) {
      ParserException.fail(parser, message);
    }
  }

  static expected(condition: boolean, parser: Parser, message: string) {
    if (!condition) {
      ParserException.fail(parser, message);
    }
  }

  static fail(parser: Parser, message: string) {
    throw new ParserException(parser, message);
  }
}
