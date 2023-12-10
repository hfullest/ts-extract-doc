
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

  /** 测试嵌套 */
  compa2: boolean;
};

const ButtonTypes = ["default", "primary", "dashed", "link", "text"];
type ButtonType = typeof ButtonTypes[number];

const ButtonShapes = ["default", "circle", "round"];
type ButtonShape = typeof ButtonShapes[number];

type SizeType = 'small' | 'middle' | 'large' | undefined;

interface TooltipProps {
  style?: React.CSSProperties;
  className?: string;
  rootClassName?: string;
  openClassName?: string;
  /** @deprecated Please use `arrow={{ pointAtCenter: true }}` instead. */
  arrowPointAtCenter?: boolean;
  arrow?: boolean | {
    /** @deprecated Please use `pointAtCenter` instead. */
    arrowPointAtCenter?: boolean;
    pointAtCenter?: boolean;
  };
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  children?: React.ReactNode;
  destroyTooltipOnHide?: boolean | {
    keepParent?: boolean;
  };
}

interface ButtonProps {
  type?: ButtonType;
  icon?: React.ReactNode;
  shape?: ButtonShape;
  size?: SizeType;
  disabled?: boolean;
  loading?: boolean | {
    delay?: number;
  };
  prefixCls?: string;
  className?: string;
  rootClassName?: string;
  ghost?: boolean;
  danger?: boolean;
  block?: boolean;
  children?: React.ReactNode;
  [key: `data-${string}`]: string;
  classNames?: {
    icon: string;
  };
  styles?: {
    icon: React.CSSProperties;
  };
}


export interface AntdButtonProps
  extends Omit<ButtonProps, "type" | "disabled" | "loading"> {
  /** 只有两个字符时是否插入空格 默认`false`
   *
   *  注意：该属性非`antd`提供的属性，而是自定义的属性，是对`antd`按钮功能的增强
   */
  autoInsertSpaceInButton?: boolean;
  /** 是否`loading`
   *
   * 对`antd`按钮的`loading`功能进行了扩展，支持`loading`自定义配置
   * @example
   * const App:React.FC = ()=>{
   *  const [loading,setLoading] = useState(true);
   * return <UiButton
   *  loading={{
   *    loading: loading,
   *    type: 'contain',
   *    icon: <>这里放置loading图标组件</>
   *  }}>
   *  确认
   * </UiButton>
   * }
   */
  loading?:
  | boolean
  | {
    /** 是否`loading` */
    loading?: boolean;
    /** type类型，默认值为`cover`
     *  - cover `loading`图标覆盖按钮，会覆盖按钮文本
     *  - contain `loading`图标包含在按钮中，不会覆盖按钮文本
     */
    type?: "cover" | "contain";
    /** 加载图标，允许自定义loading图标 */
    icon?: React.ReactNode;
  };
  /** 按钮类型，在`antd`的`type`基础上进行了扩展
   *
   * 扩展的类型：
   * - `minority` 次按钮
   * - `warn` 警告按钮
   * - `danger` 危险按钮 该类型样式等同于`type=primary danger=true`配置
   * - `textlink` 链接文本类型，和`link`的区别在于`link`更像超链接，而`textlink`更像链接型按钮
   * - `ghostLight`
   *
   * 按钮组一般使用主按钮`primary`和次按钮`minority`
   * （注意：之前使用的次按钮为`ghost`，为统一规范，`ghost`不再推荐为次按钮使用，请使用`minority`代替）
   */
  type?:
  | ButtonProps["type"]
  | "minority"
  | "warn"
  | "danger"
  | "ghostLight"
  | "textlink";

  /** 按钮失效状态 对`antd`的属性进行了扩展
   *
   */
  disabled?:
  | boolean
  | {
    /** 禁用状态下按钮的`tooltip`提示 */
    tooltip?: TooltipProps;
  };
  /** 按钮tooltip提示，当按钮禁用时该属性会失效
   *
   *  如果需要按钮禁用时提示请使用`disabled.tooltip`
   */
  tooltip?: TooltipProps | null;
  /** 按钮内容对齐方式 默认`center` */
  align?: "start" | "center" | "end";
  /** 按钮内联 padding 值，如果为false 则为0 */
  padding?: false | string;
}

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
    ant?: UiButtonProps;
  } & {
    /** a属性测试 */
    a: string;
    b: number;
  } & CompatButtonProps<any>
) => {
  const { native = false, ...buttonProps } = props1;
  if (1 + 1 === 2) return null;
  else return <div>哈哈哈</div>;
  // return React.createElement('div',{})
};

/** 测试React组件转发 */
export const TestRefUiButton = React.forwardRef(UiButton);