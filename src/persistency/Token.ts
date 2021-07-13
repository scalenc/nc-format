import { Constants } from './Constants';

export enum TokenType {
  NEW_LINE,
  COMMENT,
  IDENTIFIER,
  NUMBER,
  STRING,
  OPERATOR,
  FIELD_BRACE,
  BRACE,
  SEPARATOR,
  COLON,
}

/// Description of TcToken.
export interface Token {
  type: TokenType;
  value: string;
  whiteSpace: string;
}

export function isLineOrFileEnd(token: Token | undefined): boolean {
  return !token || token.type === TokenType.NEW_LINE || token.type === TokenType.COMMENT;
}

export function isGCode(token: Token | undefined): boolean {
  return token?.type === TokenType.IDENTIFIER && token.value === Constants.G_CODE;
}

export function isMCode(token: Token | undefined): boolean {
  return token?.type === TokenType.IDENTIFIER && token.value === Constants.M_CODE;
}

export function isFlowControlInstruction(token: Token | undefined): boolean {
  return token?.type === TokenType.IDENTIFIER && Constants.FLOW_CONTROL_INSTRUCTIONS.includes(token.value.toUpperCase());
}

export function isToKeyword(token: Token | undefined): boolean {
  return token?.type === TokenType.IDENTIFIER && token.value.toUpperCase() === Constants.FOR_TO;
}

export function isGoto(token: Token | undefined): boolean {
  return (
    token?.type === TokenType.IDENTIFIER &&
    token.value.toUpperCase().startsWith(Constants.GOTO) &&
    (token.value.length === Constants.GOTO.length ||
      (token.value.length === Constants.GOTO.length + 1 && Constants.GOTO_SPECIFIER.includes(token.value[4].toUpperCase())))
  );
}

export function isAssignmentOperator(token: Token | undefined): boolean {
  return token?.type === TokenType.OPERATOR && token.value.length === 1 && token.value[0] === Constants.ASSIGNMENT_OPERATOR;
}

export function isDeclaration(token: Token | undefined): boolean {
  return token?.type === TokenType.IDENTIFIER && token.value === Constants.DEF;
}

export function isOpeningFieldBrace(token: Token | undefined): boolean {
  return token?.type === TokenType.FIELD_BRACE && token.value.length === 1 && token.value[0] === Constants.OPENING_FIELD_BRACE;
}

export function isCloseingFieldBrace(token: Token | undefined): boolean {
  return token?.type === TokenType.FIELD_BRACE && token.value.length === 1 && token.value[0] === Constants.CLOSING_FIELD_BRACE;
}

export function tryParseNumber(token: Token): number | undefined {
  if (token.type != TokenType.NUMBER || !token.value) {
    return undefined;
  }

  if ('hHbB'.includes(token.value[0])) {
    return tryGetNumberAsInteger(token);
  }

  const number = +token.value;
  return Number.isNaN(number) ? undefined : number;
}

export function tryGetNumberAsInteger(token: Token | undefined): number | undefined {
  if (token?.type !== TokenType.NUMBER || !token.value) {
    return undefined;
  }

  switch (token.value[0]) {
    case 'h':
    case 'H': {
      const number = Number.parseInt(token.value.substring(1).replaceAll(' ', ''), 16);
      return Number.isNaN(number) ? undefined : number;
    }

    case 'b':
    case 'B': {
      let value = 0;
      for (let i = 1; i < token.value.length; ++i) {
        value <<= 1;
        // eslint-disable-next-line security/detect-object-injection
        switch (token.value[i]) {
          case '0':
            break;
          case '1':
            value += 1;
            break;
          case ' ':
            break;
          default:
            return undefined;
        }
      }
      return value;
    }

    default: {
      const number = Number.parseInt(token.value);
      return Number.isNaN(number) ? undefined : number;
    }
  }
}
