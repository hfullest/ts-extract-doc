import { Symbol } from 'ts-morph';
import { Document } from '../interface';

/** 从React类组件中提取文档 */
export const collectDocFromClassComponent = (symbol: Symbol): Document | null => {
  console.log('collectDocFromClassComponent:', symbol.getName());
  return null;
};
