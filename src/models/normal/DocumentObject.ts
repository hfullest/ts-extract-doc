import { Node, Symbol, TypeAliasDeclaration, TypeLiteralNode, ts } from 'ts-morph';
import { DocumentProp, BaseDocField, DocumentMethod, DocumentOptions, SymbolOrOtherType } from '../helper';

// @ts-ignore
export class DocumentObject extends BaseDocField {
  /** 属性 */
  props: Record<string, DocumentProp> = {};
  /** 方法 */
  methods: Record<string, DocumentMethod> = {};

  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    options.parentSymbol ??= symbol;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbolOrOther, options);
    this.#options = options;

    this.#assign(symbolOrOther);
  }

  #options: DocumentOptions;

  #assign(symbolOrOther: SymbolOrOtherType) {
    const { node: objectDeclaration, symbol } = BaseDocField.splitSymbolNodeOrType<Symbol, TypeAliasDeclaration>(
      symbolOrOther,
    );
    const node =
      objectDeclaration?.asKind(ts.SyntaxKind.TypeLiteral) ?? // 兼容
      objectDeclaration?.asKind(ts.SyntaxKind.ObjectLiteralExpression) ??
      objectDeclaration?.getTypeNode?.()?.asKind(ts.SyntaxKind.TypeLiteral);
    const properties = (node as TypeLiteralNode)?.getProperties();
    properties?.forEach((prop, index) => {
      const propName = prop?.getName();
      const currentSymbol = prop?.getSymbol();
      const options: DocumentOptions & { index: number } = {
        ...this.getComputedOptions(),
        parentSymbol: symbol,
        index,
      };
      if (DocumentMethod.isTarget(prop)) {
        this.methods[propName] = new DocumentMethod(currentSymbol!, options);
      } else if (DocumentProp.isTarget(prop)) {
        this.props[propName] = new DocumentProp(currentSymbol!, options);
      }
    });
  }

  static isTarget(nodeOrOther: SymbolOrOtherType) {
    const { type } = BaseDocField.splitSymbolNodeOrType(nodeOrOther);
    return type?.isObject() && !type?.isArray() && !type?.isTuple() && !type?.isNullable();
  }
}
