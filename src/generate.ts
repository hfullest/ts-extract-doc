import { parse } from './parse';
import { ConfigOptions, DocumentParseOptions, MarkdownOptions } from './interface';
import { defaultMarkdownOptions, generateMarkdown } from './mardown';
import { defaultDocumentOptions } from './models';

/** 根据源文件生成文档模型 */
export const genrateDocument = (filePathOrPaths: string | string[], parseOptions?: DocumentParseOptions) => {
  return parse(filePathOrPaths, parseOptions);
};

/** 从ts文件中提取文档到`markdown`，支持`type`、`interface`、`enum`、`react组件`、`函数`、`类`等 */
export const extractTsToMarkdown = (filePathOrPaths: string | string[], config?: ConfigOptions) => {
  const mergeMarkdownOptions: MarkdownOptions = Object.assign({}, defaultMarkdownOptions, config?.markdown);
  const mergeDocumentOptions: DocumentParseOptions = Object.assign(
    {},
    defaultDocumentOptions,
    { tsConfigPath: config?.tsConfigPath } as Partial<DocumentParseOptions>,
    config?.document,
  );
  return generateMarkdown(genrateDocument(filePathOrPaths, mergeDocumentOptions), mergeMarkdownOptions);
};
