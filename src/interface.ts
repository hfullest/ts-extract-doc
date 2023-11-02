import { ts } from 'ts-morph';

export type InterfaceOrTypeAliasDeclaration = ts.TypeAliasDeclaration | ts.InterfaceDeclaration;
export interface StringIndexedObject<T> {
  [key: string]: T;
}

export interface ComponentDoc {
  expression?: ts.Symbol;
  rootExpression?: ts.Symbol;
  displayName: string;
  filePath: string;
  description: string;
  props: Props;
  methods: Method[];
  tags?: StringIndexedObject<string>;
}

export interface Props extends StringIndexedObject<PropItem> {}

export interface PropItem {
  name: string;
  required: boolean;
  type: PropItemType;
  description: string;
  defaultValue: any;
  parent?: ParentType;
  declarations?: ParentType[];
  tags?: {};
}

export interface Method {
  name: string;
  docblock: string;
  modifiers: string[];
  params: MethodParameter[];
  returns?: {
    description?: string | null;
    type?: string;
  } | null;
  description: string;
}

export interface MethodParameter {
  name: string;
  description?: string | null;
  type: MethodParameterType;
}

export interface MethodParameterType {
  name: string;
}

export interface Component {
  name: string;
}

export interface PropItemType {
  name: string;
  value?: any;
  raw?: string;
}

export interface ParentType {
  name: string;
  fileName: string;
}

export type PropFilter = (props: PropItem, component: Component) => boolean;

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
  parse(filePathOrPaths: string | string[]): ComponentDoc[];
  parseWithProgramProvider(filePathOrPaths: string | string[], programProvider?: () => ts.Program): ComponentDoc[];
}
