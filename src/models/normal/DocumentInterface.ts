import { InterfaceDeclaration, Node, Symbol as TsSymbol, ts } from 'ts-morph';
import { BaseDocField, DocumentProp, DocumentMethod, DocumentOptions, SymbolOrOtherType } from '../helper';
import { DocumentParser } from '../index';

export class DocumentInterface extends BaseDocField {
  #membersMap = new Map<string, DocumentProp | DocumentMethod>();

  set props(record) {
    Object.entries(record ?? {}).forEach(([key, value]) => {
      this.#membersMap.set(key, value);
    })
  }
  /** 属性 */
  get props(): Record<string, DocumentProp> {
    const properties = Array.from(this.#membersMap.entries()).filter(([, doc]) => doc instanceof DocumentProp) as [string, DocumentProp][];
    return Object.fromEntries(properties);
  }
  set methods(record) {
    Object.entries(record ?? {}).forEach(([key, value]) => {
      this.#membersMap.set(key, value);
    })
  }
  /** 方法 */
  get methods(): Record<string, DocumentMethod> {
    const methods = Array.from(this.#membersMap.entries()).filter(([, doc]) => doc instanceof DocumentMethod) as [string, DocumentMethod][];
    return Object.fromEntries(methods);
  }

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
        this.methods = { [propName]: new DocumentMethod(currentSymbol!, options) };
      } else if (DocumentProp.isTarget(prop)) {
        this.props = { [propName]: new DocumentProp(currentSymbol!, options) };
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

  static [Symbol.hasInstance] = (instance: any) => instance && Object.getPrototypeOf(instance).constructor === this;

  /** 判断是否命中当前目标 */
  static isTarget(nodeOrOther: SymbolOrOtherType): nodeOrOther is InterfaceDeclaration {
    const { node } = BaseDocField.splitSymbolNodeOrType(nodeOrOther);
    return Node.isInterfaceDeclaration(node);
  }
}
