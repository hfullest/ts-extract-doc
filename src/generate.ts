import { parse } from './parse';
import { ConfigOptions, DocumentParseOptions, MarkdownOptions } from './interface';
import { generateMarkdown, mergeMarkdownOptions } from './markdown';
import { defaultDocumentOptions } from './models';
import logger from './utils/Logger';

/** 根据源文件生成文档模型 */
export const genrateDocument = (filePathOrPaths: string | string[], parseOptions?: DocumentParseOptions) => {
  return parse(filePathOrPaths, parseOptions);
};

/** 从ts文件中提取文档到`markdown`，支持`type`、`interface`、`enum`、`react组件`、`函数`、`类`等 */
export const extractTsToMarkdown = (filePathOrPaths: string | string[], config?: ConfigOptions) => {
  const mergedMarkdownOptions: MarkdownOptions = mergeMarkdownOptions(Object.assign({}, config?.logger && { logger: config.logger }, config?.markdown));
  const mergedDocumentOptions: DocumentParseOptions = Object.assign(
    {},
    defaultDocumentOptions,
    { tsConfigPath: config?.tsConfigPath } as Partial<DocumentParseOptions>,
    config?.logger && { logger: config?.logger },
    config?.document,
  );
  if (config?.logger?.level) { logger.level = config.logger.level; }

  return generateMarkdown(genrateDocument(filePathOrPaths, mergedDocumentOptions), mergedMarkdownOptions);
};
