import { DocumentKind, DocumentTag } from '../interface';

export default class BaseDocField {
  /** 当前 symbol */
  symbol: Symbol;
  /** 顶级 symbol */
  rootSymbol: Symbol;
  /** 文档路径 */
  filePath: string;
  /** 当前文档类型 */
  kind: DocumentKind;
  /** 类型描述 */
  type: DocumentType;
  /** 名称 */
  name: string;
  /** 简单描述，取自注释`tag`标记之前的文本内容 */
  description: string;
  /** 全文本 */
  fullText: string;
  /** 额外补充描述，一般取`@description`修饰内容 */
  extraDescription?: string;
  /** `JSDoc的标签` */
  tags: DocumentTag[];
  /** `JSDoc`注释的例子 */
  example: string;
  /** 版本信息 */
  version: string;
  /** 位置信息 */
  pos: {
    /** 开始位置 [行,列] */
    start: [number, number];
    /** 结束位置 [行,列] */
    end: [number, number];
  };
}
