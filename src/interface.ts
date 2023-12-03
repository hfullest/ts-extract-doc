import { Document } from './models/Document';
import { Project } from 'ts-morph';
import { TemplateDefault } from './mardown/templates/default';

export interface DocumentParseOptions {
  /** 当前文档嵌套等级，默认`0` */
  nestedLevel?: number;
  /** 最大嵌套等级，默认`2` */
  maxNestedLevel?: number;
  /** 可以自定义 `project` */
  project?: (singleton: boolean) => Project;
  /** `tsconfig.json路径` */
  tsConfigPath?: string;
  /** 解析策略
   *
   * - `default` 默认解析全部`export`导出，同时可以通过标签手动指定其他导出`@output`或者忽略导出`@ignoreOutput`
   * - `export` 只支持解析全部`export`导出
   * - `manual` 只支持手动指定`export`导出
   *
   * @default 'default'
   */
  strategy?: 'default' | 'export' | 'manual';
  /** 是否使用单例模式，如果为`true`则使用单例`project`
   * @default true
   */
  singleton?: boolean;
}

export interface TemplateCustom {
  /** 自定义模版渲染，返回`markdown`字符串 */
  render(document: Document): string;
}

/** @expand */
export type MarkdownOptions = TemplateDefault | TemplateCustom;

/** @expand */
export interface ConfigOptions {
  /** markdown 相关的配置 */
  markdown?: MarkdownOptions;
  /** `tsconfig.json路径` */
  tsConfigPath?: string;
  /** 文档生成相关配置 */
  document?: DocumentParseOptions;
}
