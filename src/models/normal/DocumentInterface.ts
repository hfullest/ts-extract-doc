import { InterfaceDeclaration, Node, Symbol as TsSymbol } from 'ts-morph';
import { BaseDocField, DocumentProp, DocumentMethod, DocumentOptions, SymbolOrOtherType } from '../helper';

export class DocumentInterface extends BaseDocField {
  /** 属性 */
  props: Record<string, DocumentProp> = {};
  /** 方法 */
  methods: Record<string, DocumentMethod> = {};

  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    options.$parentSymbol ??= symbol;
    options.$rootSymbol ??= options?.$parentSymbol;
    super(symbolOrOther, options);

    this.#assign(symbolOrOther);
  }

  #assign(symbolOrOther: SymbolOrOtherType) {
    const { symbol, node } = BaseDocField.splitSymbolNodeOrType<TsSymbol, InterfaceDeclaration>(symbolOrOther);
    const properties = node?.getProperties();
    properties?.forEach((prop, index) => {
      const propName = prop?.getName();
      const currentSymbol = prop?.getSymbol();
      if (!currentSymbol) return;
      if (DocumentMethod.isTarget(prop)) {
        this.methods[propName] = new DocumentMethod(currentSymbol!, {
          ...this.$options,
          $parentSymbol: symbol,
          $index: index,
          $parent: this,
        });
      } else if (DocumentProp.isTarget(prop)) {
        this.props[propName] = new DocumentProp(currentSymbol!, {
          ...this.$options,
          $parentSymbol: symbol,
          $index: index,
          $parent: this,
        });
      }
    });
  }

  static [Symbol.hasInstance] = (instance: any) => Object.getPrototypeOf(instance).constructor === this;

  /** 判断是否命中当前目标 */
  static isTarget(nodeOrOther: SymbolOrOtherType): nodeOrOther is InterfaceDeclaration {
    const { node } = BaseDocField.splitSymbolNodeOrType(nodeOrOther);
    return Node.isInterfaceDeclaration(node);
  }
}
