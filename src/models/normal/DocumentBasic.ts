import { Node, Type, TypeAliasDeclaration, ts } from 'ts-morph';
import { BaseDocField, DocumentOptions, SymbolOrOtherType } from '../helper';

export class DocumentBasic extends BaseDocField {
  /** 类型文本展示 */
  text: string | undefined;
  /** 当前类型节点，方便自行获取并处理类型 */
  typeNode: Node<ts.TypeNode> | null = null;
  /** 当前类型`type`对象 */
  current?: Type | null = null;

  constructor(symbolOrType: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrType);
    options.$parentSymbol ??= symbol!;
    options.$rootSymbol ??= options?.$parentSymbol;
    super(symbolOrType, options);

    this.#assign(symbolOrType);
  }

  #assign(symbolOrType: SymbolOrOtherType) {
    const { node, type } = BaseDocField.splitSymbolNodeOrType(symbolOrType);
    this.text = node?.getText?.()?.replace(/(\n*\s*\/{2,}[\s\S]*?\n{1,}\s*)|(\/\*{1,}[\s\S]*?\*\/)/g, ''); // 去除注释
    this.typeNode = (node as TypeAliasDeclaration)?.getTypeNode?.()!;
    this.current = type;
    this.displayType = type?.getText?.();
  }

  static isTarget(nodeOrType: SymbolOrOtherType) {
    const { type } = BaseDocField.splitSymbolNodeOrType(nodeOrType);
    return (
      type?.isNumber() ||
      type?.isNumberLiteral() ||
      type?.isBoolean() ||
      type?.isBooleanLiteral() ||
      type?.isString() ||
      type?.isStringLiteral() ||
      type?.isTemplateLiteral() ||
      type?.isNullable() ||
      // 兼容其他未知类型
      type?.isVoid() ||
      type?.isAny() ||
      type?.isUnknown() ||
      type?.isNever()
    );
  }
}
