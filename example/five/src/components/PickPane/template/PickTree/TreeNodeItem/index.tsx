import React from "react";

import List, { ListItemMetaProps } from "antd/lib/list";
import classNames from "classnames";

import { PickTreeNode } from "../utils";
import styles from "./style.module.less";

export interface TreeNodeItemProps<T extends PickTreeNode = PickTreeNode>
  extends ListItemMetaProps {
  dataNode: T;
  selected?: boolean | null | ((dataNode: T) => boolean);
  /** 半选状态 */
  halfSelected?: boolean | ((dataNode: T) => boolean);
  onSelectedChange?: (checked: boolean, node: T) => void;
}
export const TreeNodeItem = <T extends PickTreeNode = PickTreeNode>(
  props: TreeNodeItemProps<T>
) => {
  const { title, avatar, description } = props;
  return (
    <div className={classNames(styles.treeNodeItem)}>
      <List.Item className={styles.itemMetaWrapper}>
        <List.Item.Meta
          title={title}
          avatar={avatar}
          description={description}
        />
      </List.Item>
    </div>
  );
};
