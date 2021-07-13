import {
  Assignment,
  Declaration,
  Expression,
  FlowControlInstruction,
  FlowControlInstructionType,
  GCode,
  Goto,
  Instruction,
  MCode,
  NcText,
  Number,
  StatementVisitor,
  Variable,
  VariableType,
} from '../models';
import { AssignmentProcessor } from './AssignmentProcessor';
import { Constants, isAbsoluteTransformationInstruction, isTransformationInstruction } from './Constants';
import { Errors } from './Errors';
import { evaluate } from './ExpressionEvaluator';
import { LinearAxes, MachineDefinition } from './MachineDefinition';
import { MotionMode } from './MotionMode';
import { ProcessCallback } from './ProcessCallback';
import { ProcessorException } from './ProcessorException';
import { State } from './State';
import { Variables } from './Variables';

export class Processor implements StatementVisitor {
  private readonly assignmentProcessor: AssignmentProcessor;
  private nextBlockIndex?: number;
  private stop = true;
  private wait = false;
  private waitDelay?: number;
  private transformationSetter?: AssignmentProcessor;
  private motionStartVariables?: Variables;
  private motionEndVariables?: Variables;
  private ignoreStack: string[] = [];
  private callStack: { ncText: NcText }[] = [];

  state: State;

  constructor(private callback: ProcessCallback, machine: MachineDefinition = MachineDefinition.makeDefault(), public programs: Record<string, NcText> = {}) {
    this.state = new State(machine);
    this.assignmentProcessor = new AssignmentProcessor(this.state);
  }

  process(ncText: NcText) {
    this.callStack.push({ ncText });
    this.stop = false;

    const blocks = ncText.blocks;
    for (let blockIndex = 0; blockIndex < blocks.length; ++blockIndex) {
      const block = blocks[blockIndex];
      if (block.statements) {
        this.callback.onEnterBlock?.(blockIndex, block, ncText);
        block.statements?.forEach((statement) => !this.stop && statement.visit(this));

        if (this.wait) {
          this.callWait();
        }

        if (this.motionStartVariables) {
          this.callMotion(this.motionStartVariables, this.motionEndVariables!);
        }

        if (this.transformationSetter) {
          this.state.transformation.applyReverseToVars(this.state.variables);
          this.transformationSetter = undefined;
        }

        if (this.stop) {
          break;
        }

        if (this.nextBlockIndex !== undefined) {
          if (this.nextBlockIndex < 0) {
            break;
          }
          blockIndex = this.nextBlockIndex - 1; // -1 since increaesed at end of loop.
          this.nextBlockIndex = undefined;
        }
      }
    }

    this.callStack.pop();
  }

  onDeclaration(declaration: Declaration) {
    if (this.ignoreStack.length) {
      return;
    }

    if (declaration.type === VariableType.REAL || declaration.type === VariableType.INT) {
      declaration.variables.forEach((v) => {
        const assignment = new Assignment(v.name, undefined, v.initExpression ?? new Number(0, declaration.type === VariableType.INT));
        this.assignmentProcessor.process(assignment);
        this.assignmentProcessor.apply();
      });
    }
  }

  onAssignment(assignment: Assignment) {
    if (this.ignoreStack.length) {
      return;
    }

    if (this.transformationSetter) {
      this.transformationSetter.process(assignment);
      this.transformationSetter.apply();
    } else {
      this.assignmentProcessor.process(assignment);
      if (this.wait && assignment.variable === Constants.VELOCITY) {
        this.waitDelay = this.assignmentProcessor.value;
      } else if (this.state.machine.isTemporaryMotionVariable(assignment.variable)) {
        this.saveMotionVariable(assignment.variable, this.assignmentProcessor.value);
      } else if (this.state.machine.isCoordinateOrCenter(assignment.variable)) {
        const startValue = this.state.variables.getNumberOrDefault(assignment.variable);
        this.saveMotionVariable(assignment.variable, startValue, this.assignmentProcessor.value);
      } else {
        this.assignmentProcessor.apply();
      }
    }
  }

