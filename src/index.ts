import { parse } from './parse';
import { ConfigOptions, DocumentParseOptions, GenMarkdownOptions } from './interface';
import { defaultMarkdownOptions, generateMarkdown } from './mardown';
import { defaultDocumentOptions } from './models';

export const parseSourceFile = (filePathOrPaths: string | string[], parseOptions?: DocumentParseOptions) => {
  return parse(filePathOrPaths, parseOptions);
};

export { generateMarkdown, defaultMarkdownOptions, defaultDocumentOptions };

/** 从ts文件中提取文档，支持`type`、`interface`、`enum`、`react组件`、`函数`、`类`等 */
export const extractTsToMarkdown = (filePathOrPaths: string | string[], config?: ConfigOptions) => {
  const mergeMarkdownOptions: GenMarkdownOptions = Object.assign({}, defaultMarkdownOptions, config?.markdown);
  const mergeDocumentOptions: DocumentParseOptions = Object.assign({}, defaultDocumentOptions, { tsConfigPath: config?.tsConfigPath } as Partial<DocumentParseOptions>, config?.document);
  return generateMarkdown(parseSourceFile(filePathOrPaths, mergeDocumentOptions), mergeMarkdownOptions);
};
