import { AvatarProps } from "antd/lib/avatar";

import { AllPickTemplates } from "./template";

export type PickPaneAvatarProps =
  | string
  | AvatarProps
  | React.ReactElement
  | null
  | undefined;

export interface IPane<D = any> {
  /** 传进来的列表数据 */
  value: D[];
  /** 内部值变化后的回调 */
  onChange?: (values: D[]) => void;
  /** 唯一字段属性名 默认值和`titlePropName`值相同 */
  keyPropName?: keyof D | null | ((value: D) => string);
  /** 标题属性名  默认为`title` */
  titlePropName?: keyof D | null | ((value: D) => React.ReactNode);
  /** 描述属性名 默认为 `desc` */
  descPropName?: keyof D | null | ((value: D) => React.ReactNode);
  /** 头像属性名 默认 `avatar`  */
  avatarPropName?: keyof D | null | ((value: D) => React.ReactNode);
  /** 内容标题区，支持函数式 */
  header?: React.ReactNode | ((values: D[]) => React.ReactNode);
  /** 全部清除按钮文案 */
  clearBtnText?: string;
  /** 是否展示清除全部按钮 */
  showAllClear?: boolean;
  /** 无数据展示的页面 */
  emptyText?: React.ReactNode | (() => React.ReactNode);
}

export type PickTemplateType<D = any> = IPickTemplateRequired<D>["template"];
export type PickTemplateProps<
  D = any
> = IPickTemplateRequired<D>["templateProps"];

export type PickRenderType<D> =
  | React.ComponentType<PickPaneMustRequired<D>>
  | React.ReactElement<PickPaneMustRequired<D>>;

export interface PickPaneMustRequired<D = any> {
  /** 传进来的列表数据 */
  value: IPane<D>["value"];
  /** 内部值变化后的回调 */
  onChange?: IPane<D>["onChange"];
}

export type PartialPickPaneMustRequired<D = any> = Partial<
  PickPaneMustRequired<D>
>;

export type IPickTemplateRequired<D> = {
  pickRender?: never;
} & AllPickTemplates<D>;

export interface IPickRenderRequired<D> {
  template?: never;
  templateProps?: never;
  /** 自定义渲染选择组件或者组件元素 */
  pickRender: PickRenderType<D>;
}

export type PickTemplateRenderRequired<D = any> =
  | IPickTemplateRequired<D>
  | IPickRenderRequired<D>;

/** PickBox 属性声明 */
interface IBasicPick<D> extends PickPaneMustRequired<D> {}

export type IPick<D = any> = PickTemplateRenderRequired<D> & IBasicPick<D>;

/** PickPane 属性声明 */
export interface BasicPickPaneProps<D>
  extends Partial<PickPaneMustRequired<D>> {
  /**结果面板配置 */
  paneConfig?: Omit<IPane<D>, keyof PickPaneMustRequired<D>>;
  className?: string;
  style?: React.CSSProperties;
  /** 容器宽度 */
  width?: React.CSSProperties["width"];
  /** 容器高度 */
  height?: React.CSSProperties["height"];
}

export type PickPaneProps<D = any> = PickTemplateRenderRequired<D> &
  BasicPickPaneProps<D>;
