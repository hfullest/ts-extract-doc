import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import InfiniteScroll from "react-infinite-scroller";

import { BreadcrumbProps } from "antd/lib/breadcrumb";
import List, { ListProps } from "antd/lib/list";
import { TreeProps } from "antd/lib/tree";
import classNames from "classnames";

import { IconFont } from "@/components/IconFont";
import { AuthingSpin } from "@/ui-components-next/AuthingSpin";
import { Empty } from "@/ui-components-next/Empty";
import { SimpleCheckbox } from "@/ui-components-next/SimpleCheckboxV2";
import { SimpleSearch } from "@/ui-components-next/SimpleSearch";

import { usePagination } from "@/hooks/usePagination";
import i18n from "@/locales";

import { PartialPickPaneMustRequired } from "../../interface";
import { computePropName } from "../../utils";
import { CascaderBreadcrumb } from "./Breadcrumb";
import styles from "./style.module.less";
import {
  AuxOptions,
  DataNodeType,
  PickTreeNode,
  activeSymbol,
  buildLevelMap,
  checkStatSymbol,
  childrenSymbol,
  conductCheck,
  flatTree,
  indexSymbol,
  isCheckDisabled,
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
  activeSymbol,
  keySymbol,
  childrenSymbol,
  isLeafSymbol,
};

export type { PickTreeNode };

const t = i18n.t.bind(i18n);

export interface PickCascaderProps<T extends any = PickTreeNode>
  extends PartialPickPaneMustRequired<T>,
    Omit<
      ListProps<T>,
      "dataSource" | "renderItem" | "loading" | "pagination" | "loadMore"
    > {
  placeholder?: string;

  /** 叶子节点标志属性名 默认`isLeaf` */
  isLeafPropName?: keyof T | null | ((value: T) => boolean);
  /** 唯一字段属性名 默认 `key`*/
  keyPropName?: keyof T | null | ((value: T) => string);
  /** 嵌套子元素属性名 默认 `children` */
  childrenPropName?: keyof T | null | ((value: T) => T[]);
  /** 标题属性名  默认为`title` */
  titlePropName?: keyof T | null | ((value: T) => React.ReactNode);
  /** 描述属性名 默认为 `desc` */
  descPropName?: keyof T | null | ((value: T) => React.ReactNode);
  /** 头像属性名 默认 `avatar` */
  avatarPropName?: keyof T | null | ((value: T) => React.ReactNode);
  /** 面包屑展示属性名 默认取与`titlePropName`的值相同 */
  breadcrumbPropName?: keyof T | null | ((value: T) => React.ReactNode);
  /** 请求接口配置 */
  request(
    options: {
      page: number;
      limit: number;
      /** 搜索关键词 */
      searchKey?: string;
    },
    scene?: "init" | "scroll" | "child" | "search",
    node?: T | null
  ): Promise<T[]> | Promise<{ list: T[]; total: number }>;
  /** 是否展示搜索框，默认`true` */
  showSearch?: boolean;
  /** 是否展示全选框  默认`true` */
  showCheckAll?: boolean;
  /** 是否使用滚动加载，和`pagination`互斥，且优先级比`pagination`低，
   * 如果未开启分页功能，则默认使用滚动懒加载，也可手动关闭懒加载
   */
  scrollLoad?: boolean;
  loadingConfig?: Exclude<ListProps<T>["loading"], boolean>;
  pagination?: ListProps<T>["pagination"] | boolean;
  /** 列表最大高度，注意不是整个组件的最大高度 */
  maxHeight?: React.CSSProperties["maxHeight"];
  /** 列表最小高度，注意不是整个组件的最小高度 */
  minHeight?: React.CSSProperties["minHeight"];
  /** 列表高度，注意不是整个组件的高度 */
  height?: React.CSSProperties["height"];
  /** 保留数据的模式 默认`only-child`
   *
   *  - `only-child` 只保留子节点
   *  - `priority-parent` 优先保留父节点(如果子节点全选则仅保留父节点)
   *  - `all` 父节点和子节点都保留
   */
  preserveDataMode?: "only-child" | "priority-parent" | "all";
  /** 是否保留节点辅助属性，默认`false`,如果启用该属性，需要通过`symbol`才能获取属性 */
  preserveAuxiliaryProps?: boolean;
  /** 是否使用懒加载，点击加载并进入下级节点，默认`false` */
  usingLazyLoad?: boolean;
  /** 计数区域定制 */
  counter?:
    | boolean
    | ((
        /** 当前层级`checked`节点和当前层级所有节点 */
        current: [checkedNodes: T[], nodes: T[]],
        /** 全局`checked`节点和全局所有节点 */
        global: [checkedNodes: T[], nodes: T[]]
      ) => React.ReactNode);
  /** 虚拟根节点名称
   *
   *  当数据的顶级为多个子节点集合时，为了让顶层子节点展示全需要在此基础上设置虚拟根节点
   *  虚拟根节点不参与计算，只进行展示
   *  如果设置为`false`，则不启用虚拟根节点，可手动指定`ReactNode`，默认为`root`
   */
  virtualRootNode?: false | React.ReactNode;
  /** 面包屑配置 */
  breadcrumbProps?: BreadcrumbProps;
  /** 无数据展示的页面 */
  emptyText?: React.ReactNode | (() => React.ReactNode);
  /** 自定义规则 根据规则处理节点数据 */
  rules?: {
    /** 复选规则 */
    checkable?: (
      node: T,
      allNodesMap: Map<string, T & DataNodeType>
    ) => boolean;
    disabledCheckbox?: (
      node: T,
      allNodesMap: Map<string, T & DataNodeType>
    ) => boolean;
    /** 禁用规则 */
    disabled?: (node: T, allNodesMap: Map<string, T & DataNodeType>) => boolean;
  };
}

