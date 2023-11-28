import { FunctionDeclaration, JSDocReturnTag, Node, Symbol, ts } from 'ts-morph';
import { BaseDocField, DocumentOptions } from './BaseDocField';
import { DocumentFunction } from '../normal/DocumentFunction';
import { DocumentType } from './DocumentType';

export class DocumentReturn extends BaseDocField {
  constructor(symbol: Symbol, options: DocumentOptions) {
    options.parentSymbol ??= symbol;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbol, options);

    this.#options = options;

    this.#assign(symbol);
  }

  #options = {} as DocumentOptions;

  #assign(symbol: Symbol): void {
    const parentNode = this.getCompatAncestorNode<FunctionDeclaration>(this.parentSymbol);
    const functionTypeNode = DocumentFunction.getFunctionTypeNode(parentNode);
    const returnTypeNode = (functionTypeNode as FunctionDeclaration)?.getReturnTypeNode();
    const returnCommentNode = this.tags?.find((t) => Node.isJSDocReturnTag(t.node))?.node as JSDocReturnTag;
    const returnSubstitionType = functionTypeNode?.getType()?.getCallSignatures()[0]?.getReturnType();
    const returnSubstitionNode = returnSubstitionType?.getSymbol()?.getDeclarations?.()[0] as Node<ts.TypeNode>;
    this.type = new DocumentType(returnTypeNode ?? returnSubstitionNode, this.#options, returnCommentNode);
    this.description = returnCommentNode?.getCommentText()?.replace(/(^\n)|(\n$)/g, '');
  }
}