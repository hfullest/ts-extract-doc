import { Node, ts } from 'ts-morph';
import { BaseDocField, SymbolOrOtherType } from './BaseDocField';

/** 获取真实类型，用于处理ts复杂类型推断与计算 */
export class RealSymbolOrOther {
  #symbolOrOther!: SymbolOrOtherType;
  constructor(symbolOrOther: SymbolOrOtherType) {
    this.#symbolOrOther = this.#getActualSymbolOrOther(symbolOrOther);
  }

  public getSymbolOrOther(): SymbolOrOtherType {
    return this.#symbolOrOther;
  }

  #getActualSymbolOrOther(symbolOrOther: SymbolOrOtherType): SymbolOrOtherType {
    const handlers: ((symbol: SymbolOrOtherType) => SymbolOrOtherType)[] = [this.#handleAlias, this.#handleHerit];
    for (let handler of handlers) {
      const handled = handler.call(this, symbolOrOther);
      if (handled !== symbolOrOther) return this.#getActualSymbolOrOther(handled); // 递归推导
    }
    return symbolOrOther;
  }

  /** 处理继承 */
  #handleHerit(symbolOrOther: SymbolOrOtherType): SymbolOrOtherType {
    const { symbol, node } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    const importSpecifier = node?.asKind(ts.SyntaxKind.ImportSpecifier);
    if (!importSpecifier) return symbolOrOther;
    // 处理导入
    const moduleSymbol = importSpecifier
      ?.getImportDeclaration?.()
      ?.getModuleSpecifierSourceFile()
      ?.getLocal?.(symbol?.getName() ?? node?.getText()!);
    return moduleSymbol!;
  }

  #handleAlias(symbolOrOther: SymbolOrOtherType): SymbolOrOtherType {
    const { node } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    if(!Node.isTypeReference(node))return symbolOrOther;
    return symbolOrOther;
  }

  //   #handlePick(symbolOrOther: SymbolOrOtherType): SymbolOrOtherType {}
}
