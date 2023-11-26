import { InterfaceDeclaration, Node, Symbol, TypeLiteralNode } from 'ts-morph';
import { BaseDocField, DocumentProp, DocumentMethod, DocumentOptions } from '../helper';

export class DocumentInterface extends BaseDocField {
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
    const node = symbol?.getDeclarations()[0] as InterfaceDeclaration | TypeLiteralNode;
    const properties = node?.getProperties();
    properties.forEach((prop, index) => {
      const propName = prop?.getName();
      const currentSymbol = prop?.getSymbol();
      if (!currentSymbol) return;
      if (DocumentMethod.isTarget(prop)) {
        this.methods[propName] = new DocumentMethod(currentSymbol!, { ...this.#options, parentSymbol: symbol, index });
      } else if (DocumentProp.isTarget(prop)) {
        this.props[propName] = new DocumentProp(currentSymbol!, { ...this.#options, parentSymbol: symbol, index });
      }
    });
  }

  /** 判断是否命中当前目标 */
  static isTarget(node: Node): node is InterfaceDeclaration {
    return Node.isInterfaceDeclaration(node);
  }
}
