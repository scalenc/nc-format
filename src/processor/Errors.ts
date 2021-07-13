export class Errors {
  static readonly EXPECTED_NUMBER_IN_EXPRESSION = "Expected number in expression but found '{0}'";
  static readonly EXPECTED_STRING_IN_EXPRESSION = "Expected string in expression but found '{0}'";
  static readonly UNEXPECTED_ARGS_IN_SUBPROGRAM_CALL = "Unexpected arguments in call to sub-program '{0}'.";
  static readonly INVALID_GOTO_TARGET = "Invalid argument type of goto target '{0}'";
  static readonly UNSUPPORTED_FLOW_CONTROL_INSTRUCTION = "Unsupported flow-control instruction '{0}'";
  static readonly INVALID_CONDITIONAL_EXPRESSION = 'Invalid conditional expression.';
  static readonly UNKNOWN_GOTO_TARGET = "Unable to find goto target '{0}'";
  static readonly UNKNOWN_VARIABLE = "Unknown variable '{0}'";
}
