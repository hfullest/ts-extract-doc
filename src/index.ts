import { parse } from './parse';
import { ConfigOptions, GenMarkdownOptions } from './interface';
import { defaultOptions, generateMarkdown } from './mardown';
import { merge } from 'lodash-es';

export const parseSourceFile = (filePathOrPaths: string | string[]) => {
  return parse(filePathOrPaths);
};

export { generateMarkdown };

/** 从ts文件中提取文档，支持`type`、`interface`、`enum`、react组件、函数、类等 */
export const extractTsToMarkdown = (filePathOrPaths: string | string[], config?: ConfigOptions) => {
  const mergeOptions: GenMarkdownOptions = merge({}, defaultOptions, config?.markdown);
  return generateMarkdown(parseSourceFile(filePathOrPaths), mergeOptions);
};
