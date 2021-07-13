/* eslint-disable security/detect-non-literal-fs-filename */
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { Reader } from '../../src';

describe(Reader.name, () => {
  it('should parse NC text', async () => {
    const content = await fs.promises.readFile(path.join(__dirname, '..', 'data', 'nc.txt'), 'utf-8');
    const nc = Reader.readFromString(content);
    expect(nc.blocks).lengthOf(254);

    await fs.promises.mkdir(path.join(__dirname, '..', 'dump'), { recursive: true });
    await fs.promises.writeFile(path.join(__dirname, '..', 'dump', 'nc.txt.json'), JSON.stringify(nc));
  });
});
