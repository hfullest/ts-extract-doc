import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Tree } from "antd";
import { TreeProps } from "antd/lib/tree";
import classNames from "classnames";

import { IconFont } from "@/components/IconFont";
import { AuthingSpin } from "@/ui-components-next/AuthingSpin";
import { SimpleCheckbox } from "@/ui-components-next/SimpleCheckboxV2";
import { SimpleSearch } from "@/ui-components-next/SimpleSearch";

import i18n from "@/locales";

import { PartialPickPaneMustRequired } from "../../interface";
import { computePropName } from "../../utils";
import { TreeNodeItem } from "./TreeNodeItem";
import styles from "./style.module.less";
import {
  AuxOptions,
  DataNode,
  DataNodeType,
  PickTreeNode,
  buildTree,
  checkStatSymbol,
  childrenSymbol,
  conductCheck,
  flatTree,
  indexSymbol,
  isLeafSymbol,
  keySymbol,
  levelSymbol,
  paginationSymbol,
  parentSymbol,
  positionSymol,
  wipeAuxiliary,
} from "./utils";

// 导出symbol操作属性，方便需要时导入使用
export {
  parentSymbol,
  checkStatSymbol,
  levelSymbol,
  indexSymbol,
  positionSymol,
  paginationSymbol,
  keySymbol,
  childrenSymbol,
  isLeafSymbol,
};

export type { PickTreeNode };

const t = i18n.t.bind(i18n);

export interface PickTreeProps<T extends any = PickTreeNode>
  extends PartialPickPaneMustRequired<PickTreeNode>,
    Omit<TreeProps, "titleRender" | "treeData" | "filterTreeNode"> {
  /** 是否展示搜索框，默认`true` */
  showSearch?: boolean;
  /** 是否展示全选框 */
  showCheckAll?: boolean;
  placeholder?: string;
  /** 子级属性名 */
  childrenPropName?: keyof T | null;
  /** 叶子节点标志属性名 默认`isLeaf` */
  isLeafPropName?: keyof T | null;
  /** 唯一字段属性名 默认 `key`*/
  keyPropName?: keyof T | null | ((value: T) => string);
  /** 标题属性名  默认为`title` */
  titlePropName?: keyof T | null | ((value: T) => React.ReactNode);
  /** 描述属性名 默认为 `desc` */
  descPropName?: keyof T | null | ((value: T) => React.ReactNode);
  /** 头像属性名 默认 `avatar` */
  avatarPropName?: keyof T | null | ((value: T) => React.ReactNode);
  request?: (
    params?: {
      searchKey?: string;
    },
    scene?: "init" | "lazy",
    node?: T | null
  ) => Promise<T[]>;
  /** 是否使用懒加载，点击展开图标进行懒加载 */
  usingLazyLoad?: boolean;
  /** 过滤函数 */
  filterNode?: (searchKey: string, node: T) => boolean;
  /** 保留数据的模式 默认`only-child`
   *
   *  - `only-child` 只保留子节点
   *  - `priority-parent` 优先保留父节点(如果子节点全选则仅保留父节点)
   *  - `all` 父节点和子节点都保留
   */
  preserveDataMode?: "only-child" | "priority-parent" | "all";
  /** 是否保留节点辅助属性，默认`false`,如果启用该属性，需要通过`symbol`才能获取属性 */
  preserveAuxiliaryProps?: boolean;
}

