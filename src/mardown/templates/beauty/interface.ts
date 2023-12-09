import { Document, DocumentMethod, DocumentParameter, DocumentProp } from '../../../models';
import DataSource from './DataSource';

export interface OptionsColums {
  /** 列名称 */
  title: string;
  /** 列数据在数据项中对应的属性名 */
  dataIndex: keyof DataSource;
  /** 列布局 */
  align?: 'left' | 'right' | 'center';
  /** 自定义列渲染，输出应为`markdown`字符串 */
  render?: (record: DataSource, index: number, doc: DocumentProp | DocumentMethod | DocumentParameter) => string;
}

export interface TableConfig {
  /** 表格列配置 */
  columns?: OptionsColums[];
  /** 表格头部属性标题 默认值`属性` */
  propHeadName?: string;
  /** 表格头部方法标题 默认值`方法` */
  methodHeadName?: string;
  /** 表格头部静态属性标题 默认值`静态属性` */
  staticPropHeadName?: string;
  /** 表格头部静态方法标题 默认值`静态方法` */
  staticMethodHeadName?: string;
  /** 表格中换行符的替换字符（由于markdown表格中换行符会破坏表格结构，因此需要替换）
   *
   *  默认值为`空格`
   */
  lineBreakDelimiter?: string;
  /** 表格空白位占位填充 默认值为空格 */
  whiteSpaceFill?: string;
  /** 转译规则，有的字段包含markdown误识别语法，需要转译 */
  escapeRules?: (text: string) => string;
}

export type TableConfigFunction = (doc: Document, defaultConfig: TableConfig, options?: TemplateBeauty) => TableConfig;

export interface TemplateBeauty {
  template: 'beauty';
  headLevel?: 1 | 2 | 3 | 4 | 5 | 6 | number;
  /** 标题自定义渲染
   * @param doc 文档块
   * @param headerLevel 标题标记，例如`###`
   */
  headerRender?: (doc: Document, headerLevel: number) => string;
  /** 表格配置
   * - 可以配置通用配置
   * - 也可以配置函数，根据条件使用不同的配置，例如可以使用`doc instanceof DocumentClass`判断条件来返回命中规则的配置
   *  */
  table?: TableConfig | TableConfigFunction;
}
