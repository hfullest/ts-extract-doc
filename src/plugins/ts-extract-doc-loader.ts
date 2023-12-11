import * as loaderUtils from 'loader-utils';
import path from 'path';
import { extractTsToMarkdown } from '../index';
import { ConfigOptions } from '../interface';

export interface TsExtractDocImporter {
  /** 配置路径别名 */
  alias: Record<string, string>;
  /** 插件选项配置 */
  options: ConfigOptions;
}

export interface TsExtractDocOptions {
  /** 定义每个导入标识符，命中标识符才会走插件处理 */
  importers: Record<string, TsExtractDocImporter>;
}

const TARGET_REGEXP = /@import(?:\:(\S+))?(?:\s+)(?:([^\n\?]+)\??([^\n]*))(?=\n|$)/;

function parseImportIdentifier(match: RegExpExecArray, options: TsExtractDocOptions, basePath: string) {
  if (!match) return;
  const { importers } = options || {};
  const [, identifier, roughPath, paramsStr = ''] = match;
  const importConfig = importers[identifier ?? 'default'];
  if (!importConfig) return;
  const [targetReg, targetPath] =
    Object.entries(importConfig?.alias).find(([it]) => new RegExp(`^${it}`).test(roughPath)) ?? [];
  const combinePath = targetReg ? roughPath.replace(new RegExp(`^${targetReg}`), targetPath ?? '') : roughPath;
  const finalPath = path.isAbsolute(combinePath) ? combinePath : path.resolve(basePath, combinePath);
  const params = loaderUtils.parseQuery(`?${paramsStr}`);
  const meta = { identifier, path: finalPath, params, config: importConfig };
  return meta;
}

function replaceText(content: string, text: string = '', pos = [0, 0]) {
  if (!content) return '';
  const front = content.substring(0, pos[0]);
  const tail = content.substring(pos[1] + 1);
  return `${front}${text}${tail}`;
}

export default function (content: string) {
  // @ts-ignore
  const options = (loaderUtils.getOptions(this) || {}) as unknown as TsExtractDocOptions;
  // @ts-ignore
  this?.cacheable?.();
  const reg = new RegExp(TARGET_REGEXP, 'g');
  const match = { current: null, count: 0 } as { current: RegExpExecArray | null; count: number };
  while ((match.current = reg.exec(content)) !== null) {
    if (match.count > 100000) break; // 单个页面超过100000个导入语句，直接中断，防止无限循环
    match.count++;
    // @ts-ignore
    const meta = parseImportIdentifier(match.current, options, this?.context);
    if (!meta) return content;
    const pos = [match.current.index, match.current.index + match.current[0].length];
    const result = extractTsToMarkdown(meta.path, meta.config?.options);
    // @ts-ignore
    this?.addDependency?.(meta.path);
    content = replaceText(content, result ?? '', pos);
  }
  return content;
}
