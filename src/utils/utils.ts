import { ts, Symbol, Node } from 'ts-morph';

/** 是否为ts类型，type、interface、namespace */
export const isTypesKind = (symbol: Symbol) => {
  return [ts.SymbolFlags.Interface, ts.SymbolFlags.Type, ts.SymbolFlags.Namespace].some((f) => f === symbol.getFlags());
};

export const isFunctionKind = (symbol: Symbol) => {
  const node = symbol.getValueDeclaration();
  if (Node.isFunctionDeclaration(node)) return true;
  const variableDeclaration = node?.asKind(ts.SyntaxKind.VariableDeclaration);
  const functionInitializer = variableDeclaration?.getInitializerIfKind(ts.SyntaxKind.FunctionExpression);
  const arrowFunctionInitializer = variableDeclaration?.getInitializerIfKind(ts.SyntaxKind.ArrowFunction);
  return Node.isFunctionExpression(functionInitializer) || Node.isArrowFunction(arrowFunctionInitializer);
};

export const isClassKind = (symbol: Symbol) => {
  const node = symbol.getValueDeclaration();
  if (Node.isClassDeclaration(node)) return true;
  const variableDeclaration = node?.asKind(ts.SyntaxKind.VariableDeclaration);
  const initializer = variableDeclaration?.getInitializerIfKind(ts.SyntaxKind.ClassExpression);
  return Node.isClassExpression(initializer);
};

export const isJSXComponentKind = (symbol: Symbol) => {
  return false; // TODO: 增加react 函数组件判断
};

export const isClassComponentKind = (symbol: Symbol) => {
  return false; // TODO: 增加react 类组件判断
};
