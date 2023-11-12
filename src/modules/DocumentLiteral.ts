import { Symbol, TypeLiteralNode, VariableStatement } from 'ts-morph';
import BaseDocField from './BaseDocField';

export default class DocumentLiteral extends BaseDocField {
  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.#assign(symbol);
  }

  #assign(symbol: Symbol) {
    const node = symbol?.getValueDeclaration() ?? symbol?.getDeclarations()?.[0];
    const parentNode = this.getCompatAncestorNode<VariableStatement>(this.parentSymbol);
    const jsDoc = parentNode?.getJsDocs();
    
  }
}
