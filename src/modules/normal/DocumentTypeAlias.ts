import { Node, Symbol, TypeAliasDeclaration } from 'ts-morph';
import { BaseDocField, DocumentOptions, DocumentType } from '../helper';

export class DocumentTypeAlias extends BaseDocField {
  constructor(symbol: Symbol, options: DocumentOptions) {
    options.parentSymbol ??= symbol;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbol, options);
    this.#options = options;

    this.#assign(symbol);
  }

  #options: DocumentOptions;

  #assign(symbol: Symbol) {
    const node = BaseDocField.getCompatAncestorNode(symbol) as TypeAliasDeclaration;
    this.type = new DocumentType(node?.getTypeNode(), this.#options); // 类型别名第一层不增加深度
  }

  static isTarget(node: Node): node is TypeAliasDeclaration {
    if (!node) return false;
    return Node.isTypeAliasDeclaration(node);
  }
}
