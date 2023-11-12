import { FunctionDeclaration, Node, ReturnStatement, Symbol, ts } from 'ts-morph';
import BaseDocField from './BaseDocField';
import DocumentFunction from './DocumentFunction';

export default class DocumentReturn extends BaseDocField {
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

    this.type = {
      name: returnTypeNode?.getText() ?? returnCommentNode?.getType()?.getText(),
      value: returns?.getType()?.getLiteralValue(),
      raw: returns?.getText(),
    };
    this.description = returnCommentNode?.getCommentText()?.replace(/(^\n)|(\n$)/g, '');
  }
}
