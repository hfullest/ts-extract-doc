import { Symbol } from 'ts-morph';
import { Document } from '../interface';

/** 从React函数组件中提取文档 */
export const collectDocFromFCComponent = (symbol: Symbol): Document|null => {
  console.log('collectDocFromFCComponent:', symbol.getName());
  return null;
};