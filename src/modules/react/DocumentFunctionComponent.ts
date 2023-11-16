import { Node, Symbol, ts } from 'ts-morph';
import BaseDocField from '../BaseDocField';
import DocumentFunction from '../DocumentFunction';

export default class DocumentFunctionComponent extends BaseDocField {
  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.#assign(symbol);
  }

  #assign(symbol: Symbol) {}

  static isTarget(node: Node) {
    debugger;
    const functionTypeNode = DocumentFunction.getFunctionTypeNodeBySymbol(node?.getSymbol());
    if (!DocumentFunction.isTarget(functionTypeNode)) return false;
    const type = functionTypeNode.getReturnType();
    //TODO: 这里需要递归判断return
    type.getAliasSymbol()
    type.getFlags()
   const node1= functionTypeNode.getReturnTypeNode();
    const descendant  = functionTypeNode?.forEachDescendantAsArray();
    const returnStatement = functionTypeNode?.getFirstDescendantByKind(ts.SyntaxKind.ReturnStatement);
    const jsxElement = returnStatement?.getFirstDescendantByKind(ts.SyntaxKind.JsxElement);
    return Node.isJsxElement(jsxElement);
  }
}
