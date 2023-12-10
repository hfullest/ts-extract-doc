import { JSDocReturnTag, Node } from 'ts-morph';
import { BaseDocField, DocumentOptions } from './BaseDocField';
import { Document, DocumentParser, SymbolOrOtherType } from '../index';

export class DocumentReturn extends BaseDocField {
  /** 文档类型 */
  type: Document | null = null;
  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    options.$parentSymbol ??= symbol;
    options.$rootSymbol ??= options?.$parentSymbol;
    super(symbolOrOther, options);

    this.#assign(symbolOrOther);
  }

  #assign(symbolOrOther: SymbolOrOtherType): void {
    this.type = DocumentParser(symbolOrOther, { ...this.$options, $parent: this.parent });
    const returnCommentNode = this.tags?.find((t) => Node.isJSDocReturnTag(t.node))?.node as JSDocReturnTag;
    this.description = returnCommentNode?.getCommentText()?.replace(/(^\n)|(\n$)/g, '');
  }
}
