import {
  Document,
  DocumentClass,
  DocumentEnumMember,
  DocumentFunction,
  DocumentInterface,
  DocumentMethod,
  DocumentObject,
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
  /** `key`值，用于枚举成员 */
  label?: DocumentEnumMember['label'];
  /** `value`值，用于枚举成员 */
  value?: DocumentEnumMember['value'];
  /** 文档类型 */
  kind!: 'Function' | 'Class' | 'Interface' | 'Enum' | 'LiteralObject';

  constructor(doc: DocumentProp | DocumentMethod | DocumentParameter | DocumentEnumMember, document: Document) {
    const paramDoc = { current: null } as { current: Document | null };
    if (doc instanceof DocumentParameter) {
      paramDoc.current = doc?.type;
    }
    if (doc instanceof DocumentEnumMember) {
      this.label = doc.label!;
      this.value = doc.value!;
    }
    this.name = doc?.name!;
    const description = paramDoc.current?.description ?? doc?.description;
    this.description = description?.replace(/^/, '\n\n'); //开头添加两个换行是为了触发markdown在html中对`abc`这样的语法解析
    this.defaultValue = (doc as DocumentProp)?.defaultValue;
    this.isOptional = (doc as DocumentProp)?.isOptional;
    const type = paramDoc.current?.toTypeString() ?? doc?.toTypeString();
    this.type = type;
    this.version = paramDoc.current?.version ?? doc?.version;
    this.deprecated = paramDoc.current?.deprecated ?? doc?.deprecated;

    if (document instanceof DocumentFunction) this.kind = 'Function';
    else if (document instanceof DocumentClass) this.kind = 'Class';
    else if (document instanceof DocumentObject) this.kind = 'LiteralObject';
    else if (document instanceof DocumentInterface) this.kind = 'Interface';
    else if (document instanceof DocumentEnumMember) this.kind = 'Enum';
  }
}
