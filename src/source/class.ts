import { Symbol } from 'ts-morph';
import { Document } from '../interface';

/** 从类中提取文档 */
export const collectDocFromClass = (symbol: Symbol): Document|null => {
  console.log('collectDocFromClass:',symbol.getName())
  return null;
};