import { InterfaceDeclaration, ModuleDeclaration, TypeAliasDeclaration, ts, Symbol, Node, JSDocTag } from 'ts-morph';

export type InterfaceOrTypeAliasOrModuleDeclaration = TypeAliasDeclaration | InterfaceDeclaration | ModuleDeclaration;
export interface StringIndexedObject<T> {
  [key: string]: T;
}

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
  example?: string;
}

export interface Document extends CommonDocField {
  symbol?: Symbol;
  rootSymbol?: Symbol;
  filePath: string;
  props: Record<string, DocumentProp>;
}

export interface DocumentProp extends CommonDocField {
  required: boolean;
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

export interface DocumentMethodParameter {
  name: string;
  required: boolean;
  defaultValue: any;
  description?: string | null;
  type: Type;
}

export interface Type {
  name: string;
  value?: any;
  raw?: string;
}

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
