import { Type, TypeAliasDeclaration, ts } from 'ts-morph';
import { BaseDocField, DocumentOptions, SymbolOrOtherType } from '../helper';
import { Document, DocumentObject, DocumentParser } from '../index';

export class DocumentIntersection extends BaseDocField {
  /** 保存相交类型原解析文档模型 */
  intersections: Document[] = [];
  /** 属性 */
  props: DocumentObject['props'] = {};
  /** 方法 */
  methods: DocumentObject['methods'] = {};

  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    options.$parentSymbol ??= symbol;
    options.$rootSymbol ??= options?.$parentSymbol;
    super(symbolOrOther, options);

    this.#assign(symbolOrOther);
  }

  #assign(symbolOrOther: SymbolOrOtherType) {
    const { node, type } = BaseDocField.splitSymbolNodeOrType<any, TypeAliasDeclaration, Type<ts.IntersectionType>>(
      symbolOrOther,
    );
    const intersectionTypes = type?.getIntersectionTypes();
    const docs = intersectionTypes?.map((it) => DocumentParser<DocumentObject>(it, this.getComputedOptions()));
    this.intersections = docs ?? [];
    this.displayType = node?.getTypeNode?.()?.getText?.();
    if (this.$options.$typeCalculate) {
      const displayTypes: string[] = [];
      docs?.forEach((doc) => {
        this.props = Object.assign({}, this.props, doc?.props);
        this.methods = Object.assign({}, this.methods, doc?.methods);
        displayTypes.push(doc?.displayType!);
      });
      this.displayType = displayTypes.filter(Boolean).join('&');
    }
  }

  static isTarget(typeOrNode: SymbolOrOtherType) {
    const { type } = BaseDocField.splitSymbolNodeOrType(typeOrNode);
    return type?.isIntersection();
  }
}
