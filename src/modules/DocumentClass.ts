import DocumentInterface from './DocumentInterface';
import DocumentMethod from './DocumentMethod';
import DocumentProp from './DocumentProp';

export default class DocumentClass extends DocumentInterface {
  /** 构造函数文档 */
  constructors: DocumentMethod;
  /** 静态属性 */
  staticProps: Record<string, DocumentProp>;
  /** 静态方法 */
  staticMethods: Record<string, DocumentMethod>;
}
