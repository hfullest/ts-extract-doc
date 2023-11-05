import { FunctionDeclaration, Symbol, ts } from 'ts-morph';
import { Document } from '../interface';

/** 从函数中提取文档 */
export const collectDocFromFunction = (symbol: Symbol): Document | null => {
  const functionNode = symbol?.getValueDeclaration() as FunctionDeclaration;

  // functionNode.getJsDocs();

  console.log('collectDocFromFunction:', symbol.getName());
  return null;
};
