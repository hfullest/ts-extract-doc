import {
  Document,
  DocumentClass,
  DocumentFunction,
  DocumentInterface,
  DocumentMethod,
  DocumentParameter,
  DocumentProp,
} from '../../../models';

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

  constructor(doc: DocumentProp | DocumentMethod | DocumentParameter, document: Document) {
    const paramDoc = { current: null } as { current: Document | null };
    if (doc instanceof DocumentParameter) {
      paramDoc.current = doc?.type;
    }
    this.name = doc?.name!;
    const description = paramDoc.current?.description ?? doc?.description;
    this.description = description?.replace(/^/, '\n\n'); //开头添加两个换行是为了触发markdown在html中对`abc`这样的语法解析
    this.defaultValue = doc?.defaultValue;
    this.isOptional = doc?.isOptional;
    const type = paramDoc.current?.toTypeString() ?? doc?.toTypeString();
    this.type = type;
    this.version = paramDoc.current?.version ?? doc?.version;
    this.deprecated = paramDoc.current?.deprecated ?? doc?.deprecated;

    if (document instanceof DocumentFunction) this.kind = 'Function';
    else if (document instanceof DocumentClass) this.kind = 'Class';
    else if (document instanceof DocumentInterface) this.kind = 'Interface';
  }
}
