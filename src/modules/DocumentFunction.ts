import { Symbol, ts, Node, FunctionDeclaration, FunctionExpression, ArrowFunction } from 'ts-morph';
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
    const node = symbol?.getDeclarations()[0];
    const functionTypeNode = DocumentFunction.getFunctionTypeNode(node);
    const parametersNode = functionTypeNode?.getParameters();
    this.parameters = parametersNode?.map(
      (parameter) => new DocumentParameter(parameter.getSymbol(), symbol, this.rootSymbol)
    );
    const returnTypeNode = functionTypeNode.getReturnTypeNode();
    this.returns = new DocumentReturn(returnTypeNode?.getSymbol(), symbol, this.rootSymbol);
  }

  /** 根据节点获取子级函数类型节点的通用方法 */
  static getFunctionTypeNode(node: Node) {
    const functionTypeNode =
      node?.asKind?.(ts.SyntaxKind.FunctionDeclaration) ??
      node?.asKind?.(ts.SyntaxKind.FunctionExpression) ??
      node?.asKind?.(ts.SyntaxKind.ArrowFunction) ??
      node?.getFirstDescendantByKind?.(ts.SyntaxKind.FunctionType) ??
      node?.getFirstDescendantByKind?.(ts.SyntaxKind.JSDocFunctionType) ??
      node?.getFirstDescendantByKind?.(ts.SyntaxKind.MethodSignature) ??
      node?.getFirstDescendantByKind?.(ts.SyntaxKind.FunctionExpression) ??
      node?.getFirstDescendantByKind?.(ts.SyntaxKind.ArrowFunction);
    return functionTypeNode;
  }

  /** 根据symbol获取子级可能的函数节点 */
  static getFunctionTypeNodeBySymbol(symbol: Symbol) {
    const node = BaseDocField.getCompatAncestorNode(symbol);
    const functionTypeNode = DocumentFunction.getFunctionTypeNode(node);
    return functionTypeNode;
  }

  static isTarget(node: Node): node is FunctionDeclaration | FunctionExpression | ArrowFunction {
    if (Node.isFunctionDeclaration(node) || Node.isFunctionExpression(node) || Node.isArrowFunction(node)) return true;
    const variableDeclaration = node?.asKind(ts.SyntaxKind.VariableDeclaration);
    const functionInitializer = variableDeclaration?.getInitializerIfKind(ts.SyntaxKind.FunctionExpression);
    const arrowFunctionInitializer = variableDeclaration?.getInitializerIfKind(ts.SyntaxKind.ArrowFunction);
    return Node.isFunctionExpression(functionInitializer) || Node.isArrowFunction(arrowFunctionInitializer);
  }
}
