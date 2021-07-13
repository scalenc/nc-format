import { Constants } from './Constants';
import { MachineDefinition } from './MachineDefinition';
import { Variables } from './Variables';

interface Point {
  x: number;
  y: number;
}

export class Transformation {
  variables = new Variables();

  constructor(private machine: MachineDefinition) {}

  applyToVars(variables: Variables): void {
    this.applyToAllLinearAxes(variables, this.applyToPoint.bind(this));
  }

  applyReverseToVars(variables: Variables): void {
    this.applyToAllLinearAxes(variables, this.applyReverseToPoint.bind(this));
  }

  applyToPoint(point: Point): Point {
    return this.applyTranslationTo(this.applyRotationTo(point, 1.0), 1.0);
  }

  applyReverseToPoint(point: Point): Point {
    return this.applyRotationTo(this.applyTranslationTo(point, -1.0), -1.0);
  }

  private applyToAllLinearAxes(variables: Variables, applyFunc: (p: Point) => Point): void {
    this.machine.linearAxes.forEach((a) => {
      if (a.names.length >= 2) {
        this.applyToGivenVars(variables, a.names[0], a.names[1], applyFunc, true);
      }
      if (a.centerNames.length >= 2) {
        this.applyToGivenVars(variables, a.centerNames[0], a.centerNames[1], applyFunc, false);
      }
    });
  }

  private applyToGivenVars(variables: Variables, xName: string, yName: string, applyFunc: (p: Point) => Point, force: boolean) {
    const x = variables.tryGetNumber(xName);
    const y = variables.tryGetNumber(yName);
    if (force || x !== undefined || y !== undefined) {
      const transformed = applyFunc({ x: x ?? 0, y: y ?? 0 });
      variables.setNumber(xName, transformed.x);
      variables.setNumber(yName, transformed.y);
    }
  }

  private applyRotationTo(point: Point, sign: number): Point {
    const rotationAngleDeg = sign * this.variables.getNumberOrDefault(Constants.TRANSFORM_ANGLE);
    if (!rotationAngleDeg) {
      return point;
    }
    const rotationAngleRad = (Math.PI * rotationAngleDeg) / 180.0;
    const cos = Math.cos(rotationAngleRad);
    const sin = Math.sin(rotationAngleRad);
    return { x: point.x * cos - point.y * sin, y: point.x * sin + point.y * cos };
  }

  private applyTranslationTo(point: Point, sign: number): Point {
    const translationX = sign * this.variables.getNumberOrDefault(Constants.TRANSFORM_X);
    const translationY = sign * this.variables.getNumberOrDefault(Constants.TRANSFORM_Y);
    return { x: point.x + translationX, y: point.y + translationY };
  }
}
