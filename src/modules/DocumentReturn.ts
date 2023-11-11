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
    const parentNode = (this.parentSymbol?.getValueDeclaration() ??
      this.parentSymbol?.getDeclarations()[0]) as FunctionDeclaration;
    const ancestorNode = Node.isVariableDeclaration(parentNode)
      ? parentNode.getFirstAncestorByKind(ts.SyntaxKind.VariableStatement) // VariableDeclaration 节点获取不到文档，需要获取到其祖先级 VariableStatement 才可以获取到
      : parentNode;
    const jsDoc = ancestorNode?.getJsDocs?.()[0];
    const jsDocTags = jsDoc?.getTags();
    const functionTypeNode = DocumentFunction.getFunctionTypeNode(parentNode);
    const returnTypeNode = functionTypeNode?.getReturnTypeNode();
    const returnCommentNode = jsDocTags?.find((t) => Node.isJSDocReturnTag(t));

    this.type = {
      name: returnTypeNode?.getText() ?? returnCommentNode?.getType()?.getText(),
      value: returns?.getType()?.getLiteralValue(),
      raw: returns?.getText(),
    };
    this.description = returnCommentNode?.getCommentText()?.replace(/(^\n)|(\n$)/g, '');
  }
}
