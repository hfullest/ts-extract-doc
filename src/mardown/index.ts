import { Document, GenMarkdownOptions } from '../interface';
import defaultOptions from './defaultOptions';
import { templateReplacement } from './templateReplacement';

export const generateMarkdown = (docsFiles: Document[][], options: GenMarkdownOptions = defaultOptions): string => {
  const documents: string[] = [];
  docsFiles.forEach((file) => {
    file.forEach((doc) => {
      documents.push(templateReplacement(doc, options));
    });
  });
  return documents.join('\n');
};

export { defaultOptions };
