import { FunctionDeclaration, Node, ReturnStatement, Symbol, ts } from 'ts-morph';
import BaseDocField from './BaseDocField';

export default class DocumentReturn extends BaseDocField {
  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.#assign(symbol);
  }

  #assign(symbol: Symbol): void {
    const returns = symbol?.getDeclarations()[0] as ReturnStatement;
    const parentNode = (this.parentSymbol?.getValueDeclaration() ??
      this.parentSymbol?.getDeclarations()[0]) as FunctionDeclaration;
    const functionTypeNode =
      parentNode?.getFirstDescendantByKind(ts.SyntaxKind.FunctionType) ??
      parentNode?.getFirstDescendantByKind(ts.SyntaxKind.JSDocFunctionType) ??
      parentNode?.getFirstDescendantByKind(ts.SyntaxKind.MethodSignature);
    const jsDoc = parentNode?.getJsDocs()[0];
    const jsDocTags = jsDoc?.getTags();
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
