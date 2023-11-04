import { Symbol, ts } from 'ts-morph';
import { Document } from '../interface';

/** 从函数中提取文档 */
export const collectDocFromFunction = (symbol: Symbol): Document | null => {
  const valueDeclaration = symbol.getValueDeclaration();
  const FunctionNode =
    valueDeclaration?.getFirstChildByKind(ts.SyntaxKind.FunctionDeclaration) ?? //TODO: 这里有问题
    valueDeclaration?.getFirstChildByKind(ts.SyntaxKind.ArrowFunction);
  console.log('collectDocFromFunction:', symbol.getName());
  return null;
};
