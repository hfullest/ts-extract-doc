import { Symbol, Type } from 'ts-morph';
import {
  DocumentClass,
  DocumentEnum,
  DocumentFunction,
  DocumentInterface,
  DocumentObject,
  DocumentTypeAlias,
} from './normal';
import { DocumentClassComponent, DocumentFunctionComponent } from './react';
import { DocumentOptions, DocumentType } from './helper';
import defaultOptions from './defaultOptions';

export type Document =
  | DocumentObject
  | DocumentEnum
  | DocumentTypeAlias
  | DocumentInterface
  | DocumentFunction
  | DocumentClass
  | DocumentFunctionComponent
  | DocumentClassComponent
  | DocumentType;

class DocumentHandle {
  constructor(symbolOrType: Symbol | Type, parseOptions: DocumentOptions = defaultOptions as DocumentOptions) {
    this.#parseOptions = parseOptions;
    Object.assign(this, this.#handleType(symbolOrType));
  }

  #parseOptions = {} as DocumentOptions;

  #handleType(symbolOrType: Symbol | Type) {
    const parseOptions = this.#parseOptions;
    const type = (symbolOrType instanceof Symbol ? undefined : symbolOrType) as Type;
    const symbol = (symbolOrType instanceof Symbol ? symbolOrType : undefined) as Symbol;
    const node = symbol?.getValueDeclaration?.() ?? symbol?.getDeclarations?.()[0];
    if (DocumentFunctionComponent.isTarget(node)) return new DocumentFunctionComponent(symbol, parseOptions);
    if (DocumentClassComponent.isTarget(node)) return new DocumentClassComponent(symbol, parseOptions);
    if (DocumentInterface.isTarget(node)) return new DocumentInterface(symbol, parseOptions);
    if (DocumentClass.isTarget(node)) return new DocumentClass(symbol, parseOptions);
    if (DocumentFunction.isTarget(node)) return new DocumentFunction(symbol, parseOptions);
    if (DocumentObject.isTarget(node)) return new DocumentObject(symbol, parseOptions);
    if (DocumentEnum.isTarget(node)) return new DocumentEnum(symbol, parseOptions);
    if (DocumentTypeAlias.isTarget(node)) return new DocumentTypeAlias(symbol, parseOptions);
    return new DocumentType(type, this.#parseOptions); // 兜底
  }
}

/** 文档通用解析 */
export default function DocumentParser(...args: ConstructorParameters<typeof DocumentHandle>): Document {
  const document = new DocumentHandle(...args);
  return document as unknown as Document;
}
