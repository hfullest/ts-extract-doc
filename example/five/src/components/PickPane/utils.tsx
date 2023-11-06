import React from "react";

import { Avatar } from "antd";

export const computePropName = <T extends any = any>(
  item: T,
  prop: keyof T | null | ((value: T) => React.ReactNode),
  type: "avatar" | "normal" = "normal"
) => {
  const computed:any = typeof prop === "function" ? prop(item) : item?.[prop!];
  if (type === "avatar") {
    const computedAva = !computed ? null : typeof computed === "string" ? (
      <Avatar src={computed} shape="circle" />
    ) : React.isValidElement(computed) ? (
      computed
    ) : (
      <Avatar shape="circle" size={28} {...computed} />
    );
    return computedAva;
  }
  return computed;
};
