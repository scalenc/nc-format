import { Assignment, Function } from '../models';
import { tryOverwriteAbsoluteModeByFunction } from './Constants';
import { asNumber, evaluate } from './ExpressionEvaluator';
import { MotionMode } from './MotionMode';
import { State } from './State';
import { Variables } from './Variables';

export class AssignmentProcessor {
  variable = '';
  value = 0;

  constructor(private state: State) {}

  setMissingCenterVariables(variables: Variables): void {
    if (this.state.motionMode === MotionMode.CLOCKWISE || this.state.motionMode === MotionMode.COUNTER_CLOCKWISE) {
      this.state.machine.getCenterAndReferenceVariables().forEach(({ name, centerName }) => {
        if (!variables.hasNumber(centerName)) {
          const value = variables.tryGetNumber(name);
          if (value !== undefined) {
            variables.setNumber(centerName, value);
          }
        }
      });
    }
  }

  process(assignment: Assignment): void {
    this.variable = assignment.variable;
    let absolute = this.state.absolute ? this.state.machine.isAbsoluteAssignable(this.variable) : !this.state.machine.isRelativeAssignable(this.variable);
    let expression = assignment.expression;

    if (expression instanceof Function && expression.args.length === 1 && expression.args[0]) {
      const absoluteOverwrite = tryOverwriteAbsoluteModeByFunction(expression.name);
      if (absoluteOverwrite !== undefined) {
        absolute = absoluteOverwrite;
        expression = expression.args[0];
      }
    }

    const value = asNumber(evaluate(expression, this.state.variables));

    this.value = absolute ? 0.0 : this.state.variables.getNumberOrDefault(this.state.machine.getReferenceVariable(this.variable));
    this.value += this.state.metric ? value : this.state.machine.inchToMillimeter(this.variable, value);
  }

  apply(): void {
    this.state.variables.setNumber(this.variable, this.value);
  }
}
