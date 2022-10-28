# NC format library

[![License](https://img.shields.io/badge/license-BSD3-green)](https://github.com/scalenc/nc-format)
[![NPM version](https://img.shields.io/npm/v/@scalenc/nc-format)](https://www.npmjs.com/package/@scalenc/nc-format)

This is a typescript library to read and write TRUMPF NC.

It comes with a plain class model of the NC text and a persistency layer to read this model from a string.

Additionally, it provides a processor to interpret TRUMPF NC text.

## Installation

```sh
npm install nc-format
yarn add nc-format
pnpm add nc-format
```

## Examples

Sample usage to read NC code

```typescript
import { Reader } from '@scalenc/nc-format';

const nc = Reader.readFromString(`N500G01X527.8Y517.4C1=DC(0)`);
```

Sample usage to construct and write NC code

```typescript
import { NcBuilder, Writer } from '@scalenc/nc-format';

const nc = NcBuilder.block((b) => b.linear.X(10).Y(20)).block((b) => b.clockwise.X(30).I(10).J(10)).text;
const text = Writer.toString(nc);
```

Sample for NC interpretation

```typescript
import { Processor } from '@scalenc/nc-format';

const processor = new Processor({
  onEnterBlock: (blockIndex: number) => console.log(`onEnterBlock ${blockIndex}`),
  onInstruction: (instruction: Instruction) => console.log(`onInstruction: ${instruction.name}`),
  onUnhandledMCode: (mCode: MCode) => console.log(`onUnhandledMCode: ${mCode.id}`),
  onUnhandledGCode: (gCode: GCode) => console.log(`onUnhandledGCode: ${gCode.id}`),
  onWait: (waitDelay?: number) => console.log(`onWait: ${waitDelay}`),
  onMotion: (start: Variables, end: Variables) => {
    const x1 = start.tryGetNumber('X');
    const y1 = start.tryGetNumber('Y');
    const x2 = end.tryGetNumber('X');
    const y2 = end.tryGetNumber('Y');
    console.log(`onMotion: (${x1} ${y1}) -> (${x2} ${y2})`);
  },
  onEnterSubprogram: (subProgramName: string) => console.log(`onEnterSubprogram: ${subProgramName}`),
  onLeaveSubprogram: (subProgramName: string) => console.log(`onLeaveSubprogram: ${subProgramName}`),
  onFinish: () => console.log(`onFinish`),
});

const nc = Reader.readFromString(`N500G01X527.8Y517.4C1=DC(0)`);
processor.process(nc);
```

## Development

Run `yarn` to setup project and install all dependencies.

Run `yarn test` to run all tests.

Run `yarn run lint` to check for linting issues.

Run `yarn build` to build.

## License

All rights reserved to ScaleNC GmbH.

Source Code and Binaries licensed under BSD-3-Clause.
