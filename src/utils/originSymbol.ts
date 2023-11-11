/** 由于使用了ts-morph的Symbol，这里使用别名使用原生Symbol */
export const OriginSymbol = Symbol;

/** 生成新的symbol */
export const genSymbol = (description?: string) => Symbol(description);
