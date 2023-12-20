import { MarkdownOptions } from '../interface';
import { Document } from '../models';
import { beautyMarkdownOptions, defaultMarkdownOptions, mergeMarkdownOptions, render } from './templates';

/** 根据文档模型生成`markdown `*/
export const generateMarkdown = (docsFiles: Document[][], options?: MarkdownOptions): string => {
  const documents: string[] = [];
  options = mergeMarkdownOptions(options);
  docsFiles.forEach((file) => {
    file.forEach((doc) => {
      documents.push(render(doc, options));
    });
  });
  return documents.join('\n');
};

export { defaultMarkdownOptions, beautyMarkdownOptions, mergeMarkdownOptions };
