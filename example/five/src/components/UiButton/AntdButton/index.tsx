import Button, { ButtonProps } from "antd/lib/button";
import classNames from "classnames";
import React from "react";

import { Tooltip } from "antd";
import { removeAntdTwoCharSpace } from "@/utils/removeAntdTwoCharSpace";

import "./styles.less";

type TooltipProps = Parameters<typeof Tooltip>[0];

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

interface Hanlder {
  (children: React.ReactNode, props?: AntdButtonProps): React.ReactNode;
}

const ButtonWithToolTip = (
  props: ButtonProps & { tooltip?: TooltipProps | null }
) => {
  const { tooltip, ...buttonProps } = props;
  if (!tooltip) return <Button {...(buttonProps as any)} aria-label="button" />;
  const BridgeButton = (props: any) => (
    <Button {...props} aria-label="button" />
  );
  BridgeButton.__ANT_BUTTON = true;
  return (
    <Tooltip {...tooltip}>
      <BridgeButton {...buttonProps} />
    </Tooltip>
  );
};

/** 处理两个字符空格问题 */
const dealSpace = (
  children: React.ReactNode,
  needSpace: boolean
): React.ReactNode => {
  if (needSpace) return children;
  return removeAntdTwoCharSpace(children);
};

/** 类名前缀 
 * @variation
 */
export const UI_PREFIX = "ui"; // 注意和style里变量保持一致

export const AntdButton = (props: AntdButtonProps) => {
  const {
    children,
    autoInsertSpaceInButton = false,
    className,
    loading,
    type,
    disabled,
    tooltip,
    align = "center",
    padding,
    ...buttonProps
  } = props;
  const prefixCls = `${UI_PREFIX}-btn`;
  const loadingType =
    typeof loading === "object" ? loading?.type ?? "cover" : "cover";

  /** 定义子节点管道处理函数 */
  const childrenHandlers: Hanlder[] = [
    (children) => dealSpace(children, autoInsertSpaceInButton), // 最后处理两个字符空格问题
  ];

  const computedTooltip =
    typeof disabled === "object" ? disabled.tooltip : tooltip;
  const computedChidren = childrenHandlers.reduce(
    (children, handler) => handler?.(children, props),
    children
  );

  const loadingOptions: any =
    typeof loading === "object" ? { loading: true, ...loading } : { loading };
  const computedLoading = !!(loadingOptions.loading && !loadingOptions.icon); // 自定义 loading 图标不使用默认loading，配合自定义样式实现
  const computedIcon =
    loadingOptions.loading && loadingOptions.icon ? (
      <span className={`${prefixCls}-loading-icon`}>{loadingOptions.icon}</span>
    ) : buttonProps.icon ? (
      <span className={`${prefixCls}-icon`}>{buttonProps.icon}</span>
    ) : null;

  const classes = classNames(className, prefixCls, {
    twoCharNotSpace: !autoInsertSpaceInButton,
    [`${prefixCls}-type-${type}`]: type && typeof type === "string",
    [`${prefixCls}-disabled`]: !!disabled,
    [`${prefixCls}-size-${buttonProps?.size}`]: !!buttonProps?.size,
    [`${prefixCls}-align-${align}`]: !!align,
    [`${prefixCls}-loading`]: !!loading,
    [`${prefixCls}-loading-${loadingType}`]: !!loading,
  });

  const styles: React.CSSProperties = {
    ...buttonProps?.style,
    ...(padding === false && { padding: 0 }),
    ...(padding && { padding }),
  };

  return (
    <ButtonWithToolTip
      {...buttonProps}
      className={classes}
      style={styles}
      icon={computedIcon}
      type={type as any}
      disabled={!!disabled}
      tooltip={computedTooltip}
      loading={computedLoading}
    >
      {computedChidren}
    </ButtonWithToolTip>
  );
};

AntdButton.Group = Button.Group;
