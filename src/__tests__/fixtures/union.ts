/** 测试 TypeObjectLiteral 描述
 *
 * @description
 * 这里是TypeObjectLiteral 额外描述
 *
 * @example
 * const abc:TypeObjectLiteral = {};
 * 
 * @calculate
 */
export type TypeObjectLiteral =
  | {
      a: string;
      /** 测试b */
      readonly b?: number;
    }
  | string
  | UiButtonProps
  | ((p1: number, p2?: string) => void)
  | Function;

type UiButtonProps<N = false> = {
  a: string;
  /** 属性b */
  b?: number;
  /** @default */
  c: { c1: string; c2: () => string };
};
