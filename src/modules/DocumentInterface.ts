import { DocumentKind } from '../interface';
import BaseDocField from './BaseDocField';
import DocumentFunction from './DocumentFunction';
import DocumentProp from './DocumentProp';

export default class DocumentInterface extends BaseDocField {
  kind: DocumentKind.Interface;
  /** 属性 */
  props: Record<string, DocumentProp>;
  /** 方法 */
  methods: Record<string, DocumentFunction>;
}
