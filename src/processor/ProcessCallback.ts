import { Block, GCode, Instruction, MCode, NcText } from '../models';
import { State } from './State';
import { Variables } from './Variables';

export interface Process {
  state: State;
  process(ncText: NcText): void;
  processRelative(ncText: NcText): void;
}

export interface ProcessCallback {
  onEnterBlock?(blockIndex: number, block: Block, ncText: NcText, process: Process): void;
  onInstruction?(instruction: Instruction, process: Process): void;
  onUnhandledMCode?(mCode: MCode, process: Process): void;
  onUnhandledGCode?(gCode: GCode, process: Process): void;
  onWait?(waitDelay: number | undefined, process: Process): void;
  onMotion?(start: Variables, end: Variables, process: Process): void;
  onEnterSubprogram?(subProgramName: string, subProgram: NcText, process: Process): void;
  onLeaveSubprogram?(subProgramName: string, subProgram: NcText, process: Process): void;
  onFinish?(process: Process): void;
}
