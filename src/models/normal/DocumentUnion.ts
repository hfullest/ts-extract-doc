import { Node, Symbol, Type } from 'ts-morph';
import { BaseDocField, DocumentOptions, SymbolOrOtherType } from '../helper';

export class DocumentUnion extends BaseDocField {
  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    options.parentSymbol ??= symbol;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbolOrOther, options);
    this.#options = options;

    this.#assign(symbolOrOther);
  }

  #options: DocumentOptions;

  #assign(symbolOrOther: SymbolOrOtherType) {}

  static isTarget(typeOrNode: SymbolOrOtherType) {
    const { type } = BaseDocField.splitSymbolNodeOrType(typeOrNode);
    return type?.isUnion();
  }
}
