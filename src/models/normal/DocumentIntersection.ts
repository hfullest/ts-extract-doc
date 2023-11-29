import { Node, Symbol, Type } from 'ts-morph';
import { BaseDocField, DocumentOptions } from '../helper';

export class DocumentIntersection extends BaseDocField {
  constructor(symbol: Symbol, options: DocumentOptions) {
    options.parentSymbol ??= symbol;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbol, options);
    this.#options = options;

    this.#assign(symbol);
  }

  #options: DocumentOptions;

  #assign(symbol: Symbol) {}

  static isTarget(typeOrNode: Type | Node) {
    const type = typeOrNode instanceof Type ? typeOrNode : null;
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
