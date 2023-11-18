import { InterfaceDeclaration, Node, Symbol, TypeLiteralNode } from 'ts-morph';
import { BaseDocField, DocumentProp, DocumentMethod } from '../helper';

export class DocumentInterface extends BaseDocField {
  /** 属性 */
  props: Record<string, DocumentProp> = {};
  /** 方法 */
  methods: Record<string, DocumentMethod> = {};

  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.#assign(symbol);
  }

  #assign(symbol: Symbol) {
    const node = symbol?.getDeclarations()[0] as InterfaceDeclaration | TypeLiteralNode;
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

  /** 判断是否命中当前目标 */
  static isTarget(node: Node): node is InterfaceDeclaration {
    return Node.isInterfaceDeclaration(node);
  }
}
