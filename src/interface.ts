import { Document } from './models/Document';
import { Project } from 'ts-morph';
import { TemplateDefault } from './markdown/templates/default';
import { TemplateBeauty } from './markdown/templates/beauty';

export interface DocumentParseOptions {
  /** 当前文档嵌套等级，
   *  @default 0
   */
  nestedLevel?: number;
  /** 最大嵌套等级，
   * @default 5
   */
  maxNestedLevel?: number;
  /** 可以自定义 `project` */
  project?: (singleton: boolean) => Project;
  /** `tsconfig.json路径` */
  tsConfigPath?: string;
  /** 解析策略
   *
   * - `default` 默认解析全部`export`导出，同时可以通过标签手动指定其他导出`@output`或者忽略导出`@ignoreOutput`
   * - `export` 只支持解析全部`export`导出
   * - `manual` 只支持手动指定`output`导出
   *
   * @default 'default'
   */
  strategy?: 'default' | 'export' | 'manual';
  /** 是否使用单例模式，如果为`true`则使用单例`project`
   * @default true
   */
  singleton?: boolean;
  /** 根据规则生成相应标签`id`, 例如 `<h3 id='someId'></h3>`, 优先级低于`@id` */
  idGenerator?: (name: string) => string;
  /** 是否自动计算合并推导类型，默认为`true`，优先级低于`@calculate` */
  autoCalculate?: boolean;
}

export interface TemplateCustom {
  /** 自定义模版渲染，返回`markdown`字符串 */
  render(document: Document): string;
}

/** @expand */
export type MarkdownOptions = TemplateCustom | TemplateDefault | TemplateBeauty;

/** @expand */
export interface ConfigOptions {
  /** markdown 相关的配置 */
  markdown?: MarkdownOptions;
  /** `tsconfig.json路径` */
  tsConfigPath?: string;
  /** 文档生成相关配置 */
  document?: DocumentParseOptions;
  /** 日志记录等级
   * @default 'info'
   */
  logger?: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';
}
