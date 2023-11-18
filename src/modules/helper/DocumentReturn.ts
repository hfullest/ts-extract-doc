import { FunctionDeclaration, Node, ReturnStatement, Symbol } from 'ts-morph';
import { BaseDocField } from './BaseDocField';
import { DocumentFunction } from '../normal/DocumentFunction';
import { DocumentType } from './DocumentType';

export class DocumentReturn extends BaseDocField {
  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.#assign(symbol);
  }

  #assign(symbol: Symbol): void {
    const returns = symbol?.getDeclarations()[0] as ReturnStatement;
    const parentNode = this.getCompatAncestorNode<FunctionDeclaration>(this.parentSymbol);
    const functionTypeNode = DocumentFunction.getFunctionTypeNode(parentNode);
    const returnTypeNode = functionTypeNode?.getReturnTypeNode();
    const returnCommentNode = this.tags?.find((t) => Node.isJSDocReturnTag(t.node))?.node;

    this.type = new DocumentType(returnTypeNode);
    this.description = returnCommentNode?.getCommentText()?.replace(/(^\n)|(\n$)/g, '');
  }
}
