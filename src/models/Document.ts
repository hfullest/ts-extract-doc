import { Node, Symbol, Type } from 'ts-morph';
import {
  DocumentBasic,
  DocumentClass,
  DocumentEnum,
  DocumentFunction,
  DocumentInterface,
  DocumentIntersection,
  DocumentObject,
  DocumentUnion,
} from './normal';
import { DocumentClassComponent, DocumentFunctionComponent } from './react';
import { DocumentOptions } from './helper';
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
  DocumentObject,
  DocumentEnum,
  DocumentIntersection,
  DocumentUnion,
];

export type Document = InstanceType<(typeof DOCUMENT_HANDLES)[number]>;

class DocumentHandle {
  constructor(symbolOrType: Symbol | Type, parseOptions: DocumentOptions = defaultOptions as DocumentOptions) {
    this.#parseOptions = parseOptions;
    Object.assign(this, this.#handleType(symbolOrType));
  }

  #parseOptions = {} as DocumentOptions;

  #handleType(symbolOrType: Symbol | Type) {
    const parseOptions = this.#parseOptions;
    const type = symbolOrType instanceof Type ? symbolOrType : null;
    const symbol = symbolOrType instanceof Symbol ? symbolOrType : null;
    const node = symbol?.getValueDeclaration?.() ?? symbol?.getDeclarations?.()[0];

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
