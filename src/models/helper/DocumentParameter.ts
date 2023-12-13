import { JSDocParameterTag, Node, ParameterDeclaration, Symbol } from 'ts-morph';
import { BaseDocField, DocumentOptions } from './BaseDocField';
import { Document, DocumentParser } from '../index';
import { JSDocTagEnum } from '../../utils/jsDocTagDefinition';

export class DocumentParameter extends BaseDocField {
  /** 是否可选  */
  isOptional?: boolean;
  /** 默认值 */
  defaultValue: any;
  /** 属性方法的索引顺序，可以用来指定文档输出顺序 */
  index: number = 0;
  /** 文档类型 */
  type: Document | null = null;
  /** 是否只读 */
  readonly?: boolean;

  constructor(symbol: Symbol, options: DocumentOptions) {
    options.$parentSymbol ??= symbol;
    options.$rootSymbol ??= options?.$parentSymbol;
    super(symbol, options);

    this.index = options?.$index ?? 0;

    this.#assign(symbol);
  }

  #assign(symbol: Symbol): void {
    const parameter = symbol?.getDeclarations()[0] as ParameterDeclaration;
    const paramTypeNode = parameter?.getTypeNode();
    const paramCommentNode = this.tags?.find((t) => Node.isJSDocParameterTag(t.node) && t.name === parameter?.getName())
      ?.node as JSDocParameterTag;

    this.defaultValue = parameter?.getInitializer();
    this.isOptional = !!(parameter?.getInitializer() ?? parameter?.hasQuestionToken());
    // 参数前注释
    const leadingComment = parameter?.getLeadingCommentRanges()?.[0]?.getText();
    // 参数后注释
    const trailingComment = parameter?.getTrailingCommentRanges()?.[0]?.getText();
    this.description =
      (leadingComment ?? trailingComment)?.replace(/(^\/{2,}\s?)|(^\/\*{1,2}\s?)|(\s?\*\/$)/g, '') ??
      paramCommentNode?.getCommentText()?.replace(/(^\n)|(\n$)/g, '');
    this.type = DocumentParser(paramTypeNode!, { ...this.getComputedOptions(), $parent: this.parent });

    this.readonly = !!this.tags.find(it => it.name === JSDocTagEnum.readonly);
  }
}
