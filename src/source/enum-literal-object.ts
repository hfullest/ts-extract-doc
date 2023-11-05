import { Symbol } from 'ts-morph';
import { Document } from '../interface';

/** 从枚举、字面量中提取文档 */
export const collectDocFromEnumOrLiteral = (symbol: Symbol): Document | null => {
  console.log('collectDocFromEnumOrLiteral:', symbol.getName());
  return null;
};
