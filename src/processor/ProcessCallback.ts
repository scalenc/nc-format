import { Block, GCode, Instruction, MCode, NcText } from '../models';
import { State } from './State';
import { Variables } from './Variables';

export interface ProcessCallback {
  onEnterBlock?(blockIndex: number, block: Block, ncText: NcText, state: State): void;
  onInstruction?(instruction: Instruction, state: State): void;
  onUnhandledMCode?(mCode: MCode, state: State): void;
  onUnhandledGCode?(gCode: GCode, state: State): void;
  onWait?(waitDelay: number | undefined, state: State): void;
  onMotion?(start: Variables, end: Variables, state: State): void;
  onEnterSubprogram?(subProgramName: string, subProgram: NcText, state: State): void;
  onLeaveSubprogram?(subProgramName: string, subProgram: NcText, state: State): void;
  onFinish?(state: State): void;
}
