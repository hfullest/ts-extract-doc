import { Node, Symbol, TypeAliasDeclaration, ts } from 'ts-morph';
import BaseDocField from './BaseDocField';

export default class DocumentTypeAlias extends BaseDocField {
  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.#assign(symbol);
  }

  #assign(symbol: Symbol) {
    const node = symbol?.getValueDeclaration() ?? symbol?.getDeclarations()?.[0];
    debugger;
    const typeAliasDeclaration = node.asKind(ts.SyntaxKind.TypeAliasDeclaration);
    const typeNode = typeAliasDeclaration?.getTypeNode().asKind(ts.SyntaxKind.IntersectionType);
    const typeText =typeAliasDeclaration?.getTypeNode()?.getChildren()
  }

  static isTarget(node: Node): node is TypeAliasDeclaration {
    return Node.isTypeAliasDeclaration(node);
  }
}
