import { FunctionDeclaration, Symbol, ts } from 'ts-morph';
import { Document } from '../interface';

/** 从函数中提取文档 */
export const collectDocFromFunction = (symbol: Symbol): Document | null => {
  const functionDeclaration = symbol?.getValueDeclaration() as FunctionDeclaration;
  const functionNode =
    functionDeclaration?.getFirstDescendantByKind(ts.SyntaxKind.FunctionDeclaration) ??
    functionDeclaration?.getFirstDescendantByKind(ts.SyntaxKind.FunctionExpression) ??
    functionDeclaration?.getFirstDescendantByKind(ts.SyntaxKind.ArrowFunction);

  // functionNode.getJsDocs();

  console.log('collectDocFromFunction:', symbol.getName());
  return null;
};
