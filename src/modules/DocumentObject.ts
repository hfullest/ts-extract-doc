import { Node, Symbol, TypeAliasDeclaration, ts } from 'ts-morph';
import DocumentProp from './DocumentProp';
import DocumentMethod from './DocumentMethod';
import BaseDocField from './BaseDocField';

// @ts-ignore
export default class DocumentObject extends BaseDocField {
  /** 属性 */
  props: Record<string, DocumentProp> = {};
  /** 方法 */
  methods: Record<string, DocumentMethod> = {};

  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.#assign(symbol);
  }

  #assign(symbol: Symbol) {
    debugger;
    const objectDeclaration = symbol?.getDeclarations()[0] as TypeAliasDeclaration;
    const node = objectDeclaration?.getTypeNode().asKind(ts.SyntaxKind.TypeLiteral);
    const properties = node?.getProperties();
    properties.forEach((prop) => {
      const propName = prop?.getName();
      const currentSymbol = prop?.getSymbol();
      if (DocumentMethod.isTarget(prop)) {
        this.methods[propName] = new DocumentMethod(currentSymbol, symbol);
      } else if (DocumentProp.isTarget(prop)) {
        this.props[propName] = new DocumentProp(currentSymbol, symbol);
      }
    });
  }

  static isTarget(node: Node) {
    const type = node?.getType();
    return type?.isObject();
  }
}
