import { TypeAliasDeclaration } from 'ts-morph';
import { BaseDocField, DocumentOptions, SymbolOrOtherType } from '../helper';
import { Document, DocumentParser } from '../index';

export class DocumentTuple extends BaseDocField {
  /** 元组类型文档模型 */
  tuples: Document[] = [];

  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    options.$parentSymbol ??= symbol;
    options.$rootSymbol ??= options?.$parentSymbol;
    super(symbolOrOther, options);

    this.#assign(symbolOrOther);
  }

  #assign(symbolOrOther: SymbolOrOtherType) {
    const { node, type } = BaseDocField.splitSymbolNodeOrType<any, TypeAliasDeclaration>(symbolOrOther);
    const tupleTypes = type?.getTupleElements();
    const docs = tupleTypes
      ?.map((tuple) => {
        const symbol = tuple?.getAliasSymbol?.() ?? tuple?.getSymbol?.();
        const node = symbol?.getDeclarations?.()?.[0];
        return DocumentParser(node ?? tuple, { ...this.getComputedOptions(), $parent: this });
      })
      .filter(Boolean);
    this.tuples = (docs as Document[]) ?? [];
    this.displayType = node?.getTypeNode?.()?.getText?.();
    if (this.$options.$typeCalculate) {
      const displayType = docs
        ?.map((it) => it?.toTypeString())
        ?.filter(Boolean)
        .join(',');
      this.displayType = displayType ? `[${displayType}]` : undefined;
    }
  }

  static [Symbol.hasInstance] = (instance: any) => Object.getPrototypeOf(instance).constructor === this;

  static isTarget(nodeOrType: SymbolOrOtherType) {
    const { type } = BaseDocField.splitSymbolNodeOrType(nodeOrType);
    return type?.isTuple();
  }
}
