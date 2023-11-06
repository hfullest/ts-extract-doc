import React, { useMemo } from "react";

import { Tabs } from "antd";
import { TabPaneProps, TabsProps } from "antd/lib/tabs";
import classNames from "classnames";

import { PickBox } from "../../PickBox";
import {
  IPick,
  PartialPickPaneMustRequired,
  PickPaneMustRequired, // eslint-disable-next-line @typescript-eslint/no-unused-vars
  PickRenderType,
} from "../../interface";
import styles from "./style.module.less";

export interface TabItemProps<D = any> extends TabPaneProps {
  /** 对应 activeKey
   *
   * 注意：在当前`4.7.0`版本，使用 key 作为`activeKey`，为了兼容后续版本，这里对`key`和`tabKey`做了兼容，只需要填`tabKey`即可*/
  key?: string;
  /** 对应 activeKey */
  tabKey: string;
  /** 渲染器 支持两种方式
   *
   * - 使用已定义的模板作为嵌套
   * - 使用自定义渲染器，参考 {@link PickRenderType}
   */
  renderer?: Omit<IPick<D>, keyof PickPaneMustRequired<D>>;
}
export interface TabsChannelProps<D = any>
  extends PartialPickPaneMustRequired<D> {
  /** 面板配置 */
  tabPanes: TabItemProps<D>[];
  tabsConfig?: TabsProps;
}

export const TabsChannel = <D extends unknown = any>(
  props: TabsChannelProps<D>
) => {
  const { value, onChange, tabPanes, tabsConfig } = props;
  const renderPanes = useMemo(() => {
    return tabPanes?.map((it, i) => {
      const { renderer, tabKey, key = tabKey, children, ...rest } = it;
      const renderChildren = renderer ? (
        <PickBox {...(renderer as IPick)} value={value!} onChange={onChange} />
      ) : (
        children
      );
      return (
        <Tabs.TabPane key={key ?? i} {...rest}>
          {renderChildren}
        </Tabs.TabPane>
      );
    });
  }, [onChange, tabPanes, value]);
  return (
    <div aria-label="tab-channel" className={styles.tabsChannel}>
      <Tabs
        {...tabsConfig}
        className={classNames(tabsConfig?.className, styles.tabs)}
      >
        {renderPanes}
      </Tabs>
    </div>
  );
};
