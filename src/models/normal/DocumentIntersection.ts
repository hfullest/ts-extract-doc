import { Type, TypeAliasDeclaration, ts } from 'ts-morph';
import { BaseDocField, DocumentOptions, SymbolOrOtherType } from '../helper';
import { Document, DocumentMethod, DocumentObject, DocumentParser, DocumentProp } from '../index';

export class DocumentIntersection extends BaseDocField {
  /** 保存相交类型原解析文档模型 */
  intersections: Document[] = [];

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
    const { node, type } = BaseDocField.splitSymbolNodeOrType<any, TypeAliasDeclaration, Type<ts.IntersectionType>>(
      symbolOrOther,
    );
    const intersectionTypes = type?.getIntersectionTypes();
    const docs = intersectionTypes
      ?.map((it) => DocumentParser<DocumentObject>(it, { ...this.getComputedOptions(), $parent: this }))
      .filter(Boolean);
    this.intersections = (docs as Document[]) ?? [];
    this.displayType = node?.getTypeNode?.()?.getText?.() ?? node?.getText?.();
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

  static [Symbol.hasInstance] = (instance: any) => Object.getPrototypeOf(instance).constructor === this;

  static isTarget(typeOrNode: SymbolOrOtherType) {
    const { type } = BaseDocField.splitSymbolNodeOrType(typeOrNode);
    return type?.isIntersection();
  }
}
