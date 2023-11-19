import { Node, Symbol, TypeAliasDeclaration, ts } from 'ts-morph';
import { DocumentProp, BaseDocField, DocumentMethod, DocumentOptions } from '../helper';

// @ts-ignore
export class DocumentObject extends BaseDocField {
  /** 属性 */
  props: Record<string, DocumentProp> = {};
  /** 方法 */
  methods: Record<string, DocumentMethod> = {};

  constructor(symbol: Symbol, options: DocumentOptions) {
    options.parentSymbol ??= symbol;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbol, options);
    this.#options = options;

    this.#assign(symbol);
  }

  #options: DocumentOptions;

  #assign(symbol: Symbol) {
    const objectDeclaration = symbol?.getDeclarations()[0] as TypeAliasDeclaration;
    const node =
      objectDeclaration?.asKind(ts.SyntaxKind.TypeLiteral) ?? // 兼容
      objectDeclaration?.getTypeNode?.()?.asKind(ts.SyntaxKind.TypeLiteral);
    const properties = node?.getProperties();
    properties?.forEach((prop) => {
      const propName = prop?.getName();
      const currentSymbol = prop?.getSymbol();
      const options: DocumentOptions = { ...this.getComputedOptions(), parentSymbol: symbol };
      if (DocumentMethod.isTarget(prop)) {
        this.methods[propName] = new DocumentMethod(currentSymbol, options);
      } else if (DocumentProp.isTarget(prop)) {
        this.props[propName] = new DocumentProp(currentSymbol, options);
      }
    });
  }

  static isTarget(node: Node) {
    const type = node?.getType();
    return type?.isObject() && !type?.isArray() && !type?.isTuple() && !type?.isNullable();
  }
}
