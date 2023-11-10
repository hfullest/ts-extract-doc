import { DocumentParameter, DocumentReturn } from '../interface';
import BaseDocField from './BaseDocField';

export default class DocumentFunction extends BaseDocField {
  /** 参数 */
  parameters: DocumentParameter[];
  /** 方法返回 */
  returns: DocumentReturn;
}
