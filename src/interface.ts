import { InterfaceDeclaration, ModuleDeclaration, TypeAliasDeclaration, ts, Symbol, Node, JSDocTag } from 'ts-morph';

export type InterfaceOrTypeAliasOrModuleDeclaration = TypeAliasDeclaration | InterfaceDeclaration | ModuleDeclaration;
export interface StringIndexedObject<T> {
  [key: string]: T;
}

export interface DocumentTag {
  name: string;
  comment: string;
  self: JSDocTag;
  parent: Node;
}

export interface Document {
  symbol?: Symbol;
  rootSymbol?: Symbol;
  displayName: string;
  filePath: string;
  description: string;
  fullText: string;
  props: Record<string, DocumentProp>;
  tags?: DocumentTag[];
}

export interface DocumentProp {
  name: string;
  required: boolean;
  type: Type;
  description: string;
  defaultValue: any;
  parent: Node;
  tags: DocumentTag[];
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

// export interface DocumentMethod {
//   name: string;
//   docblock: string;
//   modifiers: ts.ModifierFlags;
//   params: DocumentMethodParameter[];
//   returns?: {
//     description?: string | null;
//     type?: string;
//   } | null;
//   description: string;
// }

export interface DocumentMethodParameter {
  name: string;
  required: boolean;
  defaultValue:any;
  description?: string | null;
  type: Type;
}

export interface Component {
  name: string;
}

export interface Type {
  name: string;
  value?: any;
  raw?: string;
}

export interface ParentType {
  name: string;
  fileName: string;
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