  onGCode(gCode: GCode) {
    if (this.ignoreStack.length) {
      return;
    }

    switch (gCode.id) {
      case 0:
        this.state.motionMode = MotionMode.QUICK;
        break;
      case 1:
        this.state.motionMode = MotionMode.LINEAR;
        break;
      case 2:
        this.state.motionMode = MotionMode.CLOCKWISE;
        break;
      case 3:
        this.state.motionMode = MotionMode.COUNTER_CLOCKWISE;
        break;
      case 4:
        this.wait = true;
        break;
      case 70:
        this.state.metric = false;
        break;
      case 71:
        this.state.metric = true;
        break;
      case 90:
        this.state.absolute = true;
        break;
      case 91:
        this.state.absolute = false;
        break;
      default:
        this.callback.onUnhandledGCode?.(gCode);
        break;
    }
  }

  onGoto(gotoStatement: Goto) {
    if (this.ignoreStack.length) {
      return;
    }

    let targetName: string;
    if (gotoStatement.target instanceof Variable) {
      targetName = gotoStatement.target.name.toUpperCase();
      if (/^N[0-9]+$/.test(targetName)) {
        const number = +targetName.substring(1);
        this.nextBlockIndex = this.findBlockIndexByBlockNumber(number);
      } else {
        this.nextBlockIndex = this.findBlockIndexByLabel(targetName);
      }
    } else {
      if (gotoStatement.target instanceof Number && gotoStatement.target.isInteger) {
        targetName = `${gotoStatement.target.value}`;
        this.nextBlockIndex = this.findBlockIndexByBlockNumber(gotoStatement.target.value);
      } else {
        throw new ProcessorException(Errors.INVALID_GOTO_TARGET.replace(/\{0\}/g, JSON.stringify(gotoStatement.target)));
      }
    }
    if (this.nextBlockIndex === undefined) {
      throw new ProcessorException(Errors.UNKNOWN_GOTO_TARGET.replace(/\{0\}/g, targetName));
    }
  }

  onInstruction(instruction: Instruction) {
    if (this.ignoreStack.length) {
      return;
    }

    if (isTransformationInstruction(instruction.name)) {
      this.state.transformation.applyToVars(this.state.variables);
      if (isAbsoluteTransformationInstruction(instruction.name)) {
        this.state.transformation.variables.clearOwn();
      }
      const transformState = new State(this.state.machine);
      transformState.variables = this.state.transformation.variables;
      transformState.metric = this.state.metric;
      this.transformationSetter = new AssignmentProcessor(transformState);
    } else {
      const subProgram = this.programs[instruction.name.toUpperCase()];
      if (subProgram) {
        if (instruction.expressions?.length) {
          throw new ProcessorException(Errors.UNEXPECTED_ARGS_IN_SUBPROGRAM_CALL.replace(/\{0\}/g, instruction.name));
        }

        this.callback.onEnterSubprogram?.(instruction.name, subProgram);
        this.process(subProgram);
        if (!this.stop) {
          this.callback.onLeaveSubprogram?.(instruction.name, subProgram);
        }
      } else {
        this.callback.onInstruction?.(instruction);
      }
    }
  }

  onFlowControlInstruction(instruction: FlowControlInstruction) {
    switch (instruction.type) {
      case FlowControlInstructionType.IF: {
        if (this.ignoreStack.length) {
          this.ignoreStack.push(Constants.ENDIF); // Ignore until ENDIF
        } else {
          if (!this.isConditionTrue(instruction.expressions?.[0])) {
            this.ignoreStack.push(Constants.ELSE); // Ignore only until ELSE
          }
        }
        break;
      }

      case FlowControlInstructionType.ELSE: {
        const ignoredInstruction = this.ignoreStack.pop();
        if (ignoredInstruction !== Constants.ELSE) {
          if (ignoredInstruction && ignoredInstruction !== Constants.ENDIF) {
            throw new ProcessorException(`Non-matching IF/ELSE/ENDIF`);
          }
          this.ignoreStack.push(Constants.ENDIF);
        }
        break;
      }
      case FlowControlInstructionType.ENDIF: {
        const ignoredInstruction = this.ignoreStack.pop();
        if (ignoredInstruction && ignoredInstruction !== Constants.ENDIF && ignoredInstruction !== Constants.ELSE) {
          throw new ProcessorException(`Non-matching IF/ELSE/ENDIF`);
        }
        break;
      }
      default:
        throw new ProcessorException(Errors.UNSUPPORTED_FLOW_CONTROL_INSTRUCTION.replace(/\{0\}/g, `${instruction.type}`));
    }
  }

