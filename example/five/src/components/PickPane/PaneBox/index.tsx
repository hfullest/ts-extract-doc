import React, { useCallback, useEffect, useMemo, useState } from "react";

import { List } from "antd";
import { ListProps } from "antd/lib/list";

import { IconFont } from "@/components/IconFont";
import { Empty } from "@/ui-components-next/Empty";
import { UiButton } from "@/ui-components-next/UiButton";

import i18n from "@/locales";

import { IPane } from "../interface";
import { computePropName } from "../utils";
import styles from "./style.module.less";

export const PaneBox = <T extends unknown = any>(props: IPane<T>) => {
  const {
    value,
    header,
    clearBtnText = i18n.t("application.delete"),
    showAllClear = true,
    onChange,
    emptyText = <Empty />,
    titlePropName = "title" as keyof T,
    descPropName = "desc" as keyof T,
    avatarPropName = "avatar" as keyof T,
    keyPropName = titlePropName as keyof T,
  } = props;
  const [dataSource, setDataSource] = useState<T[]>([]);
  useEffect(() => setDataSource(value), [value]);

  const handleChange = useCallback<(v: T[]) => void>(
    (values) => {
      setDataSource(values);
      onChange?.(values);
    },
    [onChange]
  );

  const handleItemClear = useCallback<(item: T, i: number) => () => void>(
    (item, index) => () => {
      const filterItems = dataSource?.filter(
        (it, i) =>
          !(
            computePropName(item, keyPropName) &&
            Object.is(
              computePropName(it, keyPropName),
              computePropName(item, keyPropName)
            ) &&
            index === i
          )
      );
      handleChange(filterItems);
    },
    [dataSource, handleChange, keyPropName]
  );
  const handleClearAll = useCallback(() => handleChange([]), [handleChange]);
  const computedHeader = useMemo(() => {
    const headerElement =
      typeof header === "function" ? header(dataSource) : header;
    return (
      <>
        {headerElement}
        {showAllClear && (
          <UiButton
            type="link"
            className={styles.clearAllBtn}
            padding={false}
            onClick={handleClearAll}
          >
            {clearBtnText}
          </UiButton>
        )}
      </>
    );
  }, [clearBtnText, dataSource, handleClearAll, header, showAllClear]);

  const renderItem = useCallback<NonNullable<ListProps<T>["renderItem"]>>(
    (item, i) => {
      return (
        <List.Item
          actions={[
            <span className="icon-close" onClick={handleItemClear(item, i)}>
              <IconFont type="authing-close-fill" />
            </span>,
          ]}
        >
          <List.Item.Meta
            avatar={computePropName(item, avatarPropName, "avatar")}
            title={computePropName(item, titlePropName)}
            description={computePropName(item, descPropName)}
          />
        </List.Item>
      );
    },
    [avatarPropName, descPropName, handleItemClear, titlePropName]
  );
  return (
    <div className={styles.paneBox}>
      <List
        bordered={false}
        header={computedHeader}
        itemLayout="horizontal"
        dataSource={dataSource}
        renderItem={renderItem}
        locale={{ emptyText }}
      />
    </div>
  );
};
