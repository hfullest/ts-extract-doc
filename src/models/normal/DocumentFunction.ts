import {
  Symbol as TsSymbol,
  ts,
  Node,
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunction,
  VariableDeclaration,
} from 'ts-morph';
import { BaseDocField, DocumentReturn, DocumentParameter, DocumentOptions, SymbolOrOtherType } from '../helper';

export class DocumentFunction extends BaseDocField {
  /** 参数 */
  parameters?: DocumentParameter[];
  /** 方法返回 */
  returns?: DocumentReturn;

  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    options.$parentSymbol ??= symbol;
    options.$rootSymbol ??= options?.$parentSymbol;
    super(symbolOrOther, options);

    this.#assign(symbolOrOther);
  }

  #assign(symbolOrOther: SymbolOrOtherType) {
    const { symbol, node } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    const functionTypeNode = DocumentFunction.getFunctionTypeNode(node!);
    const parametersNode = (functionTypeNode as FunctionDeclaration)?.getParameters();
    this.parameters = parametersNode?.map(
      (parameter, index) =>
        new DocumentParameter(parameter.getSymbol()!, {
          ...this.$options,
          $parentSymbol: symbol,
          $rootSymbol: this.rootSymbol,
          $index: index,
          $parent: this,
        }),
    );
    const returnTypeNode = (functionTypeNode as FunctionDeclaration)?.getReturnTypeNode(); // 如果指定了函数返回类型
    const returnSubstitionType = functionTypeNode?.getType()?.getCallSignatures()[0]?.getReturnType(); // 从返回类型推导
    const returnSymbolOrOther = returnTypeNode ?? returnSubstitionType;
    this.returns = new DocumentReturn(returnSymbolOrOther!, {
      ...this.$options,
      $parentSymbol: symbol,
      $rootSymbol: this.rootSymbol,
      $parent: this,
    });
  }

  /** 根据节点获取子级函数类型节点的通用方法 */
  static getFunctionTypeNode(node: Node) {
    const functionTypeNode =
      node?.asKind?.(ts.SyntaxKind.FunctionDeclaration) ??
      node?.asKind?.(ts.SyntaxKind.FunctionExpression) ??
      node?.asKind?.(ts.SyntaxKind.ArrowFunction) ??
      node?.asKind?.(ts.SyntaxKind.FunctionType) ??
      node?.asKind?.(ts.SyntaxKind.JSDocFunctionType) ??
      node?.asKind?.(ts.SyntaxKind.MethodSignature) ??
      node?.getLastChildByKind?.(ts.SyntaxKind.FunctionType) ??
      node?.getLastChildByKind?.(ts.SyntaxKind.JSDocFunctionType) ??
      node?.getLastChildByKind?.(ts.SyntaxKind.MethodSignature) ??
      node?.getLastChildByKind?.(ts.SyntaxKind.FunctionExpression) ??
      node?.getLastChildByKind?.(ts.SyntaxKind.ArrowFunction);
    return functionTypeNode;
  }

  /** 根据symbol获取子级可能的函数节点 */
  static getFunctionTypeNodeBySymbol(symbol: TsSymbol) {
    const node = BaseDocField.getCompatAncestorNode(symbol);
    const functionTypeNode = DocumentFunction.getFunctionTypeNode(node);
    return functionTypeNode;
  }

  static [Symbol.hasInstance] = (instance: any) => Object.getPrototypeOf(instance).constructor === this;

  static isTarget(
    nodeOrOther: SymbolOrOtherType,
  ): nodeOrOther is FunctionDeclaration | FunctionExpression | ArrowFunction {
    const { node } = BaseDocField.splitSymbolNodeOrType(nodeOrOther);
    if (
      Node.isFunctionDeclaration(node) ||
      Node.isFunctionExpression(node) ||
      Node.isArrowFunction(node) ||
      Node.isFunctionTypeNode(node)
    )
      return true;
    const variableDeclaration = node?.asKind(ts.SyntaxKind.VariableDeclaration);
    const functionInitializer = (variableDeclaration as VariableDeclaration)?.getInitializerIfKind(
      ts.SyntaxKind.FunctionExpression,
    );
    const arrowFunctionInitializer = (variableDeclaration as VariableDeclaration)?.getInitializerIfKind(
      ts.SyntaxKind.ArrowFunction,
    );
    return Node.isFunctionExpression(functionInitializer) || Node.isArrowFunction(arrowFunctionInitializer);
  }
}
