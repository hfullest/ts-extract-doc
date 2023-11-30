import { Node, Symbol, Type, TypeAliasDeclaration, ts } from 'ts-morph';
import { BaseDocField, DocumentOptions } from '../helper';
import { Document, DocumentParser } from '../';

export class DocumentArray extends BaseDocField {
  /** 类型文本展示 */
  text: string = '';
  /** 当前类型节点，方便自行获取并处理类型 */
  typeNode: Node<ts.TypeNode> | null = null;
  /** 当前类型`type`对象 */
  current?: Type | null = null;
  /** 类型值 */
  value!: string | undefined;
  /** 数组元素类型 */
  elementType!: Document | undefined;

  constructor(symbolOrType: Symbol | Type, options: DocumentOptions) {
    const symbol = symbolOrType instanceof Symbol ? symbolOrType : null;
    options.parentSymbol ??= symbol!;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbol!, options);
    this.#options = options;

    this.#assign(symbolOrType);
  }

  #options: DocumentOptions;

  #assign(symbolOrType: Symbol | Type) {
    const { node, type } = BaseDocField.splitSymbolNodeOrType(symbolOrType);
    const arrayType = type?.getArrayElementType()?.getTargetType?.();
    this.text = node?.getText?.()?.replace(/(\n*\s*\/{2,}[\s\S]*?\n{1,}\s*)|(\/\*{1,}[\s\S]*?\*\/)/g, ''); // 去除注释
    this.typeNode = (node as TypeAliasDeclaration)?.getTypeNode?.()!;
    this.current = type;
    this.elementType = DocumentParser(arrayType!, this.#options);
    this.value = arrayType?.getText?.(); //TODO:
  }

  static isTarget(nodeOrType: Node | Type) {
    const { type } = BaseDocField.splitSymbolNodeOrType(nodeOrType);
    return type?.isArray();
  }
}
