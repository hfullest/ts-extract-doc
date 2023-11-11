import React from "react";
import { AntdButtonProps, AntdButton, UI_PREFIX } from "./AntdButton";
/**
 *? 为什么需要使用antd的Button组件进行封装
    1. antd提供了很多样式类型，但NativeButton暂未完全实现，例如：link按钮等
    2. 对antd按钮定制化的样式，同样也可以通过类名的方式给其他antd组件内部按钮添加样式，例如：Modal.confirm的按钮等
    3. 如果后续的样式及功能迭代需要复用antd的Button组件，使用NativeButton难维护和扩展
 *  */

/** UiButton */
export type UiButtonProps<N = false> = AntdButtonProps & CompatButtonProps<N>;

interface CompatButtonProps<N> {
  /**是否使用原生按钮 */
  native?: N;
  children?: React.ReactNode;
  /** 已默认启用`Antd Button`，该属性已遗弃，未来版本将移除该属性
   *  @deprecated
   * 
   * 哈哈哈这里可以是markdown
   * 
   *  */
  ant?: never;
}

export const UiButton = <N extends boolean = false>(
  props: UiButtonProps<N>
): JSX.Element => {
  const { native = false, ...buttonProps } = props;
  const Button: any = AntdButton;
  return <Button {...buttonProps} ></Button>;
};

UiButton.__ANT_BUTTON = true;
UiButton.Group = AntdButton.Group;

export { UI_PREFIX };

/**
 *  AB测试函数
 * @param p1 参数一
 * @param p2 参数二
 * @returns  返回字符串
 */
export const ABFunction = (p1: string, p2: number): string => {
  return p1 + p2;
}


/** 错误边界 */
export class ErrorBound {
  /** 渲染函数
   * @public
   */
  public render() {
    return <div>哈哈哈</div>
  }
}


export type ExampleType = string | number | UiButtonProps;


/** 
 * 接口
 * 
 * @param A {string} - {@link https://abc.com} 测试getCommentText &#64;param value Some description.
 * 
 * @see {@link https://abc123.com}
 * 
 * @description 
 * 这里是内容
 * 
 * 其他的内容区内容
 * 
 * @example
 *  const a = 123;
 * 
 * @version 3.5.19
 */
export interface ExampleInterface {
  /** a属性
   * @default 'hahah'
   * 
   * 这里是markdown区域
   */
  a: string;
  /**
   * `button`描述
   * 
   * button的==内容==区
   * 
   * @version 3.2.15
   */
  button?: UiButtonProps;

  /** 接口函数定义
   * @param {string} p1 参数一字符串
   * @param {number} p2 参数二数值
   * @returns {boolean} 返回值测试
   */
  bb: ((
    // p1 前置内容
    p1: string/* 测试p1后文本内容        */,/** 测试p2前部分内容 */ p2?: number) => string);
}

/** 枚举类型 */
export enum ExampleEnum {
  AAA,
  BBB
}

export const exampleVar1 = 1234;

/** 字面量对象 */
export const exampleObj = {
  a1: 123,
  b2: true,
  c3: {
    tt: 323,
  }
}


/** 这个是对ExampleClass类的描述 */
export class ExampleClass {
  /** a属性
   * @default 'hahah'
   * 
   * 这里是markdown区域
   */
  a: string = '124';
  /**
   * `button`描述
   * 
   * button的==内容==区
   * 
   * @version 3.2.15
   */
  button?: UiButtonProps;

  /** 接口函数定义
   * @param {string} p1 参数一字符串
   * @param {number} p2 参数二数值
   * @returns {boolean} 返回值测试
   */
  bb: ((
    // p1 前置内容
    p1: string/* 测试p1后文本内容        */,/** 测试p2前部分内容 */ p2?: number) => string) = () => '';


  private cccPrivate = '1234';

  /** 测试公共方法 */
  public dddPublic: number = 12;

  static fffStaticProp: boolean = true;

  /** 这个是静态方法 */
  static eeeStaticMethod = (a: number, b?: string) => {
    return 456;
  }
}