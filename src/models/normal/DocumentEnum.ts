import { EnumDeclaration, Node, Symbol, ts } from 'ts-morph';
import { BaseDocField, DocumentEnumMember, DocumentOptions, SymbolOrOtherType } from '../helper';

export class DocumentEnum extends BaseDocField {
  /** 枚举成员 */
  members?: DocumentEnumMember[];

  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    options.parentSymbol ??= symbol;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbolOrOther, options);
    this.#options = options;

    this.#assign(symbolOrOther);
  }

  #options: DocumentOptions;

  #assign(symbolOrOther: SymbolOrOtherType) {
    const { node: enumDeclaration } = BaseDocField.splitSymbolNodeOrType<Symbol, EnumDeclaration>(symbolOrOther);
    const node = enumDeclaration?.asKind(ts.SyntaxKind.EnumDeclaration);
    const members = (node as EnumDeclaration)?.getMembers?.();
    this.members = members?.map((it, index) => new DocumentEnumMember(it.getSymbol()!, { ...this.#options, index }));
  }

  static isTarget(nodeOrOther: SymbolOrOtherType) {
    const { node } = BaseDocField.splitSymbolNodeOrType(nodeOrOther);
    return Node.isEnumDeclaration(node);
  }
}