export const PickCascader = <T extends PickTreeNode = PickTreeNode>(
  props: PickCascaderProps<T>
) => {
  const {
    placeholder,
    avatarPropName = "avatar" as keyof T,
    titlePropName = "title" as keyof T,
    descPropName = "desc" as keyof T,
    keyPropName = "key" as keyof T,
    childrenPropName = "children" as keyof T,
    isLeafPropName = "isLeaf",
    value,
    onChange,
    request,
    pagination: initialPagination,
    showSearch = true,
    maxHeight,
    minHeight,
    height,
    scrollLoad = true,
    loadingConfig,
    preserveDataMode = "only-child",
    preserveAuxiliaryProps = false,
    showCheckAll = true,
    breadcrumbPropName = titlePropName,
    usingLazyLoad = false,
    counter,
    virtualRootNode = "root",
    breadcrumbProps,
    rules = {},
    emptyText = <Empty />,
    ...restProps
  } = props;
  const [, setUpdate] = useState({});
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const requestRef = useRef(request);
  const onChangeRef = useRef(onChange);
  const counterRef = useRef(counter);
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
  const treeDepStr = JSON.stringify(
    treeMapValues.map((it) => it[keySymbol].value)
  );
  const [levelMap] = useMemo<
    [Map<number, Set<T & DataNodeType>>, number]
  >(() => {
    if (!treeDepStr) return [new Map() as any, 1]; // 仅仅利用依赖进行更新
    return buildLevelMap(treeMapRef.current);
  }, [treeDepStr]);

  const defaultPagination = useRef({
    current: 1,
    pageSize: 10,
    total: 0,
    ...(initialPagination as ListProps<T>["pagination"]),
  });
  const [pagination, setPagination] = usePagination({
    showSizeChanger: false,
    ...defaultPagination.current,
  });

  const requestNeedExtraRef = useRef<AuxOptions>({
    keyPropName,
    childrenPropName,
    isLeafPropName,
    rules,
  });

  /** 同步获取接口请求状态，避免重复请求 */
  const isLoadingDataRef = useRef(false);
  /** 是否初始化完成 */
  const isInitialedRef = useRef(false);

  const currentNode = useMemo(
    () => treeMapRef.current.get(currentKey!) ?? null,
    [currentKey]
  );

  const currentNodesMap = useMemo<Map<string, T & DataNodeType>>(() => {
    const node = currentNode;
    const children = node
      ? node?.[childrenSymbol].value ?? []
      : Array.from(levelMap.get(1) ?? []);
    return new Map(children.map((it) => [it[keySymbol].value, it])) as any;
  }, [currentNode, levelMap]);

  const currentChecksDepStr = JSON.stringify(
    Array.from(currentNodesMap.values()).map((it) => it[checkStatSymbol])
  );

  const currentChecks = useMemo(() => {
    const checkedKeys = new Set<string>();
    const halfCheckedKeys = new Set<string>();
    if (currentChecksDepStr) checkedKeys.keys(); // 仅仅利用依赖进行更新
    currentNodesMap.forEach((it) => {
      const checkStatus = it[checkStatSymbol];
      const key = it[keySymbol].value;
      if (checkStatus === "checked") checkedKeys.add(key);
      else if (checkStatus === "halfChecked") halfCheckedKeys.add(key);
    });
    return { checkedKeys, halfCheckedKeys };
  }, [currentChecksDepStr, currentNodesMap]);

  /** 当前节点可选(参与计算)的子节点 */
  const currentNodeCheckableChildren = useMemo(() => {
    const processChildren = Array.from(currentNodesMap.values());
    const children: typeof processChildren = [];
    while (processChildren.length) {
      const cur = processChildren.shift();
      if (!cur) continue;
      const disabled = isCheckDisabled(cur);
      if (disabled) {
        const nextChildren: any[] = cur[childrenSymbol].value ?? [];
        if (nextChildren.length) processChildren.push(...nextChildren);
      } else {
        children.push(cur);
      }
    }
    return children;
  }, [currentNodesMap]);

  const usingScrollLoadMore = useMemo(
    () => !initialPagination && !!scrollLoad,
    [initialPagination, scrollLoad]
  );
  const hasMore = useMemo(() => {
    const node = currentNode;
    return currentNodesMap.size < (node?.[paginationSymbol]?.total ?? 0);
  }, [currentNode, currentNodesMap.size]);

  const paths = useMemo(() => {
    const node = currentNode;
    const finalPaths = node?.[positionSymol] ?? [];
    if (
      virtualRootNode !== false &&
      !finalPaths.find((it) => it[keySymbol].value === null)
    ) {
      const virtualPath = {
        [keySymbol]: { value: null },
        [breadcrumbPropName as string]: virtualRootNode,
        breadcrumbName: virtualRootNode, //为了做兼容
      };
      finalPaths.unshift(virtualPath as any);
    }
    return finalPaths;
  }, [breadcrumbPropName, currentNode, virtualRootNode]);

  const handleRequest = useCallback<
    (
      ...params: Parameters<typeof request>
    ) => Promise<{ list: T[]; total: number }>
  >(
    (...params) => {
      if (typeof requestRef.current !== "function") return Promise.reject([]);
      setLoading(true);
      return requestRef
        .current(...params)
        .then((data: any) => {
          const { list, total } = Array.isArray(data)
            ? { list: data, total: data?.length }
            : data;
          setPagination({ total });
          return { list, total };
        })
        .finally(() => setLoading(false));
    },
    [setPagination]
  );

  const handleSearch = useCallback((value: string) => setKeyword(value), []);

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

  const handleLoadData = useCallback<
    (
      scene: Parameters<typeof request>[1]
    ) => Promise<{ list: T[]; total: number }>
  >(
    (scene) => {
      if (loading || !usingLazyLoad) return Promise.reject();
      const node = currentNode;
      const {
        pageSize: limit = defaultPagination.current.pageSize,
        current: page = defaultPagination.current.current,
      } = node?.[paginationSymbol] ?? {};
      const currentPage = page + 1;
      return (
        handleRequest?.(
          { page: currentPage, limit, searchKey: keyword },
          scene,
          node
        ).then(({ list: data, total }) => {
          const map = flatTree(
            data ?? [],
            node,
            treeMapRef.current,
            requestNeedExtraRef.current
          );
          Array.from(map.entries()).forEach(([key, item]) =>
            treeMapRef.current.set(key, item as any)
          );
          if (node) {
            node[paginationSymbol] = {
              current: currentPage,
              pageSize: limit,
              total,
            };
          }
          setUpdate({});
          return { list: data, total };
        }) ?? Promise.resolve()
      );
    },
    [currentNode, handleRequest, keyword, loading, usingLazyLoad]
  );

  const handleLoadMore = useCallback<(page: number) => void>(() => {
    handleLoadData("scroll").catch((_) => _);
  }, [handleLoadData]);

  const handleNext = useCallback((key: string) => setCurrentKey(key), []);

  const handleCheckAll = useCallback(
    (e) => {
      const checked = e?.target?.checked;
      const keys = new Set(checkCollectRef.current.keys());
      const checkedKeys = new Set(
        Array.from(keys).filter(
          (k) => treeMapRef.current.get(k)?.[checkStatSymbol] === "checked"
        )
      );
      const halfCheckedKeys = new Set(
        Array.from(keys).filter(
          (k) => treeMapRef.current.get(k)?.[checkStatSymbol] === "halfChecked"
        )
      );
      const children = currentNodeCheckableChildren;
      if (!checked) {
        children.forEach((it) => checkedKeys.delete(it[keySymbol].value));
      } else {
        children.forEach((it) => checkedKeys.add(it[keySymbol].value));
      }
      children.forEach((it) => halfCheckedKeys.delete(it[keySymbol].value));

      handleCheckedChange(
        {
          checked: Array.from(checkedKeys),
          halfChecked: Array.from(halfCheckedKeys),
        },
        { checked } as any
      );
    },
    [currentNodeCheckableChildren, handleCheckedChange]
  );

  const handlePathChange = useCallback<(path: T & DataNodeType) => void>(
    (path) => {
      const key = path[keySymbol].value ?? null;
      setCurrentKey(key);
    },
    []
  );

  const renderItem = useCallback<
    NonNullable<ListProps<T & DataNodeType>["renderItem"]>
  >(
    (item, i) => {
      const key = item[keySymbol].value;
      const node = treeMapRef.current.get(key) ?? null;
      const activity = node?.[activeSymbol]?.();

      const checkedKeys = new Set(
        checkCollectValues
          .filter((it) => it[checkStatSymbol] === "checked")
          .map((it) => it[keySymbol].value)
      );
      const halfCheckedKeys = new Set(
        checkCollectValues
          .filter((it) => it[checkStatSymbol] === "halfChecked")
          .map((it) => it[keySymbol].value)
      );
      const checked = checkedKeys.has(key);
      const halfChecked = halfCheckedKeys.has(key);

      const nextChecked = !checked; // 要设置的状态，将之前的状态反选

      if (nextChecked) {
        if (!checkedKeys.has(key)) checkedKeys.add(key);
      } else {
        checkedKeys.delete(key);
        halfCheckedKeys.delete(key);
      }

      const handleClickStepIn: React.HtmlHTMLAttributes<any>["onClick"] = (
        e
      ) => {
        e.stopPropagation();
        if (activity?.disabled) return;
        handleNext(key);
      };
      const handleClickItem = () => {
        handleCheckedChange(
          {
            checked: Array.from(checkedKeys),
            halfChecked: Array.from(halfCheckedKeys),
          },
          { checked: nextChecked } as any
        );
      };

      // 叶子结点判断属性如果为undefined ，则判断该节点是否有子节点属性存在且长度是否不为0
      const showNextIcon =
        node?.[isLeafSymbol].value === false ||
        !!node?.[childrenSymbol].value?.length;

      return (
        <List.Item
          className={classNames(styles.listItem, {
            disabled: activity?.disabled,
          })}
          onClick={handleClickItem}
          extra={
            !!showNextIcon && (
              <IconFont
                type="authing-arrow-right-s-line"
                onClick={handleClickStepIn}
              />
            )
          }
        >
          {!!(activity?.checkable ?? true) && ( // 默认可选
            <SimpleCheckbox
              disabled={activity?.disabled ?? activity?.disableCheckbox}
              checked={!!checked}
              indeterminate={!checked && halfChecked}
            />
          )}
          <List.Item.Meta
            avatar={computePropName(item, avatarPropName, "avatar")}
            title={computePropName(item, titlePropName)}
            description={computePropName(item, descPropName)}
          />
        </List.Item>
      );
    },
    [
      avatarPropName,
      checkCollectValues,
      descPropName,
      handleCheckedChange,
      handleNext,
      titlePropName,
    ]
  );

  const renderList = useMemo(() => {
    return (
      <List
        bordered={false}
        itemLayout="horizontal"
        {...restProps}
        locale={{ ...restProps, emptyText }}
        loading={
          loading && {
            indicator: <AuthingSpin newIndicator />,
            ...loadingConfig,
          }
        }
        pagination={initialPagination && pagination}
        dataSource={Array.from(currentNodesMap.values()) as any}
        renderItem={renderItem}
        style={{ ...restProps.style, maxHeight, minHeight, height }}
      />
    );
  }, [
    currentNodesMap,
    emptyText,
    height,
    initialPagination,
    loading,
    loadingConfig,
    maxHeight,
    minHeight,
    pagination,
    renderItem,
    restProps,
  ]);

  const checkedAll = useMemo(() => {
    if (checkColDepStr) {
      // 仅仅利用依赖进行更新
    }
    const checkedChildren = currentNodeCheckableChildren.filter((it) =>
      ["checked"].includes(it[checkStatSymbol])
    );
    return (
      checkedChildren.length > 0 &&
      checkedChildren.length === currentNodeCheckableChildren.length
    );
  }, [currentNodeCheckableChildren, checkColDepStr]);

  const halfCheckedAll = useMemo(() => {
    if (checkColDepStr) {
      // 仅仅利用依赖进行更新
    }
    const checkedChildren = currentNodeCheckableChildren.filter((it) =>
      ["checked"].includes(it[checkStatSymbol])
    );
    return (
      checkedChildren.length > 0 &&
      checkedChildren.length !== currentNodeCheckableChildren.length
    );
  }, [checkColDepStr, currentNodeCheckableChildren]);

  const breadcrumbNameRender = useCallback<(path: T) => React.ReactNode>(
    (path) => computePropName(path, breadcrumbPropName),
    [breadcrumbPropName]
  );

  const computedCounter = useMemo(() => {
    const defaultCounter = `${checkedValues.length}/${treeMapRef.current.size}`;
    if (counterRef.current === true) return defaultCounter;
    type CounterParameters = Parameters<
      Extract<NonNullable<typeof counterRef.current>, Function>
    >;
    if (typeof counterRef.current === "function") {
      const current = [
        Array.from(currentChecks.checkedKeys.keys()).map((k) =>
          currentNodesMap.get(k)
        ),
        Array.from(currentNodesMap.values()),
      ] as CounterParameters[0];
      const global = [checkedValues, treeMapValues] as CounterParameters[1];
      return counterRef.current?.(current, global);
    }
    return null;
  }, [
    checkedValues,
    currentChecks.checkedKeys,
    currentNodesMap,
    treeMapValues,
  ]);

  //回填分页信息
  useEffect(() => {
    const node = currentNode;
    const pageInfo = node?.[paginationSymbol] ?? defaultPagination.current;
    setPagination(pageInfo);
  }, [currentNode, setPagination]);

  // 绑定传递值和状态值
  useEffect(() => {
    if (!Array.isArray(value) || loading) return;
    let checked = true;
    let checkedNodes = value
      .map(
        (it) =>
          treeMapRef.current.get(
            computePropName(
              it,
              requestNeedExtraRef.current.keyPropName as any
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

  // onChange 回调
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

  // 初始化数据和筛选请求接口
  useEffect(() => {
    if (treeMapRef.current.has(currentKey!) || isInitialedRef.current) return;
    handleRequest(
      {
        limit: defaultPagination.current.pageSize,
        page: defaultPagination.current.current,
      },
      "init",
      null
    )
      .then(({ list: data }) => {
        const map = flatTree(
          data ?? [],
          null,
          treeMapRef.current,
          requestNeedExtraRef.current
        );
        if (!map.size) return; // 没有数据改动跳过
        Array.from(map.entries()).forEach(([key, item]) =>
          treeMapRef.current.set(key, item)
        );
        setUpdate({});
      })
      .finally(() => (isInitialedRef.current = true));
  }, [currentKey, handleRequest]);

  // 切换currentKey时懒加载数据
  useEffect(() => {
    if (
      !isLoadingDataRef.current &&
      currentNode &&
      !currentNode?.[childrenSymbol].value
    ) {
      isLoadingDataRef.current = true;
      handleLoadData("child")
        .catch((_) => _)
        .finally(() => (isLoadingDataRef.current = false));
    }
  }, [currentNode, handleLoadData]);

  // 处理虚拟根节点
  useEffect(() => {
    // 如果设置不启用虚拟根节点并且树顶层根节点仅有一个节点，且该节点有子节点，则默认将其设为根节点
    if (virtualRootNode === false && levelMap.get(1)?.size === 1) {
      const node = Array.from(levelMap.get(1)!)[0];
      if (!node[childrenSymbol].value?.length) return;
      const key = node[keySymbol].value;
      setCurrentKey(key ?? null);
    }
  }, [levelMap, virtualRootNode]);

  return (
    <div aria-label="cascader-tree" className={styles.pickCascader}>
      {showSearch && (
        <SimpleSearch
          prefix={
            <IconFont type="authing-search-line" style={{ color: "#8a92a6" }} />
          }
          width="100%"
          isNewStyle
          onSearch={handleSearch}
          placeholder={placeholder}
        />
      )}
      <CascaderBreadcrumb<T & DataNodeType>
        {...breadcrumbProps}
        paths={paths as any[]}
        breadcrumbPropName={breadcrumbNameRender}
        onPathChange={handlePathChange}
      />
      {!!showCheckAll && (
        <div className={styles.checkAll}>
          <SimpleCheckbox
            onChange={handleCheckAll}
            checked={checkedAll}
            indeterminate={halfCheckedAll}
          >
            {t("common.checkAll")}
          </SimpleCheckbox>
          <span className={styles.total}>{computedCounter}</span>
        </div>
      )}
      {usingScrollLoadMore ? (
        <div
          className={styles.infiniteScroll}
          style={{ height: "100%", overflowY: "auto" }}
        >
          <InfiniteScroll
            loadMore={handleLoadMore}
            useWindow={false}
            initialLoad={false}
            hasMore={hasMore}
          >
            {renderList}
          </InfiniteScroll>
        </div>
      ) : (
        renderList
      )}
    </div>
  );
};
