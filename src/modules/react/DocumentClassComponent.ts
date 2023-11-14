import { Node, Symbol } from 'ts-morph';
import BaseDocField from '../BaseDocField';
import DocumentFunction from '../DocumentFunction';

export default class DocumentClassComponent extends BaseDocField {
  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.#assign(symbol);
  }

  #assign(symbol: Symbol) {}

  static isTarget(node: Node) {
    node = BaseDocField.getCompatAncestorNode(node.getSymbol());
    if (!DocumentFunction.isTarget(node)) return false;
  }
}
