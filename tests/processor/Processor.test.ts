/* eslint-disable security/detect-non-literal-fs-filename */
import { Processor, Variables } from '../../src/processor';

import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { GCode, Instruction, MCode, Reader } from '../../src';

describe(Processor.name, () => {
  it('should process NC text', async () => {
    const content = await fs.promises.readFile(path.join(__dirname, '..', 'data', '01.nc.txt'), 'utf-8');
    const nc = Reader.readFromString(content);

    const protocol: string[] = [];
    const processor = new Processor({
      onEnterBlock: (blockIndex: number) => protocol.push(`onEnterBlock ${blockIndex}`),
      onInstruction: (instruction: Instruction) => protocol.push(`onInstruction: ${instruction.name}`),
      onUnhandledMCode: (mCode: MCode) => protocol.push(`onUnhandledMCode: ${mCode.id}`),
      onUnhandledGCode: (gCode: GCode) => protocol.push(`onUnhandledGCode: ${gCode.id}`),
      onWait: (waitDelay?: number) => protocol.push(`onWait: ${waitDelay}`),
      onMotion: (start: Variables, end: Variables) =>
        protocol.push(`onMotion: (${start.tryGetNumber('X')} ${start.tryGetNumber('Y')}) -> (${end.tryGetNumber('X')} ${end.tryGetNumber('Y')})`),
      onEnterSubprogram: (subProgramName: string) => protocol.push(`onEnterSubprogram: ${subProgramName}`),
      onLeaveSubprogram: (subProgramName: string) => protocol.push(`onLeaveSubprogram: ${subProgramName}`),
      onFinish: () => protocol.push(`onFinish`),
    });
    processor.process(nc);

    await fs.promises.mkdir(path.join(__dirname, '..', 'dump', 'processor'), { recursive: true });
    await fs.promises.writeFile(path.join(__dirname, '..', 'dump', 'processor', 'processed.nc.log'), protocol.join('\n'));

    expect(protocol).lengthOf(474);
  });
});
