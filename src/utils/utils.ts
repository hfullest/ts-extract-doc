import { ts, Symbol } from 'ts-morph';

/** 是否为ts类型，type、interface、namespace */
export const isTypesKind = (symbol: Symbol) => {
  return [ts.SymbolFlags.Interface, ts.SymbolFlags.Type, ts.SymbolFlags.Namespace].some((f) => f === symbol.getFlags());
};

export const isFunctionKind = (symbol: Symbol) => {
  const isArrowFunction = (symbol: Symbol) => {
    const flag = symbol.getFlags();
    if (flag !== ts.SymbolFlags.BlockScopedVariable) return false;
    const arrowFunction = symbol.getValueDeclaration()?.getFirstChildByKind(ts.SyntaxKind.ArrowFunction);
    return !!arrowFunction;
  };
  return symbol.getFlags() === ts.SymbolFlags.Function || isArrowFunction(symbol);
};

export const isClassKind = (symbol: Symbol) => {
  return symbol.getFlags() === ts.SymbolFlags.Class;
};

export const isJSXComponentKind = (symbol: Symbol) => {
  return false; // TODO: 增加react 函数组件判断
};

export const isClassComponentKind = (symbol: Symbol) => {
  return false; // TODO: 增加react 类组件判断
};
