import { EnumMember, Node, PropertyDeclaration, PropertySignature, Symbol, ts } from 'ts-morph';
import { BaseDocField } from './BaseDocField';
import { DocumentType } from './DocumentType';

export class DocumentEnumMember extends BaseDocField {
  /** 键，避免使用`key`关键字，使用`label`代替 */
  label: string;
  /** 值 */
  value: string | number | ts.PseudoBigInt;

  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.#assign(symbol);
  }

  #assign(symbol: Symbol): void {
    const node = BaseDocField.getCompatAncestorNode(symbol);
    if (!DocumentEnumMember.isTarget(node)) return;
    this.label = node.getName();
    this.value = node.getType()?.getLiteralValue();
  }

  static isTarget(node: Node): node is EnumMember {
    return Node.isEnumMember(node);
  }
}
