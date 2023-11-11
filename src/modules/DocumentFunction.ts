import { PropertySignature, Symbol, ts, Node, FunctionDeclaration, FunctionExpression, ArrowFunction } from 'ts-morph';
import BaseDocField from './BaseDocField';
import DocumentReturn from './DocumentReturn';
import DocumentParameter from './DocumentParameter';

export default class DocumentFunction extends BaseDocField {
  /** 参数 */
  parameters: DocumentParameter[];
  /** 方法返回 */
  returns: DocumentReturn;

  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.#assign(symbol);
  }

  #assign(symbol: Symbol) {
    const prop = symbol?.getDeclarations()[0] as PropertySignature;
    const functionTypeNode =
      prop?.getFirstDescendantByKind(ts.SyntaxKind.FunctionType) ??
      prop?.getFirstDescendantByKind(ts.SyntaxKind.JSDocFunctionType) ??
      prop?.getFirstDescendantByKind(ts.SyntaxKind.MethodSignature);
    const parametersNode = functionTypeNode?.getParameters();
    this.parameters = parametersNode?.map(
      (parameter) => new DocumentParameter(parameter.getSymbol(), symbol, this.rootSymbol)
    );
    const returnTypeNode = functionTypeNode.getReturnTypeNode();
    this.returns = new DocumentReturn(returnTypeNode?.getSymbol(), symbol, this.rootSymbol);
  }

  static isTarget(node: Node): node is FunctionDeclaration | FunctionExpression | ArrowFunction {
    if (Node.isFunctionDeclaration(node)) return true;
    const variableDeclaration = node?.asKind(ts.SyntaxKind.VariableDeclaration);
    const functionInitializer = variableDeclaration?.getInitializerIfKind(ts.SyntaxKind.FunctionExpression);
    const arrowFunctionInitializer = variableDeclaration?.getInitializerIfKind(ts.SyntaxKind.ArrowFunction);
    return Node.isFunctionExpression(functionInitializer) || Node.isArrowFunction(arrowFunctionInitializer);
  }
}
