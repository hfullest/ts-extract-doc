import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import InfiniteScroll from "react-infinite-scroller";

import { List } from "antd";
import { ListProps } from "antd/lib/list";

import { IconFont } from "@/components/IconFont";
import { AuthingSpin } from "@/ui-components-next/AuthingSpin";
import { Empty } from "@/ui-components-next/Empty";
import { SimpleCheckbox } from "@/ui-components-next/SimpleCheckboxV2";
import { SimpleSearch } from "@/ui-components-next/SimpleSearch";

import { usePagination } from "@/hooks/usePagination";
import i18n from "@/locales";

import { PartialPickPaneMustRequired } from "../../interface";
import { computePropName } from "../../utils";
import styles from "./style.module.less";

const t = i18n.t.bind(i18n);

export interface PickNormalProps<T = any>
  extends PartialPickPaneMustRequired<T>,
    Omit<
      ListProps<T>,
      | "dataSource"
      | "renderItem"
      | "loading"
      | "pagination"
      | "loadMore"
      | "locale"
    > {
  placeholder?: string;
  /** 唯一字段属性名 默认值为`key` */
  keyPropName?: keyof T | null | ((value: T) => string);
  /** 标题属性名  默认为`title` */
  titlePropName?: keyof T | null | ((value: T) => React.ReactNode);
  /** 描述属性名 默认为 `desc` */
  descPropName?: keyof T | null | ((value: T) => React.ReactNode);
  /** 头像属性名 默认 `avatar` */
  avatarPropName?: keyof T | null | ((value: T) => React.ReactNode);
  /** 请求接口配置 */
  request(
    options: {
      page: number;
      limit: number;
      /** 搜索关键词 */
      searchKey?: string;
    },
    /** 接口请求场景，初始化全部数据或者使用搜索框搜索 */
    scene: "init" | "scroll" | "search"
  ): Promise<T[]> | Promise<{ list: T[]; total: number }>;
  /** 是否展示搜索框，默认`true` */
  showSearch?: boolean;
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
  /** 无数据展示的页面 */
  emptyText?: React.ReactNode | (() => React.ReactNode);
  /** 是否展示全选框  默认`true` */
  showCheckAll?: boolean;
  /** 计数区域定制 */
  counter?:
    | boolean
    | ((
        /** `checked`项 */
        checkedItems: T[],
        /** 已经加载的所有列表数据 */
        list: T[]
      ) => React.ReactNode);
  /** 自定义规则 根据规则处理数据 */
  rules?: {
    /** 复选规则 */
    checked?: (item: T, selectedItem?: T[]) => boolean;
    /** 禁用规则 */
    disabled?: (item: T, selectedItem?: T[]) => boolean;
    /** 搜索筛选规则 */
    filter?: (item: T, selectedItem?: T[]) => boolean;
  };
  /** 搜索过滤器，如果指定该函数则将对已有数据进行过滤筛选 */
  searchFilter?: (searchKey: string, items: T) => boolean;
}

