import { Node, Symbol } from 'ts-morph';
import { BaseDocField, DocumentOptions } from '../helper';
import { DocumentFunction } from '../normal/DocumentFunction';

export class DocumentClassComponent extends BaseDocField {
  constructor(symbol: Symbol, options: DocumentOptions) {
    options.parentSymbol ??= symbol;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbol, options);
    this.#options = options;

    this.#assign(symbol);
  }

  #options: DocumentOptions;

  #assign(symbol: Symbol) {}

  static isTarget(node: Node) {
    node = BaseDocField.getCompatAncestorNode(node?.getSymbol());
    if (!DocumentFunction.isTarget(node)) return false;
  }
}
