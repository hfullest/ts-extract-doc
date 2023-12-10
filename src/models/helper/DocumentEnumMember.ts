import { EnumMember, Node, Symbol, ts } from 'ts-morph';
import { BaseDocField, DocumentOptions } from './BaseDocField';

export class DocumentEnumMember extends BaseDocField {
  /** 键，避免使用`key`关键字，使用`label`代替 */
  label!: string;
  /** 值 */
  value!: string | number | ts.PseudoBigInt;
  /** 属性方法的索引顺序，可以用来指定文档输出顺序 */
  index: number = 0;

  constructor(symbol: Symbol, options: DocumentOptions) {
    options.$parentSymbol ??= symbol;
    options.$rootSymbol ??= options?.$parentSymbol;
    super(symbol, options);

    this.index = options?.$index ?? 0;

    this.#assign(symbol);
  }

  #assign(symbol: Symbol): void {
    const node = BaseDocField.getCompatAncestorNode(symbol);
    if (!DocumentEnumMember.isTarget(node)) return;
    this.label = node.getName()!;
    this.value = node.getType()?.getLiteralValue()!;
  }

  static isTarget(node: Node): node is EnumMember {
    return Node.isEnumMember(node);
  }
}
