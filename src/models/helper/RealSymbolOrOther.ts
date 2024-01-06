import { InterfaceDeclaration, Node, Symbol, Type, ts } from 'ts-morph';
import { BaseDocField, DocumentOptions, SymbolOrOtherType } from './BaseDocField';

/** 获取真实类型，用于处理ts复杂类型推断与计算 */
export class RealSymbolOrOther {
  #symbolOrOther!: SymbolOrOtherType;

  #parseOptions!: DocumentOptions;

  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    this.#symbolOrOther = this.#getActualSymbolOrOther(symbolOrOther);
    this.#parseOptions = options;
  }

  public getSymbolOrOther(): SymbolOrOtherType {
    return this.#symbolOrOther;
  }

  #getActualSymbolOrOther(symbolOrOther: SymbolOrOtherType): SymbolOrOtherType {
    const handlers: ((symbol: SymbolOrOtherType, options: DocumentOptions) => SymbolOrOtherType)[] = [
      this.#handleAlias,
      this.#handleHerit,
      this.#handlePick,
      this.#handleOmit
    ];
    for (let handler of handlers) {
      const handled = handler.call(this, symbolOrOther, { ...this.#parseOptions });
      if (handled !== symbolOrOther) return this.#getActualSymbolOrOther(handled); // 递归推导
    }
    return symbolOrOther;
  }

  /** 处理继承 */
  #handleHerit(symbolOrOther: SymbolOrOtherType): SymbolOrOtherType {
    const { symbol, node } = BaseDocField.splitSymbolNodeOrType(symbolOrOther, { useLocal: true });
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
    const { node } = BaseDocField.splitSymbolNodeOrType(symbolOrOther, { useLocal: true });
    if (!Node.isTypeReference(node)) return symbolOrOther;
    return symbolOrOther;
  }

  #handlePick(symbolOrOther: SymbolOrOtherType): SymbolOrOtherType {
    return symbolOrOther;
  }
  #handleOmit(symbolOrOther: SymbolOrOtherType, options: DocumentOptions): SymbolOrOtherType {
    const { symbol, node, type } = BaseDocField.splitSymbolNodeOrType(symbolOrOther, { useLocal: true });
    const omitInfo = { isTarget: false, isTypeAlias: false, isType: false };
    const typeNode = node?.asKind(ts.SyntaxKind.TypeAliasDeclaration)?.getTypeNode?.()?.asKind(ts.SyntaxKind.TypeReference);
    // symbolOrOther 类型别名
    if (symbolOrOther instanceof Symbol && typeNode?.getTypeName()?.getText?.() === 'Omit') { omitInfo.isTarget = true; omitInfo.isTypeAlias = true; }
    // symbolOrOther 类型
    if (symbolOrOther instanceof Type && symbol?.getName?.() === 'Omit') { omitInfo.isTarget = true; omitInfo.isType = true; }

    if (omitInfo.isTarget) {
      const typeArgumentsTypes = (omitInfo.isTypeAlias ? typeNode?.getTypeArguments()?.map(it => it.getType()) :
        type?.getAliasTypeArguments?.()) ?? [];
      const [targetType, propsUnionType] = typeArgumentsTypes;
      const unionTypes = propsUnionType.isLiteral() ? [propsUnionType?.getLiteralValue?.()] : propsUnionType.getUnionTypes?.()?.map(it => it?.getLiteralValue?.());
      const omitKeys = new Set(unionTypes);
      const { node: targetNode } = BaseDocField.splitSymbolNodeOrType<Symbol, InterfaceDeclaration>(targetType?.getAliasSymbol?.() ?? targetType?.getSymbol?.(), { useLocal: true });
      targetNode?.getProperties?.().forEach(it => {
        const name = it?.getName?.();
        if (omitKeys.has(name)) { it.remove() }
      })

      if (omitInfo.isTypeAlias) {
        const typeAliaNode = node?.asKind(ts.SyntaxKind.TypeAliasDeclaration);
        const parentNodeStructure = typeAliaNode?.getStructure();
        if (parentNodeStructure) {
          parentNodeStructure.type = targetNode?.getText()!;
          typeAliaNode?.set(parentNodeStructure);
        }
        return symbolOrOther;
      } else if (omitInfo.isType) {
        return targetNode!;
      }
    }
    return symbolOrOther;
  }
}
