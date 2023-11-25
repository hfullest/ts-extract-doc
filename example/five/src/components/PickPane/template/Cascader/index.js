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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickCascader = exports.isLeafSymbol = exports.childrenSymbol = exports.keySymbol = exports.activeSymbol = exports.paginationSymbol = exports.positionSymol = exports.indexSymbol = exports.levelSymbol = exports.checkStatSymbol = exports.parentSymbol = void 0;
var react_1 = require("react");
var react_infinite_scroller_1 = require("react-infinite-scroller");
var list_1 = require("antd/lib/list");
var classnames_1 = require("classnames");
var IconFont_1 = require("@/components/IconFont");
var AuthingSpin_1 = require("@/ui-components-next/AuthingSpin");
var Empty_1 = require("@/ui-components-next/Empty");
var SimpleCheckboxV2_1 = require("@/ui-components-next/SimpleCheckboxV2");
var SimpleSearch_1 = require("@/ui-components-next/SimpleSearch");
var usePagination_1 = require("@/hooks/usePagination");
var locales_1 = require("@/locales");
var utils_1 = require("../../utils");
var Breadcrumb_1 = require("./Breadcrumb");
var style_module_less_1 = require("./style.module.less");
var utils_2 = require("./utils");
Object.defineProperty(exports, "activeSymbol", { enumerable: true, get: function () { return utils_2.activeSymbol; } });
Object.defineProperty(exports, "checkStatSymbol", { enumerable: true, get: function () { return utils_2.checkStatSymbol; } });
Object.defineProperty(exports, "childrenSymbol", { enumerable: true, get: function () { return utils_2.childrenSymbol; } });
Object.defineProperty(exports, "indexSymbol", { enumerable: true, get: function () { return utils_2.indexSymbol; } });
Object.defineProperty(exports, "isLeafSymbol", { enumerable: true, get: function () { return utils_2.isLeafSymbol; } });
Object.defineProperty(exports, "keySymbol", { enumerable: true, get: function () { return utils_2.keySymbol; } });
Object.defineProperty(exports, "levelSymbol", { enumerable: true, get: function () { return utils_2.levelSymbol; } });
Object.defineProperty(exports, "paginationSymbol", { enumerable: true, get: function () { return utils_2.paginationSymbol; } });
Object.defineProperty(exports, "parentSymbol", { enumerable: true, get: function () { return utils_2.parentSymbol; } });
Object.defineProperty(exports, "positionSymol", { enumerable: true, get: function () { return utils_2.positionSymol; } });
var t = locales_1.default.t.bind(locales_1.default);
var PickCascader = function (props) {
    var placeholder = props.placeholder, _a = props.avatarPropName, avatarPropName = _a === void 0 ? "avatar" : _a, _b = props.titlePropName, titlePropName = _b === void 0 ? "title" : _b, _c = props.descPropName, descPropName = _c === void 0 ? "desc" : _c, _d = props.keyPropName, keyPropName = _d === void 0 ? "key" : _d, _e = props.childrenPropName, childrenPropName = _e === void 0 ? "children" : _e, _f = props.isLeafPropName, isLeafPropName = _f === void 0 ? "isLeaf" : _f, value = props.value, onChange = props.onChange, request = props.request, initialPagination = props.pagination, _g = props.showSearch, showSearch = _g === void 0 ? true : _g, maxHeight = props.maxHeight, minHeight = props.minHeight, height = props.height, _h = props.scrollLoad, scrollLoad = _h === void 0 ? true : _h, loadingConfig = props.loadingConfig, _j = props.preserveDataMode, preserveDataMode = _j === void 0 ? "only-child" : _j, _k = props.preserveAuxiliaryProps, preserveAuxiliaryProps = _k === void 0 ? false : _k, _l = props.showCheckAll, showCheckAll = _l === void 0 ? true : _l, _m = props.breadcrumbPropName, breadcrumbPropName = _m === void 0 ? titlePropName : _m, _o = props.usingLazyLoad, usingLazyLoad = _o === void 0 ? false : _o, counter = props.counter, _p = props.virtualRootNode, virtualRootNode = _p === void 0 ? "root" : _p, breadcrumbProps = props.breadcrumbProps, _q = props.rules, rules = _q === void 0 ? {} : _q, _r = props.emptyText, emptyText = _r === void 0 ? <Empty_1.Empty /> : _r, restProps = __rest(props, ["placeholder", "avatarPropName", "titlePropName", "descPropName", "keyPropName", "childrenPropName", "isLeafPropName", "value", "onChange", "request", "pagination", "showSearch", "maxHeight", "minHeight", "height", "scrollLoad", "loadingConfig", "preserveDataMode", "preserveAuxiliaryProps", "showCheckAll", "breadcrumbPropName", "usingLazyLoad", "counter", "virtualRootNode", "breadcrumbProps", "rules", "emptyText"]);
    var _s = (0, react_1.useState)({}), setUpdate = _s[1];
    var _t = (0, react_1.useState)(false), loading = _t[0], setLoading = _t[1];
    var _u = (0, react_1.useState)(""), keyword = _u[0], setKeyword = _u[1];
    var _v = (0, react_1.useState)(null), currentKey = _v[0], setCurrentKey = _v[1];
    var requestRef = (0, react_1.useRef)(request);
    var onChangeRef = (0, react_1.useRef)(onChange);
    var counterRef = (0, react_1.useRef)(counter);
    /** 记录树结构所有节点集合 */
    var treeMapRef = (0, react_1.useRef)(new Map());
    /** 记录所有已选和半选的节点集合 */
    var checkCollectRef = (0, react_1.useRef)(new Map());
    var treeMapValues = Array.from(treeMapRef.current.values());
    var checkCollectValues = Array.from(checkCollectRef.current.values());
    var checkedValues = checkCollectValues.filter(function (it) { return it[utils_2.checkStatSymbol] === "checked"; });
    var checkColDepStr = JSON.stringify(checkedValues.map(function (it) { return it[utils_2.keySymbol].value; }));
    var treeDepStr = JSON.stringify(treeMapValues.map(function (it) { return it[utils_2.keySymbol].value; }));
    var levelMap = (0, react_1.useMemo)(function () {
        if (!treeDepStr)
            return [new Map(), 1]; // 仅仅利用依赖进行更新
        return (0, utils_2.buildLevelMap)(treeMapRef.current);
    }, [treeDepStr])[0];
    var defaultPagination = (0, react_1.useRef)(__assign({ current: 1, pageSize: 10, total: 0 }, initialPagination));
    var _w = (0, usePagination_1.usePagination)(__assign({ showSizeChanger: false }, defaultPagination.current)), pagination = _w[0], setPagination = _w[1];
    var requestNeedExtraRef = (0, react_1.useRef)({
        keyPropName: keyPropName,
        childrenPropName: childrenPropName,
        isLeafPropName: isLeafPropName,
        rules: rules,
    });
    /** 同步获取接口请求状态，避免重复请求 */
    var isLoadingDataRef = (0, react_1.useRef)(false);
    /** 是否初始化完成 */
    var isInitialedRef = (0, react_1.useRef)(false);
    var currentNode = (0, react_1.useMemo)(function () { var _a; return (_a = treeMapRef.current.get(currentKey)) !== null && _a !== void 0 ? _a : null; }, [currentKey]);
    var currentNodesMap = (0, react_1.useMemo)(function () {
        var _a, _b;
        var node = currentNode;
        var children = node
            ? (_a = node === null || node === void 0 ? void 0 : node[utils_2.childrenSymbol].value) !== null && _a !== void 0 ? _a : []
            : Array.from((_b = levelMap.get(1)) !== null && _b !== void 0 ? _b : []);
        return new Map(children.map(function (it) { return [it[utils_2.keySymbol].value, it]; }));
    }, [currentNode, levelMap]);
    var currentChecksDepStr = JSON.stringify(Array.from(currentNodesMap.values()).map(function (it) { return it[utils_2.checkStatSymbol]; }));
    var currentChecks = (0, react_1.useMemo)(function () {
        var checkedKeys = new Set();
        var halfCheckedKeys = new Set();
        if (currentChecksDepStr)
            checkedKeys.keys(); // 仅仅利用依赖进行更新
        currentNodesMap.forEach(function (it) {
            var checkStatus = it[utils_2.checkStatSymbol];
            var key = it[utils_2.keySymbol].value;
            if (checkStatus === "checked")
                checkedKeys.add(key);
            else if (checkStatus === "halfChecked")
                halfCheckedKeys.add(key);
        });
        return { checkedKeys: checkedKeys, halfCheckedKeys: halfCheckedKeys };
    }, [currentChecksDepStr, currentNodesMap]);
    /** 当前节点可选(参与计算)的子节点 */
    var currentNodeCheckableChildren = (0, react_1.useMemo)(function () {
        var _a;
        var processChildren = Array.from(currentNodesMap.values());
        var children = [];
        while (processChildren.length) {
            var cur = processChildren.shift();
            if (!cur)
                continue;
            var disabled = (0, utils_2.isCheckDisabled)(cur);
            if (disabled) {
                var nextChildren = (_a = cur[utils_2.childrenSymbol].value) !== null && _a !== void 0 ? _a : [];
                if (nextChildren.length)
                    processChildren.push.apply(processChildren, nextChildren);
            }
            else {
                children.push(cur);
            }
        }
        return children;
    }, [currentNodesMap]);
    var usingScrollLoadMore = (0, react_1.useMemo)(function () { return !initialPagination && !!scrollLoad; }, [initialPagination, scrollLoad]);
    var hasMore = (0, react_1.useMemo)(function () {
        var _a, _b;
        var node = currentNode;
        return currentNodesMap.size < ((_b = (_a = node === null || node === void 0 ? void 0 : node[utils_2.paginationSymbol]) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0);
    }, [currentNode, currentNodesMap.size]);
    var paths = (0, react_1.useMemo)(function () {
        var _a;
        var _b;
        var node = currentNode;
        var finalPaths = (_b = node === null || node === void 0 ? void 0 : node[utils_2.positionSymol]) !== null && _b !== void 0 ? _b : [];
        if (virtualRootNode !== false &&
            !finalPaths.find(function (it) { return it[utils_2.keySymbol].value === null; })) {
            var virtualPath = (_a = {},
                _a[utils_2.keySymbol] = { value: null },
                _a[breadcrumbPropName] = virtualRootNode,
                _a.breadcrumbName = virtualRootNode,
                _a);
            finalPaths.unshift(virtualPath);
        }
        return finalPaths;
    }, [breadcrumbPropName, currentNode, virtualRootNode]);
    var handleRequest = (0, react_1.useCallback)(function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        if (typeof requestRef.current !== "function")
            return Promise.reject([]);
        setLoading(true);
        return requestRef
            .current.apply(requestRef, params).then(function (data) {
            var _a = Array.isArray(data)
                ? { list: data, total: data === null || data === void 0 ? void 0 : data.length }
                : data, list = _a.list, total = _a.total;
            setPagination({ total: total });
            return { list: list, total: total };
        })
            .finally(function () { return setLoading(false); });
    }, [setPagination]);
    var handleSearch = (0, react_1.useCallback)(function (value) { return setKeyword(value); }, []);
    var handleCheckedChange = (0, react_1.useCallback)(function (checkStatus, info) {
        var checkedKeys = checkStatus.checked;
        var checked = info.checked;
        var checkedNodes = checkedKeys
            .map(function (k) { return treeMapRef.current.get(k); })
            .filter(Boolean);
        // 处理保留父节点逻辑
        if (preserveDataMode !== "only-child") {
            var nodeSet_1 = new Set(checkedNodes.map(function (it) { return it[utils_2.keySymbol].value; }));
            checked = Array.from(checkCollectRef.current.entries())
                .filter(function (_a) {
                var it = _a[1];
                return it[utils_2.checkStatSymbol] === "checked";
            })
                .every(function (_a) {
                var key = _a[0];
                return nodeSet_1.has(key);
            });
        }
        checkCollectRef.current = (0, utils_2.conductCheck)(checkedNodes, checked, treeMapRef.current);
        setUpdate({});
    }, [preserveDataMode]);
    var handleLoadData = (0, react_1.useCallback)(function (scene) {
        var _a, _b;
        if (loading || !usingLazyLoad)
            return Promise.reject();
        var node = currentNode;
        var _c = (_a = node === null || node === void 0 ? void 0 : node[utils_2.paginationSymbol]) !== null && _a !== void 0 ? _a : {}, _d = _c.pageSize, limit = _d === void 0 ? defaultPagination.current.pageSize : _d, _e = _c.current, page = _e === void 0 ? defaultPagination.current.current : _e;
        var currentPage = page + 1;
        return ((_b = handleRequest === null || handleRequest === void 0 ? void 0 : handleRequest({ page: currentPage, limit: limit, searchKey: keyword }, scene, node).then(function (_a) {
            var data = _a.list, total = _a.total;
            var map = (0, utils_2.flatTree)(data !== null && data !== void 0 ? data : [], node, treeMapRef.current, requestNeedExtraRef.current);
            Array.from(map.entries()).forEach(function (_a) {
                var key = _a[0], item = _a[1];
                return treeMapRef.current.set(key, item);
            });
            if (node) {
                node[utils_2.paginationSymbol] = {
                    current: currentPage,
                    pageSize: limit,
                    total: total,
                };
            }
            setUpdate({});
            return { list: data, total: total };
        })) !== null && _b !== void 0 ? _b : Promise.resolve());
    }, [currentNode, handleRequest, keyword, loading, usingLazyLoad]);
    var handleLoadMore = (0, react_1.useCallback)(function () {
        handleLoadData("scroll").catch(function (_) { return _; });
    }, [handleLoadData]);
    var handleNext = (0, react_1.useCallback)(function (key) { return setCurrentKey(key); }, []);
    var handleCheckAll = (0, react_1.useCallback)(function (e) {
        var _a;
        var checked = (_a = e === null || e === void 0 ? void 0 : e.target) === null || _a === void 0 ? void 0 : _a.checked;
        var keys = new Set(checkCollectRef.current.keys());
        var checkedKeys = new Set(Array.from(keys).filter(function (k) { var _a; return ((_a = treeMapRef.current.get(k)) === null || _a === void 0 ? void 0 : _a[utils_2.checkStatSymbol]) === "checked"; }));
        var halfCheckedKeys = new Set(Array.from(keys).filter(function (k) { var _a; return ((_a = treeMapRef.current.get(k)) === null || _a === void 0 ? void 0 : _a[utils_2.checkStatSymbol]) === "halfChecked"; }));
        var children = currentNodeCheckableChildren;
        if (!checked) {
            children.forEach(function (it) { return checkedKeys.delete(it[utils_2.keySymbol].value); });
        }
        else {
            children.forEach(function (it) { return checkedKeys.add(it[utils_2.keySymbol].value); });
        }
        children.forEach(function (it) { return halfCheckedKeys.delete(it[utils_2.keySymbol].value); });
        handleCheckedChange({
            checked: Array.from(checkedKeys),
            halfChecked: Array.from(halfCheckedKeys),
        }, { checked: checked });
    }, [currentNodeCheckableChildren, handleCheckedChange]);
    var handlePathChange = (0, react_1.useCallback)(function (path) {
        var _a;
        var key = (_a = path[utils_2.keySymbol].value) !== null && _a !== void 0 ? _a : null;
        setCurrentKey(key);
    }, []);
    var renderItem = (0, react_1.useCallback)(function (item, i) {
        var _a, _b, _c, _d, _e;
        var key = item[utils_2.keySymbol].value;
        var node = (_a = treeMapRef.current.get(key)) !== null && _a !== void 0 ? _a : null;
        var activity = (_b = node === null || node === void 0 ? void 0 : node[utils_2.activeSymbol]) === null || _b === void 0 ? void 0 : _b.call(node);
        var checkedKeys = new Set(checkCollectValues
            .filter(function (it) { return it[utils_2.checkStatSymbol] === "checked"; })
            .map(function (it) { return it[utils_2.keySymbol].value; }));
        var halfCheckedKeys = new Set(checkCollectValues
            .filter(function (it) { return it[utils_2.checkStatSymbol] === "halfChecked"; })
            .map(function (it) { return it[utils_2.keySymbol].value; }));
        var checked = checkedKeys.has(key);
        var halfChecked = halfCheckedKeys.has(key);
        var nextChecked = !checked; // 要设置的状态，将之前的状态反选
        if (nextChecked) {
            if (!checkedKeys.has(key))
                checkedKeys.add(key);
        }
        else {
            checkedKeys.delete(key);
            halfCheckedKeys.delete(key);
        }
        var handleClickStepIn = function (e) {
            e.stopPropagation();
            if (activity === null || activity === void 0 ? void 0 : activity.disabled)
                return;
            handleNext(key);
        };
        var handleClickItem = function () {
            handleCheckedChange({
                checked: Array.from(checkedKeys),
                halfChecked: Array.from(halfCheckedKeys),
            }, { checked: nextChecked });
        };
        // 叶子结点判断属性如果为undefined ，则判断该节点是否有子节点属性存在且长度是否不为0
        var showNextIcon = (node === null || node === void 0 ? void 0 : node[utils_2.isLeafSymbol].value) === false ||
            !!((_c = node === null || node === void 0 ? void 0 : node[utils_2.childrenSymbol].value) === null || _c === void 0 ? void 0 : _c.length);
        return (<list_1.default.Item className={(0, classnames_1.default)(style_module_less_1.default.listItem, {
                disabled: activity === null || activity === void 0 ? void 0 : activity.disabled,
            })} onClick={handleClickItem} extra={!!showNextIcon && (<IconFont_1.IconFont type="authing-arrow-right-s-line" onClick={handleClickStepIn}/>)}>
          {!!((_d = activity === null || activity === void 0 ? void 0 : activity.checkable) !== null && _d !== void 0 ? _d : true) && ( // 默认可选
            <SimpleCheckboxV2_1.SimpleCheckbox disabled={(_e = activity === null || activity === void 0 ? void 0 : activity.disabled) !== null && _e !== void 0 ? _e : activity === null || activity === void 0 ? void 0 : activity.disableCheckbox} checked={!!checked} indeterminate={!checked && halfChecked}/>)}
          <list_1.default.Item.Meta avatar={(0, utils_1.computePropName)(item, avatarPropName, "avatar")} title={(0, utils_1.computePropName)(item, titlePropName)} description={(0, utils_1.computePropName)(item, descPropName)}/>
        </list_1.default.Item>);
    }, [
        avatarPropName,
        checkCollectValues,
        descPropName,
        handleCheckedChange,
        handleNext,
        titlePropName,
    ]);
    var renderList = (0, react_1.useMemo)(function () {
        return (<list_1.default bordered={false} itemLayout="horizontal" {...restProps} locale={__assign(__assign({}, restProps), { emptyText: emptyText })} loading={loading && __assign({ indicator: <AuthingSpin_1.AuthingSpin newIndicator/> }, loadingConfig)} pagination={initialPagination && pagination} dataSource={Array.from(currentNodesMap.values())} renderItem={renderItem} style={__assign(__assign({}, restProps.style), { maxHeight: maxHeight, minHeight: minHeight, height: height })}/>);
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
    var checkedAll = (0, react_1.useMemo)(function () {
        if (checkColDepStr) {
            // 仅仅利用依赖进行更新
        }
        var checkedChildren = currentNodeCheckableChildren.filter(function (it) {
            return ["checked"].includes(it[utils_2.checkStatSymbol]);
        });
        return (checkedChildren.length > 0 &&
            checkedChildren.length === currentNodeCheckableChildren.length);
    }, [currentNodeCheckableChildren, checkColDepStr]);
    var halfCheckedAll = (0, react_1.useMemo)(function () {
        if (checkColDepStr) {
            // 仅仅利用依赖进行更新
        }
        var checkedChildren = currentNodeCheckableChildren.filter(function (it) {
            return ["checked"].includes(it[utils_2.checkStatSymbol]);
        });
        return (checkedChildren.length > 0 &&
            checkedChildren.length !== currentNodeCheckableChildren.length);
    }, [checkColDepStr, currentNodeCheckableChildren]);
    var breadcrumbNameRender = (0, react_1.useCallback)(function (path) { return (0, utils_1.computePropName)(path, breadcrumbPropName); }, [breadcrumbPropName]);
    var computedCounter = (0, react_1.useMemo)(function () {
        var _a;
        var defaultCounter = "".concat(checkedValues.length, "/").concat(treeMapRef.current.size);
        if (counterRef.current === true)
            return defaultCounter;
        if (typeof counterRef.current === "function") {
            var current = [
                Array.from(currentChecks.checkedKeys.keys()).map(function (k) {
                    return currentNodesMap.get(k);
                }),
                Array.from(currentNodesMap.values()),
            ];
            var global_1 = [checkedValues, treeMapValues];
            return (_a = counterRef.current) === null || _a === void 0 ? void 0 : _a.call(counterRef, current, global_1);
        }
        return null;
    }, [
        checkedValues,
        currentChecks.checkedKeys,
        currentNodesMap,
        treeMapValues,
    ]);
    //回填分页信息
    (0, react_1.useEffect)(function () {
        var _a;
        var node = currentNode;
        var pageInfo = (_a = node === null || node === void 0 ? void 0 : node[utils_2.paginationSymbol]) !== null && _a !== void 0 ? _a : defaultPagination.current;
        setPagination(pageInfo);
    }, [currentNode, setPagination]);
    // 绑定传递值和状态值
    (0, react_1.useEffect)(function () {
        if (!Array.isArray(value) || loading)
            return;
        var checked = true;
        var checkedNodes = value
            .map(function (it) {
            return treeMapRef.current.get((0, utils_1.computePropName)(it, requestNeedExtraRef.current.keyPropName));
        })
            .filter(Boolean);
        if (preserveDataMode === "priority-parent") {
            checked = true;
        }
        else if (preserveDataMode !== "only-child") {
            // 处理保留父节点逻辑
            var nodeSet_2 = new Set(checkedNodes.map(function (it) { return it[utils_2.keySymbol].value; }));
            checked = Array.from(checkCollectRef.current.entries())
                .filter(function (_a) {
                var it = _a[1];
                return it[utils_2.checkStatSymbol] === "checked";
            })
                .every(function (_a) {
                var key = _a[0];
                return nodeSet_2.has(key);
            });
        }
        checkCollectRef.current = (0, utils_2.conductCheck)(checkedNodes, checked, treeMapRef.current);
        setUpdate({});
    }, [loading, preserveDataMode, value]);
    // onChange 回调
    (0, react_1.useEffect)(function () {
        var _a;
        if (!checkColDepStr)
            return;
        var values = Array.from(checkCollectRef.current.values()).filter(function (it) { return it[utils_2.checkStatSymbol] === "checked"; });
        if (preserveDataMode === "only-child") {
            values = values.filter(function (it) { var _a; return !((_a = it[utils_2.childrenSymbol].value) === null || _a === void 0 ? void 0 : _a.length); }); // 过滤父节点，只保留叶子节点
        }
        else if (preserveDataMode === "priority-parent") {
            var map_1 = new Map(values.map(function (it) { return [it[utils_2.keySymbol].value, it]; }));
            var willDeleteKeys_1 = new Set();
            map_1.forEach(function (node) {
                var _a, _b;
                var childrenAllChecked = (_a = node[utils_2.childrenSymbol].value) === null || _a === void 0 ? void 0 : _a.every(function (it) {
                    return map_1.has(it[utils_2.keySymbol].value);
                });
                if (childrenAllChecked) {
                    (_b = node[utils_2.childrenSymbol].value) === null || _b === void 0 ? void 0 : _b.forEach(function (it) {
                        return willDeleteKeys_1.add(it[utils_2.keySymbol].value);
                    });
                }
            });
            willDeleteKeys_1.forEach(function (key) { return map_1.delete(key); });
            values = Array.from(map_1.values());
        }
        (_a = onChangeRef.current) === null || _a === void 0 ? void 0 : _a.call(onChangeRef, preserveAuxiliaryProps ? values : (0, utils_2.wipeAuxiliary)(values));
    }, [checkColDepStr, preserveAuxiliaryProps, preserveDataMode]);
    // 初始化数据和筛选请求接口
    (0, react_1.useEffect)(function () {
        if (treeMapRef.current.has(currentKey) || isInitialedRef.current)
            return;
        handleRequest({
            limit: defaultPagination.current.pageSize,
            page: defaultPagination.current.current,
        }, "init", null)
            .then(function (_a) {
            var data = _a.list;
            var map = (0, utils_2.flatTree)(data !== null && data !== void 0 ? data : [], null, treeMapRef.current, requestNeedExtraRef.current);
            if (!map.size)
                return; // 没有数据改动跳过
            Array.from(map.entries()).forEach(function (_a) {
                var key = _a[0], item = _a[1];
                return treeMapRef.current.set(key, item);
            });
            setUpdate({});
        })
            .finally(function () { return (isInitialedRef.current = true); });
    }, [currentKey, handleRequest]);
    // 切换currentKey时懒加载数据
    (0, react_1.useEffect)(function () {
        if (!isLoadingDataRef.current &&
            currentNode &&
            !(currentNode === null || currentNode === void 0 ? void 0 : currentNode[utils_2.childrenSymbol].value)) {
            isLoadingDataRef.current = true;
            handleLoadData("child")
                .catch(function (_) { return _; })
                .finally(function () { return (isLoadingDataRef.current = false); });
        }
    }, [currentNode, handleLoadData]);
    // 处理虚拟根节点
    (0, react_1.useEffect)(function () {
        var _a, _b;
        // 如果设置不启用虚拟根节点并且树顶层根节点仅有一个节点，且该节点有子节点，则默认将其设为根节点
        if (virtualRootNode === false && ((_a = levelMap.get(1)) === null || _a === void 0 ? void 0 : _a.size) === 1) {
            var node = Array.from(levelMap.get(1))[0];
            if (!((_b = node[utils_2.childrenSymbol].value) === null || _b === void 0 ? void 0 : _b.length))
                return;
            var key = node[utils_2.keySymbol].value;
            setCurrentKey(key !== null && key !== void 0 ? key : null);
        }
    }, [levelMap, virtualRootNode]);
    return (<div aria-label="cascader-tree" className={style_module_less_1.default.pickCascader}>
      {showSearch && (<SimpleSearch_1.SimpleSearch prefix={<IconFont_1.IconFont type="authing-search-line" style={{ color: "#8a92a6" }}/>} width="100%" isNewStyle onSearch={handleSearch} placeholder={placeholder}/>)}
      <Breadcrumb_1.CascaderBreadcrumb {...breadcrumbProps} paths={paths} breadcrumbPropName={breadcrumbNameRender} onPathChange={handlePathChange}/>
      {!!showCheckAll && (<div className={style_module_less_1.default.checkAll}>
          <SimpleCheckboxV2_1.SimpleCheckbox onChange={handleCheckAll} checked={checkedAll} indeterminate={halfCheckedAll}>
            {t("common.checkAll")}
          </SimpleCheckboxV2_1.SimpleCheckbox>
          <span className={style_module_less_1.default.total}>{computedCounter}</span>
        </div>)}
      {usingScrollLoadMore ? (<div className={style_module_less_1.default.infiniteScroll} style={{ height: "100%", overflowY: "auto" }}>
          <react_infinite_scroller_1.default loadMore={handleLoadMore} useWindow={false} initialLoad={false} hasMore={hasMore}>
            {renderList}
          </react_infinite_scroller_1.default>
        </div>) : (renderList)}
    </div>);
};
exports.PickCascader = PickCascader;
