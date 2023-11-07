import { Document } from '../interface';

export interface GenMarkdownOptions {
  topLevel?: '0' | '1' | '2' | '3' | '4' | '5' | '6';
}

export const generateMarkdown = (docsFiles: Document[][], options: GenMarkdownOptions = {}): string => {
  const documents: string[] = [];
  docsFiles.forEach((file) => {
    file.forEach((doc) => {
      documents.push(templateReplacement(doc, options));
    });
  });
  return '';
};

const getHeadLevel = (level: GenMarkdownOptions['topLevel']) => '#######'.slice(+level);

const templateReplacement = (doc: Document, options: GenMarkdownOptions): string => {
  const { topLevel } = options;
  const { displayName, fullText } = doc;
  return doc.fullText;
};
