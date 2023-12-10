/**
 *  AB测试函数
 * @param p1 参数一
 * @param p2 参数二
 * @returns  返回字符串
 */
export const ArrowFunction = (p1: string, p2: number): string => {
  return p1 + p2;
};

/**
 * 这个是DelcarationFunction 的描述
 *
 * @description
 * 这里是对`DeclarationFunction`函数的补充描述，这里可以使用`markdown`语法
 */
export function DeclarationFunction(
  a: number /** 测试声明函数的a参数后置注释 */,
  b?: symbol,
  c: string = 'ssss',
): void {}

/** 测试Func3 */
export const Fun3 = (a: string, b: number) => {
  return a + b;
};

/** 测试两种情况类型推断 */
export const Fun4 = (p1: number, p2: number) => {
  if (p1 > p2) return `${p1}-${p2}`;
  return p1 * p2;
};
