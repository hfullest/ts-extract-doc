import { Symbol } from 'ts-morph';
import {
  DocumentInterface,
  DocumentClass,
  DocumentFunction,
  DocumentTypeAlias,
  DocumentObject,
  DocumentFunctionComponent,
  DocumentClassComponent,
  DocumentEnum,
  defaultDocumentOptions,
  DocumentOptions,
} from '../modules';

/** 通用解析，能对所有类型(已定义类型)进行解析 */
export default function universalParse(
  symbol: Symbol,
  parseOptions: DocumentOptions = defaultDocumentOptions as DocumentOptions
) {
  const node = symbol?.getValueDeclaration() ?? symbol?.getDeclarations()[0];
  if (DocumentFunctionComponent.isTarget(node)) return new DocumentFunctionComponent(symbol, parseOptions);
  if (DocumentClassComponent.isTarget(node)) return new DocumentClassComponent(symbol, parseOptions);
  if (DocumentInterface.isTarget(node)) return new DocumentInterface(symbol, parseOptions);
  if (DocumentClass.isTarget(node)) return new DocumentClass(symbol, parseOptions);
  if (DocumentFunction.isTarget(node)) return new DocumentFunction(symbol, parseOptions);
  if (DocumentObject.isTarget(node)) return new DocumentObject(symbol, parseOptions);
  if (DocumentEnum.isTarget(node)) return new DocumentEnum(symbol, parseOptions);
  if (DocumentTypeAlias.isTarget(node)) return new DocumentTypeAlias(symbol, parseOptions);
}
