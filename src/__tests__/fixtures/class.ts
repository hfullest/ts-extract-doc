import React from 'react';

type UiButtonProps = {
  /**是否使用原生按钮 */
  native?: boolean;
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
};

/** 这个是对ExampleClass类的描述 */
export class ExampleClass {
  /** a属性
   * @default 'hahah'
   *
   * 这里是markdown区域
   *
   *
   */
  a: string = '124';
  /**
   * `button`描述
   *
   * button的==内容==区
   *
   * @version 3.2.15
   *
   * @expand 3
   */
  button?: UiButtonProps;

  /** 接口函数定义
   * @param {string} p1 参数一字符串
   * @param {number} p2 参数二数值
   * @returns {boolean} 返回值测试
   */
  bb: (
    // p1 前置内容
    p1: string /* 测试p1后文本内容        */,
    /** 测试p2前部分内容 */ p2?: number,
  ) => string = () => '';

  private cccPrivate = '1234';

  /** 测试公共方法 */
  public dddPublic: number = 12;

  static fffStaticProp: boolean = true;

  /** 这个是静态方法 */
  static eeeStaticMethod = (a: number, b?: string) => {
    return 456;
  };
}
