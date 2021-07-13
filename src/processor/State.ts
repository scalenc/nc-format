import { Constants } from './Constants';
import { MachineDefinition } from './MachineDefinition';
import { MotionMode } from './MotionMode';
import { Transformation } from './Transformation';
import { Variables } from './Variables';

export class State {
  variables = new Variables();
  absolute = true;
  metric = true;
  motionMode: MotionMode;
  transformation: Transformation;

  constructor(public machine: MachineDefinition) {
    this.motionMode = machine.initialMotionMode;
    this.transformation = new Transformation(machine);
  }

  getVelocityInMetersPerSecond(): number {
    const variableName = this.motionMode === MotionMode.QUICK ? Constants.VELOCITY_QUICK : Constants.VELOCITY;
    const velocity = this.variables.getNumberOrDefault(variableName); // [mm/min] or [in/min]
    return (this.metric ? velocity : velocity * Constants.INCH_TO_MM) * Constants.MM_PER_MIN_TO_M_PER_S;
  }
}
