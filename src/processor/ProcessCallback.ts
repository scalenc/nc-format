import { Block, GCode, Instruction, MCode, NcText } from '../models';
import { State } from './State';
import { Variables } from './Variables';

export interface ProcessCallback {
  onEnterBlock?(blockIndex: number, block: Block, ncText: NcText): void;
  onInstruction?(instruction: Instruction): void;
  onUnhandledMCode?(mCode: MCode): void;
  onUnhandledGCode?(gCode: GCode): void;
  onWait?(waitDelay?: number): void;
  onMotion?(start: Variables, end: Variables, state: State): void;
  onEnterSubprogram?(subProgramName: string, subProgram: NcText): void;
  onLeaveSubprogram?(subProgramName: string, subProgram: NcText): void;
  onFinish?(): void;
}
