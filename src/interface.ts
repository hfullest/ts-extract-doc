import { InterfaceDeclaration, ModuleDeclaration, TypeAliasDeclaration, ts, Symbol, Node, JSDocTag } from 'ts-morph';

export type InterfaceOrTypeAliasOrModuleDeclaration = TypeAliasDeclaration | InterfaceDeclaration | ModuleDeclaration;

export interface DocumentTag {
  name: string;
  text: string;
  self: JSDocTag;
  parent: Node;
}

export interface CommonDocField {
  /** 名称 */
  name: string;
  /** 简单描述，取自注释`tag`标记之前的文本内容 */
  description: string;
  fullText: string;
  /** 额外补充描述，一般取`@description`修饰内容 */
  extraDescription?: string;
  /** `JSDoc的标签` */
  tags: DocumentTag[];
  /** `JSDoc`注释的例子 */
  example: string;
  version: string;
}

export interface Document extends CommonDocField {
  symbol?: Symbol;
  rootSymbol?: Symbol;
  filePath: string;
  props: Record<string, DocumentProp>;
}

export interface DocumentProp extends CommonDocField {
  isOptional: boolean;
  type: Type;
  defaultValue: any;
  parent: Node;
  /** 是否为方法，可用来区分属性和方法 */
  isMethod: boolean;
  /** 属性或方法修饰符，用于类，比如`private` */
  modifiers: ts.ModifierFlags;
  parameters: DocumentMethodParameter[];
  returns: {
    type: Type;
    description: string | null;
  };
}

export interface DocumentMethodParameter extends Omit<CommonDocField, 'tags' | 'example' | 'version'> {
  name: string;
  defaultValue: any;
  type: Type;
}

export interface Type {
  name: string;
  value?: any;
  raw?: string;
}

export interface DataSource {
  name: string;
  description: string;
  type: string;
  isOptional: boolean;
  defaultValue: string;
  version: string;
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
  headLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** 表格列配置 */
  columns: OptionsColums[];
  /** 标题自定义渲染
   * @param doc 文档块
   * @param headerMark 标题标记，例如`###`
   */
  headerRender?: (doc: Document, headerMark: string) => string;
  table?: {
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
