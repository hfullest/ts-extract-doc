import {
  DocumentArray,
  DocumentBasic,
  DocumentClass,
  DocumentEnum,
  DocumentFunction,
  DocumentInterface,
  DocumentIntersection,
  DocumentObject,
  DocumentTuple,
  DocumentUnion,
} from './normal';
import { DocumentClassComponent, DocumentFunctionComponent } from './react';
import { DocumentOptions, SymbolOrOtherType } from './helper';
import defaultOptions from './defaultOptions';

/** 文档模型处理 handler */
export const DOCUMENT_HANDLES = [
  // 顺序不可随意调换
  DocumentFunctionComponent,
  DocumentClassComponent,
  DocumentInterface,
  DocumentClass,
  DocumentFunction,
  DocumentBasic,
  DocumentEnum,
  DocumentArray,
  DocumentTuple,
  DocumentIntersection,
  DocumentUnion,
  DocumentObject,
];

export type Document = InstanceType<(typeof DOCUMENT_HANDLES)[number]>;

/** 文档通用解析 */
export default function DocumentParser<D extends Document = Document>(
  symbolOrNodeOrType: SymbolOrOtherType,
  parseOptions = defaultOptions as DocumentOptions,
): D {
  const emptyDoc = {} as D;
  if (!((parseOptions.nestedLevel ?? 0) < (parseOptions.maxNestedLevel ?? 0))) return emptyDoc; // 超过嵌套深度强制跳出递归，不进行构造对象
  for (let handler of DOCUMENT_HANDLES) {
    if (!handler.isTarget(symbolOrNodeOrType)) continue;
    return new handler(symbolOrNodeOrType, { ...parseOptions }) as D;
  }
  return emptyDoc;
}
