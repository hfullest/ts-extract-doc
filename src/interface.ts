import { ts, Symbol, Node, JSDocTag } from 'ts-morph';
import {
  DocumentLiteral,
  DocumentFunction,
  DocumentClass,
  DocumentTypeAlias,
  DocumentInterface,
  DocumentExport,
  DocumentProp,
} from './modules';
import DataSource from './mardown/DataSource';

export interface DocumentTag {
  name: string;
  text: string;
  node: JSDocTag;
  parent: Node;
}

/** 文档可能出现的位置类型 */
export enum DocumentKind {
  /** 字面量类型 */
  Literal,
  /** 函数 */
  Function,
  /** 类 */
  Class,
  /** 类型别名`type` */
  TypeAlias,
  /** 接口 */
  Interface,
  /** 导出 */
  Export,
}

export interface CommonDocField {
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

export type Document =
  | DocumentLiteral
  | DocumentFunction
  | DocumentClass
  | DocumentTypeAlias
  | DocumentInterface
  | DocumentExport;

// export interface DocumentLiteral extends CommonDocField {
//   kind: DocumentKind.Literal;
// }

// export interface DocumentFunction extends CommonDocField {
//   kind: DocumentKind.Function;
//   /** 参数 */
//   parameters: DocumentParameter[];
//   /** 方法返回 */
//   returns: DocumentReturn;
// }

// export interface DocumentClass extends Omit<DocumentInterface, 'kind'> {
//   kind: DocumentKind.Class;
//   /** 构造函数文档 */
//   constructor: DocumentMethod;
//   /** 静态属性 */
//   staticProps: Record<string, DocumentProp>;
//   /** 静态方法 */
//   staticMethods: Record<string, DocumentMethod>;
// }

// export interface DocumentTypeAlias extends CommonDocField {
//   kind: DocumentKind.TypeAlias;
// }

// export interface DocumentInterface extends CommonDocField {
//   kind: DocumentKind.Interface;
//   /** 属性 */
//   props: Record<string, DocumentProp>;
//   /** 方法 */
//   methods: Record<string, DocumentFunction>;
// }

// export interface DocumentExport extends CommonDocField {
//   kind: DocumentKind.Export;
// }

// export interface DocumentProp extends CommonDocField {
//   /** 是否可选  */
//   isOptional: boolean;
//   type: DocumentType;
//   defaultValue: any;
//   parent: Node;
//   /** 属性或方法修饰符，用于类，比如`private` */
//   modifiers: ts.ModifierFlags;
// }

// export interface DocumentMethod extends DocumentFunction {
//   /** 装饰器 */
//   decorator?: DocumentDecorator[];
//   /** 是否可选  */
//   isOptional: boolean;
//   /** 修饰符 */
//   modifiers: ts.ModifierFlags;
// }

// export interface DocumentDecorator extends CommonDocField {
//   //TODO: 支持装饰器
// }

// export type DocumentParameter = DocumentLiteral | DocumentFunction | DocumentClass;

// export type DocumentReturn = DocumentLiteral | DocumentFunction | DocumentClass;

export interface DocumentType {
  name: string;
  value?: any;
  raw?: string;
}

export interface OptionsColums {
  /** 列名称 */
  title: string;
  /** 列数据在数据项中对应的属性名 */
  dataIndex: keyof DataSource;
  /** 列布局 */
  align?: 'left' | 'right' | 'center';
  /** 自定义列渲染，输出应为`markdown`字符串 */
  render?: (record: DataSource, index: number) => string;
}
export interface GenMarkdownOptions {
  /** 默认标题等级 */
  headLevel?: 1 | 2 | 3 | 4 | 5 | 6 | number;
  /** 表格列配置 */
  columns: OptionsColums[];
  /** 标题自定义渲染
   * @param doc 文档块
   * @param headerMark 标题标记，例如`###`
   */
  headerRender?: (doc: Document, headerMark: string) => string;
  table?: {
    /** 表格头部属性标题 默认值`属性` */
    propHeadName: string;
    /** 表格头部方法标题 默认值`方法` */
    methodHeadName: string;
    /** 表格头部静态属性标题 默认值`静态属性` */
    staticPropHeadName: string;
    /** 表格头部静态方法标题 默认值`静态方法` */
    staticMethodHeadName: string;
    /** 表格中换行符的替换字符（由于markdown表格中换行符会破坏表格结构，因此需要替换）
     *
     *  默认值为`空格`
     */
    lineBreakDelimiter?: string;
    /** 表格空白位占位填充 默认值为空格 */
    whiteSpaceFill?: string;
  };
}

///////////////////////////////
export interface Component {
  name: string;
}

export type PropFilter = (props: DocumentProp, component: Component) => boolean;

export type ComponentNameResolver = (exp: ts.Symbol, source: ts.SourceFile) => string | undefined | null | false;

export interface ParserOptions {
  propFilter?: StaticPropFilter | PropFilter;
  componentNameResolver?: ComponentNameResolver;
  shouldExtractLiteralValuesFromEnum?: boolean;
  shouldRemoveUndefinedFromOptional?: boolean;
  shouldExtractValuesFromUnion?: boolean;
  skipChildrenPropWithoutDoc?: boolean;
  savePropValueAsString?: boolean;
  shouldIncludePropTagMap?: boolean;
  shouldIncludeExpression?: boolean;
  customComponentTypes?: string[];
}

export interface StaticPropFilter {
  skipPropsWithName?: string[] | string;
  skipPropsWithoutDoc?: boolean;
}

export interface FileParser {
  parse(filePathOrPaths: string | string[]): Document[];
  parseWithProgramProvider(filePathOrPaths: string | string[], programProvider?: () => ts.Program): Document[];
}
