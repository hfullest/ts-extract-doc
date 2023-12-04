import { resolve } from 'path';
import { genrateDocument } from '../..';

describe('DocumentTuple', () => {
  const sourcePath = resolve(__dirname, '../fixtures/tuple.ts');

  it('文档模型解析[toTypeString]:', () => {
    const documents = genrateDocument(sourcePath);
    const result = documents.map((doc) => doc.map((it) => it.toTypeString())?.join('\n\n')).join('\n\n\n');
    expect(result).toMatchSnapshot();
  });

  it('快照', () => {
    const documents = genrateDocument(sourcePath);
    const result = documents.map((doc) => doc.map((it) => it.toTypeString())?.join('\n\n')).join('\n\n\n');
    expect(result).toMatchSnapshot();
  });
});
