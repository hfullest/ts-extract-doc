import { resolve } from 'path';
import { extractTsToMarkdown, genrateDocument } from '../..';

describe('DocumentClass', () => {
  const sourcePath = resolve(__dirname, '../fixtures/enum.ts');
  it('文档模型解析[toTypeString]:', () => {
    const documents = genrateDocument(sourcePath);
    const result = documents.map((doc) => doc.map((it) => it.toTypeString())?.join('\n\n')).join('\n\n\n');
    expect(result).toMatchSnapshot();
  });

  it('快照', () => {
    const result = extractTsToMarkdown(sourcePath);
    expect(result).toMatchSnapshot();
  });
});
