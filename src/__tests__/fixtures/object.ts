/** @output */
export type UiButtonProps<T> = {
    /**是否使用原生按钮 */
    native?: T;
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
    compat: [
      {
        a: string;
        /** 测试b */
        readonly b?: number;
      },
      string,
    ];
  
    arr: { p1: number, p2: string }[]
  
    arr2: Array<string>
  };
  
  type CompatButtonProps<N> = {
    /**是否使用原生按钮 */
    native2?: N;
    children2?: React.ReactNode;
    /** 已默认启用`Antd Button`，该属性已遗弃，未来版本将移除该属性
     *  @deprecated
     *
     * @description
     * 哈哈哈这里可以是markdown
     *
     *  */
    ant2?: never;
  
    /** 测试嵌套
     * @version 4.1.23.alpha.0
     */
    compa2: boolean;
  };