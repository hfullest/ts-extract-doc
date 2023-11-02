import { Symbol } from 'ts-morph';
import { Document } from '../interface';

/** 从ts类型中提取文档 */
export const collectDocFromType = (symbol: Symbol): Document |null => {
  console.log('collectDocFromType:',symbol.getName())
  return null;
};
