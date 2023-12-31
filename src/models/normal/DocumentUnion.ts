import { TypeAliasDeclaration } from 'ts-morph';
import { BaseDocField, DocumentOptions, SymbolOrOtherType } from '../helper';
import { Document, DocumentParser } from '../index';

export class DocumentUnion extends BaseDocField {
  /** 联合类型 */
  unions: Document[] = [];
  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    options.$parentSymbol ??= symbol;
    options.$rootSymbol ??= options?.$parentSymbol;
    super(symbolOrOther, options);

    this.#assign(symbolOrOther);
  }

  #assign(symbolOrOther: SymbolOrOtherType) {
    const { node, type } = BaseDocField.splitSymbolNodeOrType<any, TypeAliasDeclaration>(symbolOrOther);
    const tupleTypes = type?.getUnionTypes();
    const docs = tupleTypes
      ?.map((tuple) => {
        const symbol = tuple?.getAliasSymbol?.()??tuple?.getSymbol?.();
        const node = symbol?.getDeclarations?.()?.[0];// 不使用getValueDeclaration，因为有的重载名称不一致，比如Function=>FunctionConstructor
        return DocumentParser(node ?? tuple, {
          ...this.getComputedOptions(),
          $parent: this,
        });
      })
      .filter(Boolean);
    this.unions = (docs as Document[]) ?? [];
    this.displayType = node?.getTypeNode?.()?.getText?.();
    if (this.$options.$typeCalculate) {
      const displayType = docs
        ?.map((it) => it?.toTypeString())
        ?.filter(Boolean)
        .join('|');
      this.displayType = displayType;
    }
  }

  static [Symbol.hasInstance] = (instance: any) => Object.getPrototypeOf(instance).constructor === this;

  static isTarget(typeOrNode: SymbolOrOtherType) {
    const { type } = BaseDocField.splitSymbolNodeOrType(typeOrNode);
    return type?.isUnion();
  }
}
