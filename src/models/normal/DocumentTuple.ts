import { Node, Symbol, Type } from 'ts-morph';
import { BaseDocField, DocumentOptions } from '../helper';

export class DocumentTuple extends BaseDocField {
  constructor(symbol: Symbol, options: DocumentOptions) {
    options.parentSymbol ??= symbol;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbol, options);
    this.#options = options;

    this.#assign(symbol);
  }

  #options: DocumentOptions;

  #assign(symbol: Symbol) {}

  static isTarget(nodeOrType: Node | Type) {
    const { type } = BaseDocField.splitSymbolNodeOrType(nodeOrType);
    return (
      type?.isNumber() ||
      type?.isNumberLiteral() ||
      type?.isBoolean() ||
      type?.isBooleanLiteral() ||
      type?.isString() ||
      type?.isStringLiteral() ||
      type?.isTemplateLiteral() ||
      type?.isNullable()
    );
  }
}
