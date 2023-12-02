import { resolve } from 'path';
import { extractTsToMarkdown } from '../..';

describe('DocumentClass', () => {
  it('快照', () => {
    const result = extractTsToMarkdown(resolve(__dirname, '../fixtures/class.ts'), { document: { singleton: false } });
    expect(result).toMatchSnapshot();
  });
});