  onMCode(mCode: MCode) {
    if (this.ignoreStack.length) {
      return;
    }

    switch (mCode.id) {
      case 2:
      case 30:
        this.stop = true;
        this.callback.onFinish?.();
        break;

      case 17:
        this.nextBlockIndex = -1;
        break;

      default:
        this.callback.onUnhandledMCode?.(mCode);
        break;
    }
  }

  private isConditionTrue(expression: Expression | undefined): boolean {
    if (!expression) {
      throw new ProcessorException(Errors.INVALID_CONDITIONAL_EXPRESSION);
    }

    const condition = evaluate(expression, this.state.variables);

    if (typeof condition !== 'number') {
      throw new ProcessorException(Errors.INVALID_CONDITIONAL_EXPRESSION);
    }

    return !!condition;
  }

  private saveMotionVariable(name: string, value: number, newValue?: number) {
    if (!this.motionStartVariables) {
      this.motionStartVariables = new Variables(this.state.variables);
      this.motionEndVariables = new Variables(this.state.variables);
    }
    this.motionStartVariables.setNumber(name, value);
    if (newValue !== undefined) {
      this.motionEndVariables!.setNumber(name, newValue);
    }
  }

  private callWait() {
    const waitDelay = this.waitDelay;
    this.waitDelay = undefined;
    this.wait = false;

    this.callback.onWait?.(waitDelay);
  }

  private callMotion(start: Variables, end: Variables) {
    this.motionStartVariables = undefined;
    this.motionEndVariables = undefined;

    end.ownKeys.forEach((v) => this.state.variables.setNumber(v, end.getNumberOrDefault(v)));

    this.trySetCenterOfFirstLinearAxisFromSignedRadius(start, end);
    this.assignmentProcessor.setMissingCenterVariables(start);
    this.state.transformation.applyToVars(start);

    this.state.transformation.applyToVars(end);

    this.callback.onMotion?.(start, end, this.state);
  }

  private findBlockIndexByBlockNumber(blockNumber: number): number | undefined {
    const index = this.callStack[this.callStack.length - 1].ncText.blocks.findIndex((b) => b.blockNumber === blockNumber);
    return index < 0 ? undefined : index;
  }

  private findBlockIndexByLabel(label: string): number | undefined {
    const labelUpperCase = label.toUpperCase();
    const index = this.callStack[this.callStack.length - 1].ncText.blocks.findIndex((b) => b.labels?.includes(labelUpperCase));
    return index < 0 ? undefined : index;
  }

  private trySetCenterOfFirstLinearAxisFromSignedRadius(start: Variables, end: Variables) {
    var axes = this.state.machine.linearAxes[0];
    if (axes.centerNames.length >= 2) {
      Processor.trySetCenterFromSignedRadius(start, end, this.state.motionMode === MotionMode.CLOCKWISE, axes);
    }
  }

  private static trySetCenterFromSignedRadius(start: Variables, end: Variables, isClockwise: boolean, axes: LinearAxes) {
    const signedRadius = start.tryGetNumber(Constants.CENTER_RADIUS);
    if (signedRadius !== undefined) {
      const startX = start.getNumberOrDefault(axes.names[0]);
      const startY = start.getNumberOrDefault(axes.names[1]);
      const endX = end.getNumberOrDefault(axes.names[0]);
      const endY = end.getNumberOrDefault(axes.names[1]);

      const diffX = (endX - startX) / 2.0;
      const diffY = (endY - startY) / 2.0;
      const diffSquareLength = diffX * diffX + diffY * diffY;
      const diffLength = Math.sqrt(diffSquareLength);
      const orthOffset = Math.sqrt(signedRadius * signedRadius - diffSquareLength);
      const sign = isClockwise ? Math.sign(signedRadius) : -Math.sign(signedRadius);
      const orthX = (sign * orthOffset * diffY) / diffLength;
      const orthY = (-sign * orthOffset * diffX) / diffLength;
      const centerX = startX + diffX + orthX;
      const centerY = startY + diffY + orthY;

      start.setNumber(axes.centerNames[0], centerX);
      start.setNumber(axes.centerNames[1], centerY);
    }
  }
}
