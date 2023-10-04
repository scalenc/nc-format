export class Constants {
  static readonly INCH_TO_MM = 25.4;
  static readonly MM_PER_MIN_TO_M_PER_S = 1e-3 / 60;

  static readonly FUNC_ABSOLUTE_POS = 'AC';
  static readonly FUNC_RELATIVE_POS = 'IC';
  static readonly FUNC_ABSOLUTE_ANG = ['DC', 'ACP', 'ACN'];

  static readonly CENTER_RADIUS = 'CR';

  static readonly VELOCITY_QUICK = 'E';
  static readonly VELOCITY = 'F';
  static readonly LINEAR_VELOCITY_VARIABLES = [Constants.VELOCITY_QUICK, Constants.VELOCITY];

  static readonly TRANSLATE = 'TRANS';
  static readonly ADD_TRANSLATE = 'ATRANS';
  static readonly ROTATE = 'ROT';
  static readonly ADD_ROTATE = 'AROT';
  static readonly ABSOLUTE_TRANSFORMATIONS = [Constants.TRANSLATE, Constants.ROTATE];
  static readonly RELATIVE_TRANSFORMATIONS = [Constants.ADD_TRANSLATE, Constants.ADD_ROTATE];

  static readonly TRANSFORM_ANGLE = 'RPL';
  static readonly TRANSFORM_X = 'X';
  static readonly TRANSFORM_Y = 'Y';
  static readonly TRANSFORM_VARIABLES = [Constants.TRANSFORM_ANGLE, Constants.TRANSFORM_X, Constants.TRANSFORM_Y];

  static readonly IF = 'IF';
  static readonly ELSE = 'ELSE';
  static readonly ENDIF = 'ENDIF';
}

export function tryOverwriteAbsoluteModeByFunction(functionName: string): boolean | undefined {
  const functionNameUpperCase = functionName.toUpperCase();
  if (functionNameUpperCase === Constants.FUNC_ABSOLUTE_POS) {
    return true;
  } else if (functionNameUpperCase === Constants.FUNC_RELATIVE_POS) {
    return false;
  } else if (Constants.FUNC_ABSOLUTE_ANG.includes(functionNameUpperCase)) {
    return true;
  }
  // Nothing to override.
  return undefined;
}

export function isTransformationInstruction(name: string): boolean {
  return isAbsoluteTransformationInstruction(name) || isRelativeTransformationInstruction(name);
}

export function isAbsoluteTransformationInstruction(name: string): boolean {
  return Constants.ABSOLUTE_TRANSFORMATIONS.includes(name.toUpperCase());
}

export function isRelativeTransformationInstruction(name: string): boolean {
  return Constants.RELATIVE_TRANSFORMATIONS.includes(name.toUpperCase());
}
