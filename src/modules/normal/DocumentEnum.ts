import { Node, Symbol, ts } from 'ts-morph';
import { BaseDocField, DocumentEnumMember, DocumentOptions } from '../helper';

export class DocumentEnum extends BaseDocField {
  members: DocumentEnumMember[];

  constructor(symbol: Symbol, options: DocumentOptions) {
    options.parentSymbol ??= symbol;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbol, options);
    this.#options = options;

    this.#assign(symbol);
  }

  #options: DocumentOptions;

  #assign(symbol: Symbol) {
    const node = BaseDocField.getCompatAncestorNode(symbol)?.asKind(ts.SyntaxKind.EnumDeclaration);
    const members = node.getMembers();
    this.members = members.map((it) => new DocumentEnumMember(it.getSymbol(), this.#options));
  }

  static isTarget(node: Node) {
    return Node.isEnumDeclaration(node);
  }
}
