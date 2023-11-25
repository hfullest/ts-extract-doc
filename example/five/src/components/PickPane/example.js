"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickPaneExample = exports.mockAxios3 = exports.mockAxios2 = exports.mockAxios1 = void 0;
var react_1 = require("react");
var _1 = require(".");
var Normal_1 = require("./template/Normal");
var mockAxios1 = function (_a) {
    var page = _a.page, limit = _a.limit, searchKey = _a.searchKey;
    var dataFormat = function (it) {
        return {
            key: it + 1,
            title: "\u6D4B\u8BD51-".concat(it + 1),
            avatar: {
                src: "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
                shape: "square",
            },
            desc: "动力费看时代肯老蒋森开动将扫福时代咖啡那时代肯能阿斯丁理发卡娘娘发生带宽；老啊是",
        };
    };
    var data = Array(limit)
        .fill("")
        .map(function (_, i) { return (page - 1) * limit + i; })
        .map(dataFormat)
        .filter(function (it) { return (searchKey ? new RegExp(searchKey).test(it === null || it === void 0 ? void 0 : it.title) : it); });
    // 这里可以配置接口请求
    console.log("使用的mock数据:", {
        params: { page: page, limit: limit, searchKey: searchKey },
        data: data,
    });
    return new Promise(function (resolve) { return setTimeout(resolve, 1000); }).then(function () { return ({
        list: data,
        total: 150,
    }); });
};
exports.mockAxios1 = mockAxios1;
var mockAxios2 = function (_a) {
    var page = _a.page, limit = _a.limit, searchKey = _a.searchKey;
    var dataFormat = function (it) {
        return {
            title: "\u6D4B\u8BD52-".concat(it + 1),
            avatar: {
                src: "https://files.authing.co/authing-console/default-userpool-logo.ico",
                shape: "square",
            },
        };
    };
    var data = Array(limit)
        .fill("")
        .map(function (_, i) { return (page - 1) * limit + i; })
        .map(dataFormat)
        .filter(function (it) { return (searchKey ? new RegExp(searchKey).test(it === null || it === void 0 ? void 0 : it.title) : it); });
    // 这里可以配置接口请求
    console.log("使用的mock数据:", {
        params: { page: page, limit: limit, searchKey: searchKey },
        data: data,
    });
    return new Promise(function (resolve) { return setTimeout(resolve, 1000); }).then(function () { return ({
        list: data,
        total: 150,
    }); });
};
exports.mockAxios2 = mockAxios2;
var mock3Cache = new Map();
var mockAxios3 = function (_a, scene, node) {
    var _b;
    var _c = _a === void 0 ? {} : _a, searchKey = _c.searchKey;
    var dataFormat = function (key) {
        return {
            key: key,
            title: "\u8282\u70B9".concat(key),
            avatar: {
                src: "https://files.authing.co/authing-console/default-userpool-logo.ico",
                shape: "square",
            },
        };
    };
    var LEVEL = 3; // 初次加载数据深度
    var hashKey = "".concat(node === null || node === void 0 ? void 0 : node.key, "-").concat(scene, "-").concat(LEVEL);
    var getData = function (key) {
        if (key === void 0) { key = ""; }
        var random = Math.ceil(Math.random() * 10);
        key = key ? "".concat(key, "-") : "";
        var data = Array(random)
            .fill("")
            .map(function (_, i) { return "".concat(key).concat(i + 1); })
            .map(dataFormat)
            .map(function (it) { return (__assign(__assign({}, it), { isLeaf: Math.random() > 0.5 })); });
        return data;
    };
    var data = [];
    switch (scene) {
        case "lazy":
            data = (_b = mock3Cache.get(hashKey)) !== null && _b !== void 0 ? _b : getData(node === null || node === void 0 ? void 0 : node.key);
            break;
        case "init":
        default:
            var cache = mock3Cache.get(hashKey);
            if (cache) {
                data = cache;
                break;
            }
            var level = LEVEL;
            data = getData();
            var queue = Array.from(data);
            while (--level) {
                queue.push(null);
                while (queue.length) {
                    var node_1 = queue.shift();
                    if (!node_1)
                        break;
                    if (node_1.isLeaf)
                        continue;
                    node_1.children = getData(node_1.key);
                    queue.push.apply(queue, node_1.children);
                }
            }
            break;
    }
    mock3Cache.set(hashKey, data);
    // 这里可以配置接口请求
    console.log("使用的mock数据:", {
        params: { searchKey: searchKey, node: node, scene: scene },
        data: data,
    });
    return new Promise(function (resolve) { return setTimeout(resolve, 1000); }).then(function () { return data; });
};
exports.mockAxios3 = mockAxios3;
var PickPaneExample = function () {
    var normalConfig = {
        /** 结果面板配置 */
        paneConfig: {
            header: function (values) { return <div>已选：{values === null || values === void 0 ? void 0 : values.length} 个主体</div>; },
        },
        template: "normal",
        templateProps: {
            placeholder: "输入角色名称/角色 code 搜索管理员角色-normal",
            request: exports.mockAxios1,
            // pagination: true, //控制使用分页还是使用滚动
        },
    };
    var pickTreeConfig = {
        paneConfig: {
            header: function (values) { return <div>已选：{values === null || values === void 0 ? void 0 : values.length} 个主体</div>; },
        },
        template: "pick-tree",
        templateProps: {
            preserveDataMode: "only-child",
            usingLazyLoad: true,
            filterNode: function (searchKey, node) { var _a, _b; return !!((_b = (_a = node === null || node === void 0 ? void 0 : node.key) === null || _a === void 0 ? void 0 : _a.toString()) === null || _b === void 0 ? void 0 : _b.includes(searchKey)); },
            request: exports.mockAxios3 ||
                (function () {
                    return Promise.resolve([
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
                                        src: "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
                                        shape: "square",
                                    },
                                },
                            ],
                        },
                        {
                            title: "3",
                            key: "3",
                        },
                    ]);
                }),
        },
    };
    var cascaderConfig = {
        paneConfig: {
            header: function (values) { return <div>已选：{values === null || values === void 0 ? void 0 : values.length} 个主体</div>; },
        },
        template: "cascader",
        templateProps: {
            placeholder: "输入角色名称/角色 code 搜索管理员角色-cascader",
            request: exports.mockAxios3,
            scrollLoad: true,
        },
    };
    var customConfig = {
        paneConfig: {
            header: function (values) { return <div>已选：{values === null || values === void 0 ? void 0 : values.length} 个主体</div>; },
        },
        pickRender: (<Normal_1.PickNormal placeholder="输入角色名称/角色 code 搜索管理员角色-自定义" request={exports.mockAxios2}/>),
    };
    var configs = [
        // 使用 normal 模板的配置示例
        normalConfig,
        {
            paneConfig: {
                header: function (values) { return <div>已选：{values === null || values === void 0 ? void 0 : values.length} 个主体</div>; },
                titlePropName: function (value) { return value.title; },
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
    return (<>
      {configs.map(function (it, i) {
            var _a;
            return (<div key={i}>
          <h1>{(_a = it === null || it === void 0 ? void 0 : it.template) !== null && _a !== void 0 ? _a : "自定义渲染器"}</h1>
          <_1.PickPane style={{ height: "640px" }} key={i} {...it} onChange={function (value) {
                    var _a;
                    console.log((_a = it === null || it === void 0 ? void 0 : it.template) !== null && _a !== void 0 ? _a : "自定义渲染器", "已选择值：", value);
                }}/>
        </div>);
        })}
    </>);
};
exports.PickPaneExample = PickPaneExample;
