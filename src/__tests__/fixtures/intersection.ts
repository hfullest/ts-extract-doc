import React from 'react';

/** UiButton 属性
 * 
 * @calculate
 */
export type UiButtonProps<N = false> = {
  a: string;
  /** 属性b */
  b?: number;
  /** @default */
  c: { c1: string; c2: () => string };
} & CompatButtonProps<N>;

/** @output */
type CompatButtonProps<N> = {
  /**是否使用原生按钮 */
  native?: N;
  children?: React.ReactNode;
  /** 已默认启用`Antd Button`，该属性已遗弃，未来版本将移除该属性
   *  @deprecated
   *
   * @description
   * 哈哈哈这里可以是markdown
   *
   *  */
  ant?: never;

  /** 测试嵌套 */
  compat: boolean;
};
