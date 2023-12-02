import { resolve } from 'path';
import { extractTsToMarkdown, genrateDocument } from '../..';

describe('DocumentIntersection', () => {
  const sourcePath = resolve(__dirname, '../fixtures/intersection.ts');
  it('文档模型解析:', () => {
    const documents = genrateDocument(sourcePath);
    const result = documents.map(doc=>doc.map(it=>it.toTypeString())?.join('\n')).join('\n\n')
    expect(result).toMatchSnapshot();
  });

  it('快照', () => {
    const result = extractTsToMarkdown(sourcePath);
    expect(result).toMatchSnapshot();
  });
});