export const PickTree = <T extends PickTreeNode = PickTreeNode>(
  props: PickTreeProps<T>
) => {
  const {
    value = [],
    onChange,
    showSearch = true,
    placeholder,
    keyPropName = "key" as keyof T,
    childrenPropName = "children" as keyof T,
    isLeafPropName = "isLeaf" as keyof T,
    titlePropName = "title" as keyof T,
    avatarPropName = "avatar" as keyof T,
    descPropName = "desc" as keyof T,
    request,
    usingLazyLoad = false,
    filterNode,
    preserveDataMode = "only-child",
    preserveAuxiliaryProps = false,
    showCheckAll = true,
    ...treeProps
  } = props;

  if (!Array.isArray(value)) {
    console.error(`value值类型必须为数组`);
  }
  const [, setUpdate] = useState({});
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const requestRef = useRef(request);
  const onChangeRef = useRef(onChange);
  /** 记录树结构所有节点集合 */
  const treeMapRef = useRef<Map<string, T & DataNodeType>>(new Map());
  /** 记录所有已选和半选的节点集合 */
  const checkCollectRef = useRef<Map<string, T & DataNodeType>>(new Map());
  const treeMapValues = Array.from(treeMapRef.current.values());
  const checkCollectValues = Array.from(checkCollectRef.current.values());
  const checkedValues = checkCollectValues.filter(
    (it) => it[checkStatSymbol] === "checked"
  );
  const checkColDepStr = JSON.stringify(
    checkedValues.map((it) => it[keySymbol].value)
  );

  const requestNeedExtraRef = useRef<AuxOptions>({
    keyPropName,
    childrenPropName,
    isLeafPropName,
  });

  const computedTreeData = useMemo(() => {
    const filterTreeValues =
      typeof filterNode === "function" && keyword
        ? treeMapValues.filter((node) => filterNode(keyword, node) ?? true)
        : treeMapValues;
    return buildTree(filterTreeValues, !!keyword);
  }, [filterNode, keyword, treeMapValues]);
  const computedCheckedKeys = useMemo(() => {
    return {
      checked: checkCollectValues
        .filter((it) => it[checkStatSymbol] === "checked")
        .map((it) => it[keySymbol].value),
      halfChecked: checkCollectValues
        .filter((it) => it[checkStatSymbol] === "halfChecked")
        .map((it) => it[keySymbol].value),
    };
  }, [checkCollectValues]);

  // 绑定传递值和状态值
  useEffect(() => {
    if (!Array.isArray(value) || loading) return;
    let checked = true;
    let checkedNodes = value
      .map(
        (it) =>
          treeMapRef.current.get(
            computePropName(
              it as any,
              requestNeedExtraRef.current.keyPropName!
            ) as string
          )!
      )
      .filter(Boolean);
    if (preserveDataMode === "priority-parent") {
      checked = true;
    } else if (preserveDataMode !== "only-child") {
      // 处理保留父节点逻辑
      const nodeSet = new Set(checkedNodes.map((it) => it[keySymbol].value));
      checked = Array.from(checkCollectRef.current.entries())
        .filter(([, it]) => it[checkStatSymbol] === "checked")
        .every(([key]) => nodeSet.has(key));
    }

    checkCollectRef.current = conductCheck<DataNodeType>(
      checkedNodes,
      checked,
      treeMapRef.current
    ) as typeof checkCollectRef.current;
    setUpdate({});
  }, [loading, preserveDataMode, value]);

  useEffect(() => {
    if (!checkColDepStr) return;
    let values = Array.from(checkCollectRef.current.values()).filter(
      (it) => it[checkStatSymbol] === "checked"
    );
    if (preserveDataMode === "only-child") {
      values = values.filter((it) => !it[childrenSymbol].value?.length); // 过滤父节点，只保留叶子节点
    } else if (preserveDataMode === "priority-parent") {
      const map = new Map(values.map((it) => [it[keySymbol].value, it]));
      const willDeleteKeys = new Set<string>();
      map.forEach((node) => {
        const childrenAllChecked = node[childrenSymbol].value?.every((it) =>
          map.has(it[keySymbol].value)
        );
        if (childrenAllChecked) {
          node[childrenSymbol].value?.forEach((it) =>
            willDeleteKeys.add(it[keySymbol].value)
          );
        }
      });
      willDeleteKeys.forEach((key) => map.delete(key));
      values = Array.from(map.values());
    }
    onChangeRef.current?.(
      preserveAuxiliaryProps ? values : wipeAuxiliary(values)
    );
  }, [checkColDepStr, preserveAuxiliaryProps, preserveDataMode]);

  // 初始化数据
  useEffect(() => {
    setLoading(true);
    requestRef.current?.({ searchKey: keyword }, "init", null).then((data) => {
      const map = flatTree(
        data ?? [],
        null,
        treeMapRef.current,
        requestNeedExtraRef.current
      );
      if (!map.size) return;
      Array.from(map.entries()).forEach(([key, item]) =>
        treeMapRef.current.set(key, item)
      );
      setUpdate({});
      setLoading(false);
    });
  }, [keyword]);

  const handleSearch = useCallback((value: string) => setKeyword(value), []);

  const handleLoadData = useCallback<NonNullable<TreeProps["loadData"]>>(
    (treeNode) => {
      const node =
        treeMapRef.current.get(
          computePropName(
            treeNode as any,
            requestNeedExtraRef.current.keyPropName!
          ) as string
        ) ?? null;
      return (
        requestRef
          .current?.({ searchKey: keyword }, "lazy", node)
          .then((data) => {
            const map = flatTree(
              data ?? [],
              node,
              treeMapRef.current,
              requestNeedExtraRef.current
            );
            if (!map.size) return; // 没有数据改动跳过
            Array.from(map.entries()).forEach(([key, item]) =>
              treeMapRef.current.set(key, item as any)
            );
            setUpdate({});
          }) ?? Promise.resolve()
      );
    },
    [keyword]
  );

  const handleCheckedChange = useCallback<NonNullable<TreeProps["onCheck"]>>(
    (checkStatus, info) => {
      const { checked: checkedKeys } = checkStatus as Exclude<
        typeof checkStatus,
        Array<any>
      >;
      let checked = info.checked;
      const checkedNodes = checkedKeys
        .map((k) => treeMapRef.current.get(k as string)!)
        .filter(Boolean);

      // 处理保留父节点逻辑
      if (preserveDataMode !== "only-child") {
        const nodeSet = new Set(checkedNodes.map((it) => it[keySymbol].value));
        checked = Array.from(checkCollectRef.current.entries())
          .filter(([, it]) => it[checkStatSymbol] === "checked")
          .every(([key]) => nodeSet.has(key));
      }

      checkCollectRef.current = conductCheck<DataNodeType>(
        checkedNodes,
        checked,
        treeMapRef.current
      ) as typeof checkCollectRef.current;
      setUpdate({});
    },
    [preserveDataMode]
  );

  const handleCheckAll = useCallback(
    (e) => {
      const checked = e?.target?.checked;
      const checkedKeys = checked ? Array.from(treeMapRef.current.keys()) : [];
      handleCheckedChange({ checked: checkedKeys, halfChecked: [] }, {
        checked,
      } as any);
    },
    [handleCheckedChange]
  );

  return (
    <div aria-label="normal-tree" className={styles.pickTree}>
      <AuthingSpin newIndicator spinFull clearSpin spinning={loading}>
        {!!showSearch && (
          <SimpleSearch
            prefix={
              <IconFont
                type="authing-search-line"
                style={{ color: "#8a92a6" }}
              />
            }
            width="100%"
            isNewStyle
            onSearch={handleSearch}
            placeholder={placeholder}
          />
        )}
        {!!showCheckAll && (
          <div className={styles.checkAll}>
            <SimpleCheckbox
              onChange={handleCheckAll}
              checked={checkedValues.length === treeMapRef.current.size}
              indeterminate={
                !!checkedValues.length &&
                checkedValues.length !== treeMapRef.current.size
              }
            >
              {t("common.checkAll")}
            </SimpleCheckbox>
            <span className={styles.total}>
              {checkedValues.length}/{treeMapRef.current.size}
            </span>
          </div>
        )}
        <Tree
          blockNode
          checkable
          selectable={false}
          {...treeProps}
          checkStrictly
          checkedKeys={computedCheckedKeys}
          onCheck={handleCheckedChange}
          className={classNames(styles.tree, treeProps.className)}
          loadData={usingLazyLoad ? handleLoadData : undefined}
          treeData={computedTreeData as DataNode[]}
          titleRender={(dataNode: PickTreeNode) => (
            <TreeNodeItem<T>
              dataNode={dataNode as T}
              title={computePropName(dataNode as T, titlePropName)}
              description={computePropName(dataNode as T, descPropName)}
              avatar={computePropName(dataNode as T, avatarPropName, "avatar")!}
            />
          )}
        />
      </AuthingSpin>
    </div>
  );
};
