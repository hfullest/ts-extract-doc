import { Node, Symbol, Type } from 'ts-morph';
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
import { BaseDocField, DocumentOptions } from './helper';
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

class DocumentHandle {
  constructor(symbolOrType: Symbol | Type, parseOptions: DocumentOptions = defaultOptions as DocumentOptions) {
    if (!((parseOptions.nestedLevel ?? 0) < (parseOptions.maxNestedLevel ?? 0))) {
      return {} as DocumentHandle; // 超过嵌套深度强制跳出递归，不进行构造对象
    }
    this.#parseOptions = parseOptions;
    Object.assign(this, this.#handleType(symbolOrType));
  }

  #parseOptions = {} as DocumentOptions;

  #handleType(symbolOrType: Symbol | Type) {
    const parseOptions = this.#parseOptions;
    const { symbol, node, type } = BaseDocField.splitSymbolNodeOrType(symbolOrType);
    for (let handler of DOCUMENT_HANDLES) {
      if (handler.isTarget((node ?? type) as Node)) return new handler(symbol!, parseOptions);
    }
  }
}

/** 文档通用解析 */
export default function DocumentParser(...args: ConstructorParameters<typeof DocumentHandle>): Document {
  const document = new DocumentHandle(...args);
  return document as unknown as Document;
}
