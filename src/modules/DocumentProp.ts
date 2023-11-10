import { ts } from 'ts-morph';
import BaseDocField from './BaseDocField';

export default class DocumentProp extends BaseDocField {
  /** 是否可选  */
  isOptional: boolean;
  type: DocumentType;
  defaultValue: any;
  parent: Node;
  /** 属性或方法修饰符，用于类，比如`private` */
  modifiers: ts.ModifierFlags;
}
