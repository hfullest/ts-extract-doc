import { Node, Symbol, Type, ts } from 'ts-morph';
import { BaseDocField, DocumentOptions, SymbolOrOtherType } from '../helper';
import { IntersectionType } from 'typescript';
import { Document, DocumentParser } from '..';

export class DocumentIntersection extends BaseDocField {
  /** 保存相交类型原解析文档模型 */
  intersections: Document[] = [];

  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    options.parentSymbol ??= symbol;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbolOrOther, options);

    this.#assign(symbolOrOther);
  }

  #assign(symbolOrOther: SymbolOrOtherType) {
    const { type } = BaseDocField.splitSymbolNodeOrType<any, any, Type<ts.IntersectionType>>(symbolOrOther);
    const intersectionTypes = type?.getIntersectionTypes();
    const docs = intersectionTypes?.map((it) => DocumentParser(it, this.getComputedOptions()));
    this.intersections = docs ?? [];
  }

  static isTarget(typeOrNode: SymbolOrOtherType) {
    const { type } = BaseDocField.splitSymbolNodeOrType(typeOrNode);
    return type?.isIntersection();
  }
}
