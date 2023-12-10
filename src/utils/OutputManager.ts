import { Document } from '../models';

/** 文档输出管理器 */
class OutputManager {
  #documents: Document[] = [];

  /** 前置队列 */
  #beforeQueue: Document[] = [];
  /** 后置队列 */
  #afterQueue: Document[] = [];

  /** 添加文档 */
  public append(doc: Document) {
    if (!doc) return;
    const docs = [...this.#beforeQueue, doc, ...this.#afterQueue].filter(Boolean);
    this.#documents.push(...docs);
    this.#beforeQueue = [];
    this.#afterQueue = [];
    docs.forEach((it) => !this.hasDocReference(it.filePath!, it.id!) && this.setDocReference(it, it.id));
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
  /** 排队等待到下次触发`append`之前插入 */
  public enqueueForBeforeAppend(doc: Document | Document[]) {
    const docs = Array.isArray(doc) ? doc : [doc];
    this.#beforeQueue.push(...docs);
    return this;
  }
  /** 排队等待到下次触发`append`之后插入 */
  public enqueueForAfterAppend(doc: Document | Document[]) {
    const docs = Array.isArray(doc) ? doc : [doc];
    this.#afterQueue.push(...docs);
    return this;
  }
  /** 获取文档 */
  public getDocs(): Document[] {
    return Array.from(this.#documents);
  }

  /** 清空文档管理 */
  public clear() {
    this.#documents = [];
    this.#beforeQueue = [];
    this.#afterQueue = [];
    return this;
  }

  /** 设置文档引用 */
  public setDocReference(doc: Document, key?: string) {
    const filePath = doc?.filePath;
    if (!filePath) return;
    const id = key?.toString() ?? doc?.getId();
    if (!id) return;
    const docReferences = OutputManager.DocReferences;
    if (!docReferences[filePath]) {
      docReferences[filePath] = new Map();
    }
    const bucket = docReferences[filePath];
    bucket.set(id, doc);
  }

  /** 获取文档引用 */
  public getDocReference(docOrFilePath: string | Document, id?: string): [string, Document][] {
    if (!docOrFilePath) return [];
    const filePath = typeof docOrFilePath === 'string' ? docOrFilePath : docOrFilePath?.filePath;
    const docReferencesMap = OutputManager.DocReferences[filePath!];
    if (!id) return Array.from(docReferencesMap?.entries() ?? []);
    const target = docReferencesMap?.get?.(id!);
    const references = target ? [[id, target]] : [];
    return references as [string, Document][];
  }

  /** 判断是否以存在文档引用 */
  public hasDocReference(docOrFilePath: string | Document, id: string) {
    return !!this.getDocReference(docOrFilePath, id).length;
  }

  static DocReferences: Record<string, Map<string, Document>> = {};
}

export default new OutputManager();
