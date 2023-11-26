import { EnumDeclaration, Node, Symbol, ts } from 'ts-morph';
import { BaseDocField, DocumentEnumMember, DocumentOptions } from '../helper';

export class DocumentEnum extends BaseDocField {
  /** 枚举成员 */
  members?: DocumentEnumMember[];

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
    const members = (node as EnumDeclaration)?.getMembers?.();
    this.members = members?.map((it, index) => new DocumentEnumMember(it.getSymbol()!, { ...this.#options, index }));
  }

  static isTarget(node: Node) {
    return Node.isEnumDeclaration(node);
  }
}
