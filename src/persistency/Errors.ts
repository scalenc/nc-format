export class Errors {
  static TOO_MANY_DECIMAL_CHARS = "Invalid number with too many decimal chars '.'.";

  static MISSING_STRING_END = 'String does not end.';

  static INVALID_OPERATOR = "Invalid operator '{0}.'";

  static INVALID_CHARACTER = "Invalid character '{0}.'";

  static INVALID_NUMBER = "Invalid number '{0}'.";

  static UNEXPECTED_LINE_OR_FILE_END = 'Unexpected end of line or file.';

  static EXPECTED_OPERANT = "Expected operant but found '{0}'.";
  static EXPECTED_NUMBER = "Expected number but found '{0}'.";
  static EXPECTED_INTEGER = "Expected integer number but found '{0}'.";
  static EXPECTED_BINARY_OPERATOR = "Expected binary operator but found '{0}'.";
  static EXPECTED_CLOSING_BRACE = "Expected closing bracket but found '{0}'.";

  static EXPECTED_GOTO = "Expected GOTO statement but found '{0}'.";

  static EXPECTED_LINE_END = "Expected line end but found '{0}'.";

  static EXPECTED_ASSIGNMENT_BUT_INSTRUCTION = 'Expected assignment but found instruction.';
  static UNEXPECTED_FIELD_BRACES = "Expected explicit assignment for variable with field braces '[]'.";
  static EXPECTED_ASSIGNMENT_OR_INSTRUCTION_BUT_FOUND_EXPRESSION = 'Expected assignment or instruction but found expression.';
  static EXPECTED_TO_KEYWORD = "Missing 'TO' keyword in for statement.";

  static EXPECTED_BLOCK_NUMBER_BUT_FOUND_EXPRESSION = 'Expected block number but found expression.';
  static EXPECTED_VARIABLE_TYPE = "Expected variable type but found '{0}'.";
  static EXPECTED_VARIABLE_NAME = "Expected variable name but found '{0}'";
  static EXPECTED_CLOSING_FIELD_BRACE = "Expected closing field brace ']', but found '{0}'.";

  static ADDTIONAL_CHARS_AFTER_BRACE_COMMENT = 'Additional words after comment are not yet supported.';
}
