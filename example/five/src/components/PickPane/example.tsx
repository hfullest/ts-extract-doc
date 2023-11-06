import React from "react";

import { PickPane } from ".";
import { PickPaneProps } from "./interface";
import { PickNormal } from "./template/Normal";
import { PickTreeProps } from "./template/PickTree";
import { PickTreeNode } from "./template/PickTree/utils";

export const mockAxios1 = ({ page, limit, searchKey }: any) => {
  const dataFormat = (it: number) => {
    return {
      key: it + 1,
      title: `测试1-${it + 1}`,
      avatar: {
        src: "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
        shape: "square",
      },
      desc:
        "动力费看时代肯老蒋森开动将扫福时代咖啡那时代肯能阿斯丁理发卡娘娘发生带宽；老啊是",
    };
  };
  const data = Array(limit)
    .fill("")
    .map((_, i) => (page - 1) * limit + i)
    .map(dataFormat)
    .filter((it) => (searchKey ? new RegExp(searchKey).test(it?.title) : it));
  // 这里可以配置接口请求
  console.log("使用的mock数据:", {
    params: { page, limit, searchKey },
    data,
  });
  return new Promise((resolve) => setTimeout(resolve, 1000)).then(() => ({
    list: data,
    total: 150,
  }));
};
export const mockAxios2 = ({ page, limit, searchKey }: any) => {
  const dataFormat = (it: number) => {
    return {
      title: `测试2-${it + 1}`,
      avatar: {
        src:
          "https://files.authing.co/authing-console/default-userpool-logo.ico",
        shape: "square",
      },
    };
  };
  const data = Array(limit)
    .fill("")
    .map((_, i) => (page - 1) * limit + i)
    .map(dataFormat)
    .filter((it) => (searchKey ? new RegExp(searchKey).test(it?.title) : it));
  // 这里可以配置接口请求
  console.log("使用的mock数据:", {
    params: { page, limit, searchKey },
    data,
  });
  return new Promise((resolve) => setTimeout(resolve, 1000)).then(() => ({
    list: data,
    total: 150,
  }));
};
const mock3Cache = new Map<string, any>();
export const mockAxios3: (
  ...params: Parameters<NonNullable<PickTreeProps["request"]>>
) => Promise<PickTreeNode[]> = ({ searchKey } = {}, scene, node) => {
  const dataFormat = (key: string | number) => {
    return {
      key: key,
      title: `节点${key}`,
      avatar: {
        src:
          "https://files.authing.co/authing-console/default-userpool-logo.ico",
        shape: "square",
      },
    };
  };
  const LEVEL = 3; // 初次加载数据深度

  const hashKey = `${node?.key}-${scene}-${LEVEL}`;
  const getData = (key: string | number = "") => {
    const random = Math.ceil(Math.random() * 10);
    key = key ? `${key}-` : "";
    const data = Array(random)
      .fill("")
      .map((_, i) => `${key}${i + 1}`)
      .map(dataFormat)
      .map((it) => ({ ...it, isLeaf: Math.random() > 0.5 }));
    return data;
  };
  let data: PickTreeNode[] = [];
  switch (scene) {
    case "lazy":
      data = mock3Cache.get(hashKey) ?? getData(node?.key!);
      break;

    case "init":
    default:
      const cache = mock3Cache.get(hashKey);
      if (cache) {
        data = cache;
        break;
      }
      let level = LEVEL;
      data = getData();
      let queue: (PickTreeNode | null)[] = Array.from(data);
      while (--level) {
        queue.push(null);
        while (queue.length) {
          const node = queue.shift();
          if (!node) break;
          if (node.isLeaf) continue;
          node.children = getData(node.key!);
          queue.push(...node.children);
        }
      }
      break;
  }
  mock3Cache.set(hashKey, data);

  // 这里可以配置接口请求
  console.log("使用的mock数据:", {
    params: { searchKey, node, scene },
    data,
  });
  return new Promise((resolve) => setTimeout(resolve, 1000)).then(() => data);
};

type CommonPickPaneProps = PickPaneProps<{
  title: string;
  avatar: React.ReactNode;
}>;

