import { JSDocTag, Node, ts } from 'ts-morph';
import { JSDocCustomTagEnum, JSDocTagEnum } from '../../utils/jsDocTagDefinition';

export class DocumentTag {
  name!: JSDocTagEnum | JSDocCustomTagEnum | `${JSDocCustomTagEnum}` | `${JSDocTagEnum}`;
  text?: string;
  node?: JSDocTag;
  parent?: Node;

  constructor(tag: JSDocTag<ts.JSDocTag>) {
    this.name = tag?.getTagName() as typeof this.name;
    this.text = tag?.getCommentText();
    this.node = tag;
    this.parent = tag?.getParent?.();
  }
}

export class DocumentJSDocTag {
  /** 标签名称 */
  name!: keyof typeof JSDocTagEnum;
  /** 标签内容 */
  text?: string;
  /** 全文本 */
  fullText?: string;

  constructor(tag: JSDocTag<ts.JSDocTag>) {
    const name = tag.getTagName() as keyof typeof JSDocTagEnum;
    if (JSDocTagEnum[name] === void 0) return;
    this.name = name as keyof typeof JSDocTagEnum;
    this.text = tag?.getCommentText();
    this.fullText = tag?.getFullText();
  }
}
