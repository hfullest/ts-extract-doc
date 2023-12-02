import { GenMarkdownOptions } from '../interface';
import { Document } from '../models';
import defaultMarkdownOptions from './defaultOptions';
import { templateReplacement } from './templateReplacement';

/** 根据文档模型生成`markdown `*/
export const generateMarkdown = (docsFiles: Document[][], options: GenMarkdownOptions = defaultMarkdownOptions): string => {
  const documents: string[] = [];
  docsFiles.forEach((file) => {
    file.forEach((doc) => {
      documents.push(templateReplacement(doc, options));
    });
  });
  return documents.join('\n');
};

export { defaultMarkdownOptions };
