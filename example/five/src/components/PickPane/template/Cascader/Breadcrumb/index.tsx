import React, { useMemo } from "react";

import { Breadcrumb } from "antd";
import { BreadcrumbItemProps, BreadcrumbProps } from "antd/lib/breadcrumb";

import { PickTreeNode } from "../utils";

export interface CasBreadcrumbItem extends BreadcrumbItemProps {}

export interface CascaderBreadcrumbProps<T> extends BreadcrumbProps {
  paths: (CasBreadcrumbItem & T)[];
  breadcrumbPropName?: string | ((path: T) => React.ReactNode);
  /** 路径切换回调 */
  onPathChange?: (path: T) => void;
}

export const CascaderBreadcrumb = <T extends PickTreeNode = PickTreeNode>(
  props: CascaderBreadcrumbProps<T>
) => {
  const {
    paths,
    breadcrumbPropName = "breadcrumbName",
    onPathChange,
    ...breadcrumbProps
  } = props;

  const itemsNodes = useMemo(() => {
    const handleClick = (e: any, path: any) => {
      path?.onClick?.(e);
      onPathChange?.(path);
    };
    return paths?.map((path, i) => {
      const computedName =
        typeof breadcrumbPropName === "function"
          ? breadcrumbPropName(path) ?? (path as any)["breadcrumbName"] // 兼容breadcrumbPropName函数执行为空情况
          : (path as any)[breadcrumbPropName];
      return (
        <Breadcrumb.Item
          key={path?.key ?? i}
          dropdownProps={path?.dropdownProps}
          onClick={(e) => handleClick(e, path)}
          href={path?.href}
          overlay={path?.overlay}
        >
          {computedName}
        </Breadcrumb.Item>
      );
    });
  }, [breadcrumbPropName, onPathChange, paths]);

  return <Breadcrumb {...breadcrumbProps}>{itemsNodes}</Breadcrumb>;
};
