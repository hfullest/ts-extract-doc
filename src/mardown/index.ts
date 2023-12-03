import { MarkdownOptions } from '../interface';
import { Document } from '../models';
import { defaultMarkdownOptions } from './templates';
import { render } from './templates';

/** 根据文档模型生成`markdown `*/
export const generateMarkdown = (
  docsFiles: Document[][],
  options: MarkdownOptions = defaultMarkdownOptions,
): string => {
  const documents: string[] = [];
  docsFiles.forEach((file) => {
    file.forEach((doc) => {
      documents.push(render(doc, options));
    });
  });
  return documents.join('\n');
};

export { defaultMarkdownOptions };
