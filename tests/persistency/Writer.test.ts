/* eslint-disable security/detect-non-literal-fs-filename */
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { Reader, Writer } from '../../src';

describe(Writer.name, () => {
  ['01.nc.txt', '02.nc.txt'].forEach((filename) => {
    it(`should write equal NC text to '${filename}'`, async () => {
      const content = await fs.promises.readFile(path.join(__dirname, '..', 'data', filename), 'utf-8');
      const nc = Reader.readFromString(content);

      const written = Writer.toString(nc, '\n');

      await fs.promises.mkdir(path.join(__dirname, '..', 'dump', 'persistency'), { recursive: true });
      await fs.promises.writeFile(path.join(__dirname, '..', 'dump', 'persistency', `${filename}`), written);

      const expected = content
        .replace(/\r\n/g, '\n')
        .replace(/" \)/g, '")')
        .replace(/\.00+,/g, ',')
        .replace(/\.00+\)/g, ')')
        .replace('(40.0)', '(40)')
        .replace(/=90.00 /g, '=90')
        .replace(/=270.00 ?/g, '=270')
        .replace(/\.300Y/g, '.3Y')
        .replace(/\.880Y/g, '.88Y')
        .replace(/\.000/g, '')
        .replace(/ MSG/g, 'MSG')
        .trim();
      await fs.promises.writeFile(path.join(__dirname, '..', 'dump', 'persistency', `expected.${filename}`), expected);
      expect(written).equals(expected);
    });
  });
});
