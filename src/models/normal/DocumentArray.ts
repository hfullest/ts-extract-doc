import { Node, Symbol as TsSymbol, Type, TypeAliasDeclaration, ts } from 'ts-morph';
import { BaseDocField, DocumentOptions, SymbolOrOtherType } from '../helper';
import { Document, DocumentParser } from '../';

export class DocumentArray extends BaseDocField {
  /** 类型文本展示 */
  text: string | undefined;
  /** 当前类型节点，方便自行获取并处理类型 */
  typeNode: Node<ts.TypeNode> | null = null;
  /** 当前类型`type`对象 */
  current?: Type | null = null;
  /** 数组元素类型 */
  elementType!: Document | null;

  constructor(symbolOrType: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrType);
    options.$parentSymbol ??= symbol!;
    options.$rootSymbol ??= options?.$parentSymbol;
    super(symbolOrType!, options);

    this.#assign(symbolOrType);
  }

  #assign(symbolOrType: SymbolOrOtherType) {
    const { node, type } = BaseDocField.splitSymbolNodeOrType<TsSymbol, TypeAliasDeclaration>(symbolOrType);
    const arrayType = type?.getArrayElementType()?.getTargetType?.() ?? type?.getArrayElementType(); // 有泛型先取泛型
    const typeNode = node?.getTypeNode?.();
    this.text = node?.getText?.()?.replace(/(\n*\s*\/{2,}[\s\S]*?\n{1,}\s*)|(\/\*{1,}[\s\S]*?\*\/)/g, ''); // 去除注释
    this.typeNode = typeNode!;
    this.current = type;
    this.elementType = DocumentParser(arrayType!, this.$options);
    this.displayType = typeNode?.getText?.();
  }

  static [Symbol.hasInstance] = (instance: any) => Object.getPrototypeOf(instance).constructor === this;

  static isTarget(nodeOrType: SymbolOrOtherType) {
    const { type } = BaseDocField.splitSymbolNodeOrType(nodeOrType);
    return type?.isArray();
  }
}
