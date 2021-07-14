/* eslint-disable security/detect-non-literal-fs-filename */
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { Reader } from '../../src';

describe(Reader.name, () => {
  [
    { filename: '01.nc.txt', blocksCount: 254 },
    { filename: '02.nc.txt', blocksCount: 89 },
  ].forEach(({ filename, blocksCount }) => {
    it(`should parse NC text from '${filename}'`, async () => {
      const content = await fs.promises.readFile(path.join(__dirname, '..', 'data', filename), 'utf-8');
      const nc = Reader.readFromString(content);
      expect(nc.blocks).lengthOf(blocksCount);

      await fs.promises.mkdir(path.join(__dirname, '..', 'dump', 'persistency'), { recursive: true });
      await fs.promises.writeFile(path.join(__dirname, '..', 'dump', 'persistency', `${filename}.json`), JSON.stringify(nc));
    });
  });
});
