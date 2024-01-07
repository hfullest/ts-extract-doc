import { InterfaceDeclaration, Node, Symbol as TsSymbol, ts } from 'ts-morph';
import { BaseDocField, DocumentProp, DocumentMethod, DocumentOptions, SymbolOrOtherType } from '../helper';
import { DocumentParser } from '../index';

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
    {
      // 处理继承
      const heritDocs = this.#handleExtends(symbolOrOther);
      if (heritDocs?.props) this.props = Object.assign(this.props, heritDocs.props);
      if (heritDocs?.methods) this.methods = Object.assign(this.methods, heritDocs.methods);
    }
    const properties = node?.getProperties?.() ?? [];
    const methods = node?.getMethods?.() ?? [];
    [...properties, ...methods].filter(Boolean)?.forEach((prop, index) => {
      const propName = prop?.getName();
      const currentSymbol = prop?.getSymbol();
      if (!currentSymbol) return;
      const options: DocumentOptions = {
        ...this.$options,
        $parentSymbol: symbol,
        $index: index,
        $parent: this,
      };
      if (DocumentMethod.isTarget(prop)) {
        delete this.props[propName]; // 方法和属性名不能相同
        this.methods[propName] = new DocumentMethod(currentSymbol!, options);
      } else if (DocumentProp.isTarget(prop)) {
        delete this.methods[propName]; // 方法和属性名不能相同
        this.props[propName] = new DocumentProp(currentSymbol!, options);
      }
    });
  }

  /** 处理`interface`继承 */
  #handleExtends(symbolOrOther: SymbolOrOtherType): {
    props: DocumentInterface['props'];
    methods: DocumentInterface['methods'];
  } {
    const { node } = BaseDocField.splitSymbolNodeOrType<TsSymbol, InterfaceDeclaration>(symbolOrOther);
    const extendsProperties = node?.getExtends?.();
    const extendsSymbols = extendsProperties?.map((it) => it.getExpression?.()?.getSymbol?.()).filter(Boolean);
    const docs = extendsSymbols?.reduce(
      (doc, symbol) => {
        const nestedDoc = DocumentParser<DocumentInterface>(symbol!, {
          ...this.$options,
          nestedLevel: this.$options.nestedLevel! + 1,
        });
        Object.assign(doc.props, nestedDoc?.props);
        Object.assign(doc.methods, nestedDoc?.methods);
        return doc;
      },
      { props: {}, methods: {} } as DocumentInterface,
    );
    return docs!;
  }

  static [Symbol.hasInstance] = (instance: any) => Object.getPrototypeOf(instance).constructor === this;

  /** 判断是否命中当前目标 */
  static isTarget(nodeOrOther: SymbolOrOtherType): nodeOrOther is InterfaceDeclaration {
    const { node } = BaseDocField.splitSymbolNodeOrType(nodeOrOther);
    return Node.isInterfaceDeclaration(node);
  }
}
