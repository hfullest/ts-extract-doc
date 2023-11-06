import * as React from 'react';
import { A } from './a';

export interface ISelectProps {
  /**
   * 传入的数据源，可以动态渲染子项
   * 
   */
  dataSource: string[];
  /**
   * Select发生改变时触发的回调
   */
  onChange?: (item: string) => void;
  /**
   * 是否只读，只读模式下可以展开弹层但不能选
   */
  readOnly?: boolean;
  /**
   * 选择器尺寸
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * 当前值，用于受控模式
   */
  value?: string | number;
  /** 这里表示a属性 @default {aa:1234} */
  a:A;
}

/**
 * 选择器
 * @author Danker
 * @public
 */
class Select extends React.Component<ISelectProps> {
  static defaultProps = {
    readOnly: false,
    size: 'medium',
  };

  render() {
    return <div>Test</div>;
  }
}
export default Select;