import { Constants } from './Constants';
import { MotionMode } from './MotionMode';

export class LinearAxes {
  public names: string[] = [];
  public centerNames: string[] = [];
}

export class MachineDefinition {
  constructor(public linearAxes: LinearAxes[] = [], public circularAxes: string[] = [], public initialMotionMode = MotionMode.LINEAR) {}

  static makeDefault(): MachineDefinition {
    return new MachineDefinition([{ names: ['X', 'Y', 'Z'], centerNames: ['I', 'J', 'K'] }], ['A', 'B', 'C'], MotionMode.LINEAR);
  }

  getCenterAndReferenceVariables(): { centerName: string; name: string }[] {
    return this.linearAxes.flatMap((a) => a.centerNames.map((centerName, i) => ({ centerName, name: a.names[i] })));
  }

  isRelativeAssignable(variable: string): boolean {
    return this.isCoordinateOrCenter(variable) || Constants.TRANSFORM_VARIABLES.includes(variable.toUpperCase());
  }

  isAbsoluteAssignable(variable: string): boolean {
    return !this.isLinearCoordinateCenter(variable);
  }

  getReferenceVariable(variable: string): string {
    const variableUpperCase = variable.toUpperCase();
    const referenceVariable = this.getCenterAndReferenceVariables().find((x) => x.centerName === variableUpperCase)?.name;
    return referenceVariable ?? variable;
  }

  isTemporaryMotionVariable(variable: string): boolean {
    return this.isLinearCoordinateCenter(variable) || Constants.CENTER_RADIUS === variable.toUpperCase();
  }

  isLength(variable: string): boolean {
    return this.isLinearCoordinate(variable) || this.isLinearCoordinateCenter(variable);
  }

  isVelocity(variable: string): boolean {
    return this.isLinearVelocity(variable);
  }

  inchToMillimeter(variable: string, value: number): number {
    if (this.isLength(variable) || this.isVelocity(variable)) {
      // inch -> mm, inch/min -> mm/min
      return Constants.INCH_TO_MM * value;
    }
    return value;
  }

  isCoordinate(variable: string): boolean {
    return this.isLinearCoordinate(variable) || this.isCircularCoordinate(variable);
  }

  isCoordinateOrCenter(variable: string): boolean {
    return this.isCoordinate(variable) || this.isLinearCoordinateCenter(variable);
  }

  isLinearCoordinate(variable: string): boolean {
    const variableUpperCase = variable.toUpperCase();
    return this.linearAxes.some((x) => x.names.includes(variableUpperCase));
  }

  isLinearCoordinateCenter(variable: string): boolean {
    const variableUpperCase = variable.toUpperCase();
    return this.linearAxes.some((x) => x.centerNames.includes(variableUpperCase));
  }

  isCircularCoordinate(variable: string): boolean {
    return this.circularAxes.includes(variable.toUpperCase());
  }

  isLinearVelocity(variable: string): boolean {
    return Constants.LINEAR_VELOCITY_VARIABLES.includes(variable.toUpperCase());
  }
}
