import { DocumentClass, DocumentFunction, DocumentInterface, DocumentMethod, DocumentProp } from '../../../models';

export default class DataSource {
  /** 字段名称 */
  name!: string;
  /** 字段描述 */
  description?: string;
  /** 类型 */
  type?: string;
  /** 是否可选 */
  isOptional?: boolean;
  /** 默认值 */
  defaultValue?: string;
  /** 版本号 */
  version?: string;
  /** 是否废弃，字符串表示废弃描述 */
  deprecated?: boolean | string;
  /** 是否只读 */
  readonly?: boolean;
  /** 文档类型 */
  kind!: 'Function' | 'Class' | 'Interface' | 'Enum' | 'LiteralObject';
  /** 属性 */
  props?: Record<string, DocumentProp>;
  /** 方法 */
  methods?: Record<string, DocumentMethod>;

  constructor(doc: DocumentProp | DocumentMethod) {
    this.name = doc?.name!;
    this.description = doc.description;
    this.defaultValue = doc?.defaultValue;
    this.isOptional = doc?.isOptional;
    this.type = doc.toTypeString();
    this.version = doc?.version;
    this.deprecated = doc?.deprecated;
    if (doc instanceof DocumentFunction) this.kind = 'Function';
    else if (doc instanceof DocumentClass) this.kind = 'Class';
    else if (doc instanceof DocumentInterface) this.kind = 'Interface';
  }
}