export const PickNormal = <T extends any = any>(props: PickNormalProps<T>) => {
  const {
    placeholder,
    avatarPropName = "avatar" as keyof T,
    titlePropName = "title" as keyof T,
    descPropName = "desc" as keyof T,
    keyPropName = "key" as keyof T,
    value: values,
    onChange,
    request,
    pagination: initialPagination,
    showSearch = true,
    maxHeight,
    minHeight,
    height,
    scrollLoad = true,
    loadingConfig,
    showCheckAll = true,
    counter = false,
    rules,
    searchFilter,
    emptyText = <Empty />,
    ...restProps
  } = props;
  const [dataSource, setDataSource] = useState<T[]>([]);
  const [keyword, setKeyword] = useState("");
  const counterRef = useRef(counter);
  const onChangeRef = useRef(onChange);
  const requestRef = useRef(request);
  const searchFilterRef = useRef(searchFilter);
  const [pagination, setPagination] = usePagination({
    showSizeChanger: false,
    ...(initialPagination as ListProps<T>["pagination"]),
  });

  const defaultPageRef = useRef({
    limit: 10,
    page: 1,
    ...(initialPagination as any),
  });

  const { page, limit } = {
    page: pagination.current!,
    limit: pagination.pageSize!,
  };

  const [loading, setLoading] = useState(false);

  const computedDataSource = useMemo(
    () =>
      dataSource
        .filter((it) => rules?.filter?.(it, values) ?? true)
        .filter((it) => searchFilterRef.current?.(keyword, it) ?? true),
    [dataSource, keyword, rules, values]
  );

  const excludeDisabledDataSource = useMemo(
    () =>
      Array.from(computedDataSource).filter(
        (it) => rules?.disabled?.(it, values) ?? true
      ),
    [computedDataSource, rules, values]
  );

  const usingScrollLoadMore = useMemo(
    () => !initialPagination && !!scrollLoad,
    [initialPagination, scrollLoad]
  );

  const handleRequest = useCallback<
    (...params: Parameters<typeof requestRef.current>) => void
  >(
    (...params) => {
      const [reqParams] = params ?? [];
      if (typeof requestRef.current !== "function" || loading) return;
      setLoading(true);
      return Promise.resolve<ReturnType<typeof requestRef.current>>(
        requestRef.current(...params)
      )
        .then((data) => {
          const { list, total } = Array.isArray(data)
            ? ({ list: data, total: data?.length } as any)
            : data ?? {};

          setDataSource((dataSource) => {
            if (
              usingScrollLoadMore &&
              reqParams.page !== defaultPageRef.current.page // page 不为初始页，比如page为1，则不需要合并数据
            ) {
              const map = new Map(
                dataSource
                  .concat(list)
                  .map((it) => [computePropName(it, keyPropName), it])
              );
              return Array.from(map.values());
            }
            return list;
          });
          setPagination((page) => ({
            current: +(reqParams?.page ?? page.current),
            pageSize: +(reqParams?.limit ?? page.pageSize),
            total,
          }));
        })
        .finally(() => setLoading(false));
    },
    [keyPropName, loading, setPagination, usingScrollLoadMore]
  );

  useEffect(() => {
    handleRequest(
      {
        limit: defaultPageRef.current.limit,
        page: defaultPageRef.current.page,
      },
      "init"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      setKeyword(value);
      if (!value) {
        handleRequest({ limit, page: defaultPageRef.current.page }, "init"); // 清空搜索框重新拉取数据
      } else {
        handleRequest(
          { limit, page: defaultPageRef.current.page, searchKey: value },
          "search"
        );
      }
    },
    [handleRequest, limit]
  );

  const handleChange = useCallback<(v: T) => () => void>(
    (item) => () => {
      const newValues = Array.from(values ?? []);
      const findIndex = newValues.findIndex(
        (it) =>
          computePropName(item, keyPropName) &&
          Object.is(
            computePropName(it, keyPropName),
            computePropName(item, keyPropName)
          )
      );
      if (findIndex < 0) {
        newValues?.push?.(item);
      } else {
        newValues?.splice?.(findIndex, 1);
      }
      onChangeRef.current?.(newValues);
    },
    [keyPropName, values]
  );

  const handleLoadMore = useCallback(() => {
    if (loading) return;
    handleRequest({ limit, page: page + 1, searchKey: keyword }, "scroll");
  }, [handleRequest, keyword, limit, loading, page]);

  const handleCheckAll = useCallback(
    (e) => {
      const checked = e?.target?.checked;
      const value = checked ? excludeDisabledDataSource : [];
      onChangeRef.current?.(value);
    },
    [excludeDisabledDataSource]
  );

  const computedCounter = useMemo(() => {
    const defaultCounter = excludeDisabledDataSource?.length
      ? `${values?.length ?? 0}/${excludeDisabledDataSource?.length}`
      : "";
    if (counterRef.current === true) return defaultCounter;
    if (typeof counterRef.current === "function") {
      return counterRef.current?.(
        Array.from(values ?? []),
        excludeDisabledDataSource
      );
    }
    return null;
  }, [excludeDisabledDataSource, values]);

  const renderItem = useCallback<NonNullable<ListProps<T>["renderItem"]>>(
    (item, i) => {
      const avatar = computePropName(item, avatarPropName, "avatar");
      const selected =
        rules?.checked?.(item, values) ??
        values?.find?.(
          (it) =>
            computePropName(item, keyPropName) &&
            Object.is(
              computePropName(it, keyPropName),
              computePropName(item, keyPropName)
            )
        );
      const disabled = rules?.disabled?.(item, values);
      return (
        <List.Item onClick={!disabled ? handleChange(item) : undefined}>
          <SimpleCheckbox checked={!!selected} disabled={!!disabled} />
          <List.Item.Meta
            avatar={avatar}
            title={computePropName(item, titlePropName)}
            description={computePropName(item, descPropName)}
          />
        </List.Item>
      );
    },
    [
      avatarPropName,
      descPropName,
      handleChange,
      keyPropName,
      rules,
      titlePropName,
      values,
    ]
  );

  const renderList = useMemo(() => {
    return (
      <List
        bordered={false}
        itemLayout="horizontal"
        {...restProps}
        locale={{ emptyText }}
        loading={
          loading && {
            indicator: <AuthingSpin newIndicator />,
            ...loadingConfig,
          }
        }
        pagination={initialPagination && pagination}
        dataSource={computedDataSource}
        renderItem={renderItem}
        style={{ ...restProps.style, maxHeight, minHeight, height }}
      />
    );
  }, [
    computedDataSource,
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

  return (
    <div aria-label="normal-list" className={styles.pickNormal}>
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
      {!!showCheckAll && (
        <div className={styles.checkAll}>
          <SimpleCheckbox
            onChange={handleCheckAll}
            checked={
              !!values?.length &&
              values?.length === excludeDisabledDataSource?.length
            }
            indeterminate={
              !!values?.length &&
              values.length < excludeDisabledDataSource?.length
            }
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
            hasMore={
              !!computedDataSource?.length &&
              computedDataSource?.length < pagination?.total!
            }
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
