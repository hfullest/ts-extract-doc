import React from "react";

/**
 * 
 * @version 2.5.16-alpha.0
 * @id ReactClassComponentA-Test
 * @alias ABCReact
 * @order 
 * @href {#12354}
 */
export class ReactClassComponentA extends React.Component {
  static defaultProps = { c: { c1: 'aaa' }, e: 'sdkfdsfs' };
  render(): React.ReactNode {
    //@ts-ignore
    return <div>哈哈哈</div>;
  }
}




export type AAAAAA = UiButtonProps<true>[];

export enum BBBB {
  AA = '123',
  BB = '345',
}

/** 测试 TypeObjectLiteral 描述
 *
 * @description
 * 这里是TypeObjectLiteral 额外描述
 *
 * @example
 * const abc:TypeObjectLiteral = {};
 */
export type TypeObjectLiteral = {
  a: string;
  /** 测试b */
  readonly b?: number;
}
/** UiButton */
export type UiButtonProps<N = false> = {} & MidUiButtonProps<N>;

export type MidUiButtonProps<N = true> = MidUiButtonProps2<N>;
export type MidUiButtonProps2<N = true> = CompatButtonProps<N>;

/**
 *? 为什么需要使用antd的Button组件进行封装
    1. antd提供了很多样式类型，但NativeButton暂未完全实现，例如：link按钮等
    2. 对antd按钮定制化的样式，同样也可以通过类名的方式给其他antd组件内部按钮添加样式，例如：Modal.confirm的按钮等
    3. 如果后续的样式及功能迭代需要复用antd的Button组件，使用NativeButton难维护和扩展
 
 * @output */
type CompatButtonProps<N> = {

  /** 已默认启用`Antd Button`，该属性已遗弃，未来版本将移除该属性
   *  @deprecated
   *
   * @description
   * 哈哈哈这里可以是markdown
   *
   *  */
  ant?: UiButtonProps<N>;
  /**是否使用原生按钮 */
  native?: N;
  children?: React.ReactNode;

  /** 测试嵌套
   * @alias <a href='https://baidu.com'>compat</a>
   */
  compat: TypeObjectLiteral;
};

/** 测试UiButton 描述
 * @title
 *  */
export const UiButton = <N extends boolean = false>(
  props1: {
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
    ant?: UiButtonProps<N>;
  } & {
    /** a属性测试 */
    a: string;
    b: number;
  } & CompatButtonProps<any>
) => {
  const { native = false, ...buttonProps } = props1;
  //@ts-ignore
   return <div>哈哈哈</div>;
};

export const testRefUiButton = () => React.forwardRef(UiButton);

export default UiButton;

UiButton.__ANT_BUTTON = true;


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
  c: string = "ssss"
): {} {
  return {} as any
}

/** 错误边界 */
export class ErrorBound {
  /** 渲染函数
   * @public
   */
  public render() {
    //@ts-ignore
    return <div>哈哈哈</div>;
  }
}

// export type ExampleType = string | number | UiButtonProps;

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
 *
 * @output
 */
interface ExampleInterface {
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
  bb: (
    // p1 前置内容
    p1: string /* 测试p1后文本内容        */,
    /** 测试p2前部分内容 */ p2?: number
  ) => string;
}

/** 枚举类型 */
export enum ExampleEnum {
  AAA,
  BBB,
}

export const exampleVar1 = 1234;

/** 字面量对象 */
export const exampleObj: {
  a1: number;
  /** 这里是b2前置注释 */
  b2: boolean;
  /** 这里是c3的前置注释 */
  c3: {
    tt: number;
  };
} = {
  a1: 123,
  b2: true,
  c3: {
    tt: 323,
  },
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
  a: string = "124";
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
    /** 测试p2前部分内容 */ p2?: number
  ) => string = () => "";

  private cccPrivate = "1234";

  /** 测试公共方法 */
  public dddPublic: number = 12;

  static fffStaticProp: boolean = true;

  /** 这个是静态方法 */
  static eeeStaticMethod = (a: number, b?: string) => {
    return 456;
  };
}
