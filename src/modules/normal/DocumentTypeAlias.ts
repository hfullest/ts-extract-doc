import { Node, Symbol, TypeAliasDeclaration } from 'ts-morph';
import { BaseDocField, DocumentType } from '../helper';

export class DocumentTypeAlias extends BaseDocField {
  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);
  }

  static isTarget(node: Node): node is TypeAliasDeclaration {
    if (!node) return false;
    return Node.isTypeAliasDeclaration(node);
  }
}
