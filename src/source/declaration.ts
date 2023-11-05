import { Symbol } from 'ts-morph';
import { Document } from '../interface';

/** 从ts类型中提取文档 */
export const collectDocFromDeclaration = (symbol: Symbol): Document |null => {
  console.log('collectDocFromDeclaration:',symbol.getName())
  return null;
};
