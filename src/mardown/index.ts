import { Document } from '../interface';

export interface GenMarkdownOptions {
  headLevel?: '1' | '2' | '3' | '4' | '5' | '6';
}

export const generateMarkdown = (docsFiles: Document[][], options: GenMarkdownOptions = {}): string => {
  const documents: string[] = [];
  docsFiles.forEach((file) => {
    file.forEach((doc) => {
      documents.push(templateReplacement(doc, options));
    });
  });
  return documents.join('\n');
};

const getHeadLevel = (level: GenMarkdownOptions['headLevel']) => '#######'.slice(-+level);

const templateReplacement = (doc: Document, options: GenMarkdownOptions): string => {
  const { headLevel: topLevel = '3' } = options;
  const { name, description, extraDescription, example } = doc;
  const header = `${getHeadLevel(topLevel)} ${name}`;
  const desc = `${description}`;
  const table = `表格`;
  const extra = `${extraDescription}`;
  const exampleCode = example ? `\n\`\`\`tsx\n${example}\n\`\`\`` : '';
  return [header, desc, table, extra, exampleCode].filter(Boolean).join('\n');
};
