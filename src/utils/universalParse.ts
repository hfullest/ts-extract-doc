import { Symbol } from 'ts-morph';
import { DocumentInterface, DocumentClass, DocumentFunction, DocumentTypeAlias } from '../modules';

/** 通用解析，能对所有类型(已定义类型)进行解析 */
export default function universalParse(symbol: Symbol) {
  const node = symbol?.getValueDeclaration() ?? symbol?.getDeclarations()[0];
  if (DocumentInterface.isTarget(node)) return new DocumentInterface(symbol);
  if (DocumentClass.isTarget(node)) return new DocumentClass(symbol);
  if (DocumentFunction.isTarget(node)) return new DocumentFunction(symbol);
  if (DocumentTypeAlias.isTarget(node)) return new DocumentTypeAlias(symbol);
}
