import { Symbol, ts, Node, FunctionDeclaration, FunctionExpression, ArrowFunction } from 'ts-morph';
import { BaseDocField, DocumentReturn, DocumentParameter, DocumentOptions } from '../helper';

export class DocumentFunction extends BaseDocField {
  /** 参数 */
  parameters: DocumentParameter[];
  /** 方法返回 */
  returns: DocumentReturn;

  constructor(symbol: Symbol, options: DocumentOptions) {
    options.parentSymbol ??= symbol;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbol, options);
    this.#options = options;

    this.#assign(symbol);
  }

  #options: DocumentOptions;

  #assign(symbol: Symbol) {
    const node = symbol?.getDeclarations()[0];
    const functionTypeNode = DocumentFunction.getFunctionTypeNode(node);
    const parametersNode = functionTypeNode?.getParameters();
    this.parameters = parametersNode?.map(
      (parameter) =>
        new DocumentParameter(parameter.getSymbol(), {
          ...this.#options,
          parentSymbol: symbol,
          rootSymbol: this.rootSymbol,
        })
    );
    const returnTypeNode = functionTypeNode.getReturnTypeNode();
    const returnSubstitionType = functionTypeNode
      ?.getType()
      ?.getCallSignatures()[0]
      ?.compilerSignature?.getReturnType();
    this.returns = new DocumentReturn(returnTypeNode?.getSymbol(), {
      ...this.#options,
      parentSymbol: symbol,
      rootSymbol: this.rootSymbol,
    });
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