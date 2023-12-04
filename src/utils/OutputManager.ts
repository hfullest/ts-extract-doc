import { Document } from '../models';

/** 文档输出管理器 */
class OutputManager {
  #documents = [] as Document[];

  #queue = [] as Document[];

  /** 添加文档 */
  public append(doc: Document) {
    if (!doc) return;
    this.#documents.push(doc);
    return this;
  }
  /** 在某个文档前插入，如果没有找到目标文档则插入失败*/
  public insertBefore(currentDocs: Document | Document[], targetDoc: Document) {
    const targetIndex = this.#documents.findIndex((it) => Object.is(it, targetDoc));
    if (targetIndex < 0) return;
    const docs = Array.isArray(currentDocs) ? currentDocs : [currentDocs];
    this.#documents.splice(targetIndex, 0, ...docs);
    return this;
  }
  /** 在某个文档后插入，如果没有找到目标文档则插入失败*/
  public insertAfter(currentDocs: Document | Document[], targetDoc: Document) {
    const targetIndex = this.#documents.findIndex((it) => Object.is(it, targetDoc));
    if (targetIndex < 0) return;
    const docs = Array.isArray(currentDocs) ? currentDocs : [currentDocs];
    this.#documents.splice(targetIndex + 1, 0, ...docs);
    return this;
  }
  //TODO:
  /** 排队等待插入到下次触发`insertBefore` */
  public enqueueForAppend(doc: Document) {
    this.#queue.push(doc);
    return this;
  }
  /** 排队等待插入到下次触发`insertBefore` */
  public enqueueForInsertBefore() {}
  /** 获取文档 */
  public getDocs(): Document[] {
    return Array.from(this.#documents);
  }
}

export default new OutputManager();
