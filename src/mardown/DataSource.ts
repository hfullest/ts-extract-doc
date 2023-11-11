import { Document } from '../interface';
import { DocumentClass, DocumentFunction, DocumentInterface, DocumentProp } from '../modules';

export default class DataSource {
  /** 字段名称 */
  name: string;
  /** 字段描述 */
  description: string;
  /** 类型 */
  type: string;
  /** 是否可选 */
  isOptional: boolean;
  /** 默认值 */
  defaultValue: string;
  /** 版本号 */
  version: string;
  /** 文档类型 */
  kind: 'Function' | 'Class' | 'Interface' | 'Enum' | 'LiteralObject';

  constructor(doc: Document) {
    this.name = doc.name;
    this.description = doc.description;
    this.defaultValue = (doc as DocumentProp)?.defaultValue;
    this.isOptional = (doc as DocumentProp)?.isOptional;
    this.type = doc.type?.name;
    this.version = doc.version;
    if (doc instanceof DocumentFunction) this.kind = 'Function';
    else if (doc instanceof DocumentClass) this.kind = 'Class';
    else if (doc instanceof DocumentInterface) this.kind = 'Interface';
  }
}
