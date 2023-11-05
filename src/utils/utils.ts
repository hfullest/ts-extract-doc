import {
  ts,
  Symbol,
  Node,
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunction,
  ClassDeclaration,
  ClassExpression,
  MethodDeclaration,
} from 'ts-morph';

export type FunctionNodeDeclaration = FunctionDeclaration | FunctionExpression | ArrowFunction | MethodDeclaration;

/** 是否为枚举、字面量变量、字面量对象 */
export const isEnumOrLiteralOrRecordKind = (symbol: Symbol) => {
  const node = symbol?.getValueDeclaration();
  if (node?.asKind(ts.SyntaxKind.EnumDeclaration)) return Node.isEnumDeclaration(node);
  const recordVarDeclaration = node?.asKind(ts.SyntaxKind.VariableDeclaration);
  const expression = recordVarDeclaration?.getInitializer();
  return Node.isObjectLiteralExpression(expression) || Node.isLiteralExpression(expression);
};

/** 是否为ts类型，type、interface、namespace */
export const isDeclarationKind = (symbol: Symbol) => {
  const node = symbol?.getDeclarations()[0];
  return Node.isTypeAliasDeclaration(node) || Node.isInterfaceDeclaration(node) || Node.isModuleDeclaration(node);
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

export const isJSXFunction = (functionNode: FunctionNodeDeclaration): functionNode is FunctionNodeDeclaration => {
  const returnStatement = functionNode?.getStatementByKind(ts.SyntaxKind.ReturnStatement);
  const jsxStatement =
    returnStatement?.getFirstChildByKind(ts.SyntaxKind.JsxElement) ??
    returnStatement?.getFirstChildByKind(ts.SyntaxKind.JsxFragment) ??
    returnStatement?.getFirstChildByKind(ts.SyntaxKind.JsxSelfClosingElement);
  return (
    Node.isJsxElement(jsxStatement) || Node.isJsxSelfClosingElement(jsxStatement) || Node.isJsxFragment(jsxStatement)
  );
};

export const isFCComponentKind = (
  symbol: Symbol,
  targetDeclaration: ts.SyntaxKind.VariableDeclaration | ts.SyntaxKind.PropertyDeclaration = ts.SyntaxKind
    .VariableDeclaration
) => {
  if (!symbol) return false;
  const node = symbol.getValueDeclaration();
  let functionNode: FunctionNodeDeclaration = node as FunctionDeclaration;
  if (!Node.isFunctionDeclaration(node)) {
    const variableDeclaration = node?.asKind(targetDeclaration);
    const functionInitializer = variableDeclaration?.getInitializerIfKind(ts.SyntaxKind.FunctionExpression);
    const arrowFunctionInitializer = variableDeclaration?.getInitializerIfKind(ts.SyntaxKind.ArrowFunction);
    functionNode = functionInitializer ?? arrowFunctionInitializer;
  }
  return isJSXFunction(functionNode);
};

export const isClassComponentKind = (symbol: Symbol) => {
  const node = symbol?.getValueDeclaration();
  let classNode: ClassDeclaration | ClassExpression = node as ClassDeclaration;
  if (!Node.isClassDeclaration(node)) {
    const variableDeclaration = node?.asKind(ts.SyntaxKind.VariableDeclaration);
    const classInitializer = variableDeclaration?.getInitializerIfKind(ts.SyntaxKind.ClassExpression);
    classNode = classInitializer;
  }
  const renderMemberDeclaration = classNode?.getMember('render');
  if (renderMemberDeclaration?.asKind(ts.SyntaxKind.PropertyDeclaration)) {
    return isFCComponentKind(renderMemberDeclaration?.getSymbol(), ts.SyntaxKind.PropertyDeclaration);
  } else if (renderMemberDeclaration?.asKind(ts.SyntaxKind.MethodDeclaration)) {
    return isJSXFunction(renderMemberDeclaration as MethodDeclaration);
  }
  return false;
};