export const PickPaneExample = () => {
  const normalConfig: CommonPickPaneProps = {
    /** 结果面板配置 */
    paneConfig: {
      header: (values) => <div>已选：{values?.length} 个主体</div>,
    },
    template: "normal",
    templateProps: {
      placeholder: "输入角色名称/角色 code 搜索管理员角色-normal",
      request: mockAxios1,
      // pagination: true, //控制使用分页还是使用滚动
    },
  };
  const pickTreeConfig: CommonPickPaneProps = {
    paneConfig: {
      header: (values) => <div>已选：{values?.length} 个主体</div>,
    },
    template: "pick-tree",
    templateProps: {
      preserveDataMode: "only-child",
      usingLazyLoad: true,
      filterNode: (searchKey, node: any) =>
        !!node?.key?.toString()?.includes(searchKey),
      request:
        (mockAxios3 as any) ||
        (() =>
          Promise.resolve([
            {
              title: "1",
              key: "1",
              children: [
                {
                  title: "1-1",
                  key: "1-1",
                  disabled: true,
                  children: [
                    {
                      title: "1-1-1",
                      key: "1-1-1",
                      disableCheckbox: true,
                    },
                    {
                      title: "1-1-2",
                      key: "1-1-2",
                    },
                    { title: "1-1-3", key: "1-1-3" },
                  ],
                },
                {
                  title: "1-2",
                  key: "1-2",
                  children: [
                    {
                      title: "1-2-1",
                      key: "1-2-1",
                    },
                    {
                      title: "1-2-2",
                      key: "1-2-2",
                    },
                  ],
                },
                {
                  title: "1-3",
                  key: "1-3",
                },
              ],
            },
            {
              title: "2",
              key: "2",
              checkable: false,
              children: [
                {
                  title: <span style={{ color: "#1890ff" }}>sss</span>,
                  key: "sss",
                  isLeaf: true,
                  avatar: {
                    src:
                      "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
                    shape: "square",
                  },
                },
              ],
            },
            {
              title: "3",
              key: "3",
            },
          ] as PickTreeNode[])),
    },
  };
  const cascaderConfig: CommonPickPaneProps = {
    paneConfig: {
      header: (values) => <div>已选：{values?.length} 个主体</div>,
    },
    template: "cascader",
    templateProps: {
      placeholder: "输入角色名称/角色 code 搜索管理员角色-cascader",
      request: mockAxios3 as any,
      scrollLoad: true,
    },
  };
  const customConfig: CommonPickPaneProps = {
    paneConfig: {
      header: (values) => <div>已选：{values?.length} 个主体</div>,
    },
    pickRender: (
      <PickNormal
        placeholder="输入角色名称/角色 code 搜索管理员角色-自定义"
        request={mockAxios2}
      />
    ),
  };
  const configs: PickPaneProps<{ title: string; avatar: React.ReactNode }>[] = [
    // 使用 normal 模板的配置示例
    normalConfig,
    {
      paneConfig: {
        header: (values) => <div>已选：{values?.length} 个主体</div>,
        titlePropName: (value) => value.title,
      },
      template: "tabs-channel",
      templateProps: {
        tabPanes: [
          {
            tab: "normal",
            tabKey: "normal",
            renderer: normalConfig,
          },
          {
            tab: "custom",
            tabKey: "custom",
            renderer: customConfig,
          },
          {
            tab: "pick-tree",
            tabKey: "pick-tree",
            renderer: pickTreeConfig,
          },
          {
            tab: "cascader",
            tabKey: "cascader",
            renderer: cascaderConfig,
          },
        ],
      },
    },
    pickTreeConfig,
    cascaderConfig,
    customConfig,
  ];

  return (
    <>
      {configs.map((it, i) => (
        <div key={i}>
          <h1>{it?.template ?? "自定义渲染器"}</h1>
          <PickPane
            style={{ height: "640px" }}
            key={i}
            {...it}
            onChange={(value) => {
              console.log(it?.template ?? "自定义渲染器", "已选择值：", value);
            }}
          />
        </div>
      ))}
    </>
  );
};
