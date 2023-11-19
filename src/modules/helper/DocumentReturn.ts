import { FunctionDeclaration, JSDocReturnTag, Node, ReturnStatement, Symbol } from 'ts-morph';
import { BaseDocField, DocumentOptions } from './BaseDocField';
import { DocumentFunction } from '../normal/DocumentFunction';
import { DocumentType } from './DocumentType';

export class DocumentReturn extends BaseDocField {
  constructor(symbol: Symbol, options: DocumentOptions) {
    options.parentSymbol ??= symbol;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbol, options);

    this.#assign(symbol);
  }

  #assign(symbol: Symbol): void {
    const returns = symbol?.getDeclarations()[0] as ReturnStatement;
    const parentNode = this.getCompatAncestorNode<FunctionDeclaration>(this.parentSymbol);
    const functionTypeNode = DocumentFunction.getFunctionTypeNode(parentNode);
    const returnTypeNode = functionTypeNode?.getReturnTypeNode();
    const returnCommentNode = this.tags?.find((t) => Node.isJSDocReturnTag(t.node))?.node as JSDocReturnTag;

    this.type = new DocumentType(returnTypeNode, this.getComputedOptions(), returnCommentNode);
    this.description = returnCommentNode?.getCommentText()?.replace(/(^\n)|(\n$)/g, '');
  }
}