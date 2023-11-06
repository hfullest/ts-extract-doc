// TODO 将所有使用 css font 方式的图标改为这个组件
import React, { FC } from "react";
// import "./style.less";
import classnames from "classnames";

export interface IconFontParams extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * 图标名称
   * @description 使用需要在对应的图标名称前加上 `authing-`前缀
   *
   * @example
   *  图标名称为 `add-circle-line`，则使用 `authing-add-circle-line`
   *
   * 图标名称参考：
   * @link https://www.figma.com/file/eUH1nYLriNLcQyj1fYFLFs/Authing-Design-System?node-id=0%3A608
   */
  type: string;
  style?: React.CSSProperties;
  fill?: string;
  /**图标尺寸 */
  size?: string | number;
}

export const IconFont: FC<IconFontParams> = (params) => {
  const { type, style, className, fill, size, ...rest } = params;
  const sizeStyle = size ? { fontSize: `${parseFloat(size as string)}px` } : {};
  return (
    <span
      style={{ ...style, ...sizeStyle }}
      {...rest}
      className={classnames(className, "anticon", "authing-icon")}
    >
      <svg width="1em" height="1em" fill={fill ? fill : "currentColor"}>
        <use xlinkHref={`#${type}`}></use>
      </svg>
    </span>
  );
};
