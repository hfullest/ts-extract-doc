import { ExampleClass } from './class';
import { UiButtonProps } from './object';

interface ABC {
  abc1: string;
  abc2: number;
  /** @version 1.23.5 */
  ahhah: {
    sdfds: string;
  };
  cccc?: symbol;
  reg?: RegExp;
  date?: Date;
  appentType?: '985' | string;
}
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
interface ExampleInterface extends UiButtonProps<true>, Pick<ABC, 'abc1' | 'abc2'>, ExampleClass {
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
  button?: UiButtonProps<true>;

  /** 接口函数定义
   * @param {string} p1 参数一字符串
   * @param {number} p2 参数二数值
   * @returns {boolean} 返回值测试
   */
  bb: (
    // p1 前置内容
    p1: string /* 测试p1后文本内容        */,
    /** 测试p2前部分内容 */ p2?: number,
  ) => string;
}
