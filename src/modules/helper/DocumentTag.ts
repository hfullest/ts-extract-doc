import { JSDocTag, Node, ts } from 'ts-morph';

export class DocumentTag {
  name: string;
  text: string;
  node: JSDocTag;
  parent: Node;

  constructor(tag: JSDocTag<ts.JSDocTag>) {
    this.name = tag.getTagName();
    this.text = tag.getCommentText();
    this.node = tag;
    this.parent = tag.getParent();
  }
}
