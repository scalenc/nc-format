export class Constants {
  static SPACE = ' ';
  static WHITE_SPACE_CHARS = /\s/;
  static CARRIAGE_RETURN = '\r';
  static NEW_LINE = '\n';
  static NAME_CHARS = /[a-zA-Z_$]/;
  static DIGIT_CHARS = /[0-9]/;
  static NUMBER_CHARS = /[0-9.]/;

  static COMMENT_CHAR = ';';
  static STRING_SEPARATOR = '"';

  static OPENING_BRACE = '(';
  static CLOSING_BRACE = ')';
  static ARGUMENT_SEPARATOR = ',';
  static OPENING_FIELD_BRACE = '[';
  static CLOSING_FIELD_BRACE = ']';
  static BECKHOFF_ARGUMENT_SEPARATOR = ';';
  static BECKHOFF_INSTRUCTION_SYMBOL = '#';

  static COLON = ':';
  static ASSIGNMENT_OPERATOR = '=';

  static NUMBER_TOKEN = 'N';

  static G_CODE = 'G';
  static M_CODE = 'M';

  static DEF = 'DEF';
  static DEF_INT = 'INT';
  static DEF_REAL = 'REAL';
  static DEF_BOOL = 'BOOL';
  static DEF_CHAR = 'CHAR';
  static DEF_STRING = 'STRING';
  static DEF_AXIS = 'AXIS';
  static DEF_FRAME = 'FRAME';

  static DEF_UNIT = 'PHU';
  static DEF_LOWER_LIMIT = 'LLI';
  static DEF_UPPER_LIMIT = 'ULI';
  static DEF_SEPARATOR = ',';
  static DEF_FIELD_BEGIN = '[';
  static DEF_FIELD_END = ']';

  static IF = 'IF';
  static ELSE = 'ELSE';
  static ENDIF = 'ENDIF';
  static WHILE = 'WHILE';
  static ENDWHILE = 'ENDWHILE';
  static REPEAT = 'REPEAT';
  static UNTIL = 'UNTIL';
  static LOOP = 'LOOP';
  static ENDLOOP = 'ENDLOOP';
  static FOR = 'FOR';
  // Note, `TO` is not a stand-alone flow-control instruction but used only in context with `FOR`.
  // Thus, it is not contained in `FLOW_CONTROL_INSTRUCTIONS`.
  static FOR_TO = 'TO';
  static ENDFOR = 'ENDFOR';
  static FLOW_CONTROL_INSTRUCTIONS = [
    Constants.IF,
    Constants.ELSE,
    Constants.ENDIF,
    Constants.WHILE,
    Constants.ENDWHILE,
    Constants.REPEAT,
    Constants.UNTIL,
    Constants.LOOP,
    Constants.ENDLOOP,
    Constants.FOR,
    Constants.ENDFOR,
  ];

  static GOTO = 'GOTO';
  static GOTO_SPECIFIER = 'SBFCsbfc';
  static GOTO_START = 'S';
  static GOTO_BACKWARD = 'B';
  static GOTO_FORWARD = 'F';
  static GOTO_SEARCH_NO_ERRORS = 'C';

  static PLUS_SIGN = '+';
  static MINUS_SIGN = '-';
  static DECIMAL_CHAR = '.';
  static NUMBER_EXPONENT = 'EX';
  static NUMBER_CONSTANT_SEPARATOR = "'";

  static OPERATOR_CHARS = '*/+-<>=';

  static MULTIPLY_OPERATOR = '*';
  static DIVIDE_OPERATOR = '/';
  static ADD_OPERATOR = '+';
  static SUBTRACT_OPERATOR = '-';
  static CONCAT_OPERATOR = '<<';
  static EQUAL_OPERATOR = '==';
  static EQUAL_OPERATOR_CHAR = '=';
  static INEQUAL_OPERATOR = '<>';
  static LESS_OPERATOR = '<';
  static LESS_OPERATOR_CHAR = '<';
  static LESS_EQUAL_OPERATOR = '<=';
  static GREATER_EQUAL_OPERATOR = '>=';
  static GREATER_OPERATOR = '>';
  static GREATER_OPERATOR_CHAR = '>';
  static BITWISE_NOT_OPERATOR = 'B_NOT';
  static LOGICAL_NOT_OPERATOR = 'NOT';
  static DIV_OPERATOR = 'DIV';
  static MOD_OPERATOR = 'MOD';
  static B_AND_OPERATOR = 'B_AND';
  static B_XOR_OPERATOR = 'B_XOR';
  static B_OR_OPERATOR = 'B_OR';
  static AND_OPERATOR = 'AND';
  static XOR_OPERATOR = 'XOR';
  static OR_OPERATOR = 'OR';

  static NAMED_OPERATORS = [
    Constants.BITWISE_NOT_OPERATOR,
    Constants.LOGICAL_NOT_OPERATOR,
    Constants.DIV_OPERATOR,
    Constants.MOD_OPERATOR,
    Constants.B_AND_OPERATOR,
    Constants.B_XOR_OPERATOR,
    Constants.B_OR_OPERATOR,
    Constants.AND_OPERATOR,
    Constants.XOR_OPERATOR,
    Constants.OR_OPERATOR,
  ];
}
