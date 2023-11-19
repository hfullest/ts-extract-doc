import { Node, Symbol, ts } from 'ts-morph';
import { BaseDocField, DocumentEnumMember } from '../helper';

export class DocumentEnum extends BaseDocField {
  members: DocumentEnumMember[];

  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.#assign(symbol);
  }

  #assign(symbol: Symbol) {
    const node = BaseDocField.getCompatAncestorNode(symbol)?.asKind(ts.SyntaxKind.EnumDeclaration);
    const members = node.getMembers();
    this.members = members.map((it) => new DocumentEnumMember(it.getSymbol()));
  }

  static isTarget(node: Node) {
    return Node.isEnumDeclaration(node);
  }
}
