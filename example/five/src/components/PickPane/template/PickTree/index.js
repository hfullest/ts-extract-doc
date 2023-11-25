"use strict";
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
exports.PickTree = exports.isLeafSymbol = exports.childrenSymbol = exports.keySymbol = exports.paginationSymbol = exports.positionSymol = exports.indexSymbol = exports.levelSymbol = exports.checkStatSymbol = exports.parentSymbol = void 0;
var react_1 = require("react");
var antd_1 = require("antd");
var classnames_1 = require("classnames");
var IconFont_1 = require("@/components/IconFont");
var AuthingSpin_1 = require("@/ui-components-next/AuthingSpin");
var SimpleCheckboxV2_1 = require("@/ui-components-next/SimpleCheckboxV2");
var SimpleSearch_1 = require("@/ui-components-next/SimpleSearch");
var locales_1 = require("@/locales");
var utils_1 = require("../../utils");
var TreeNodeItem_1 = require("./TreeNodeItem");
var style_module_less_1 = require("./style.module.less");
var utils_2 = require("./utils");
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
var PickTree = function (props) {
    var _a = props.value, value = _a === void 0 ? [] : _a, onChange = props.onChange, _b = props.showSearch, showSearch = _b === void 0 ? true : _b, placeholder = props.placeholder, _c = props.keyPropName, keyPropName = _c === void 0 ? "key" : _c, _d = props.childrenPropName, childrenPropName = _d === void 0 ? "children" : _d, _e = props.isLeafPropName, isLeafPropName = _e === void 0 ? "isLeaf" : _e, _f = props.titlePropName, titlePropName = _f === void 0 ? "title" : _f, _g = props.avatarPropName, avatarPropName = _g === void 0 ? "avatar" : _g, _h = props.descPropName, descPropName = _h === void 0 ? "desc" : _h, request = props.request, _j = props.usingLazyLoad, usingLazyLoad = _j === void 0 ? false : _j, filterNode = props.filterNode, _k = props.preserveDataMode, preserveDataMode = _k === void 0 ? "only-child" : _k, _l = props.preserveAuxiliaryProps, preserveAuxiliaryProps = _l === void 0 ? false : _l, _m = props.showCheckAll, showCheckAll = _m === void 0 ? true : _m, treeProps = __rest(props, ["value", "onChange", "showSearch", "placeholder", "keyPropName", "childrenPropName", "isLeafPropName", "titlePropName", "avatarPropName", "descPropName", "request", "usingLazyLoad", "filterNode", "preserveDataMode", "preserveAuxiliaryProps", "showCheckAll"]);
    if (!Array.isArray(value)) {
        console.error("value\u503C\u7C7B\u578B\u5FC5\u987B\u4E3A\u6570\u7EC4");
    }
    var _o = (0, react_1.useState)({}), setUpdate = _o[1];
    var _p = (0, react_1.useState)(""), keyword = _p[0], setKeyword = _p[1];
    var _q = (0, react_1.useState)(false), loading = _q[0], setLoading = _q[1];
    var requestRef = (0, react_1.useRef)(request);
    var onChangeRef = (0, react_1.useRef)(onChange);
    /** 记录树结构所有节点集合 */
    var treeMapRef = (0, react_1.useRef)(new Map());
    /** 记录所有已选和半选的节点集合 */
    var checkCollectRef = (0, react_1.useRef)(new Map());
    var treeMapValues = Array.from(treeMapRef.current.values());
    var checkCollectValues = Array.from(checkCollectRef.current.values());
    var checkedValues = checkCollectValues.filter(function (it) { return it[utils_2.checkStatSymbol] === "checked"; });
    var checkColDepStr = JSON.stringify(checkedValues.map(function (it) { return it[utils_2.keySymbol].value; }));
    var requestNeedExtraRef = (0, react_1.useRef)({
        keyPropName: keyPropName,
        childrenPropName: childrenPropName,
        isLeafPropName: isLeafPropName,
    });
    var computedTreeData = (0, react_1.useMemo)(function () {
        var filterTreeValues = typeof filterNode === "function" && keyword
            ? treeMapValues.filter(function (node) { var _a; return (_a = filterNode(keyword, node)) !== null && _a !== void 0 ? _a : true; })
            : treeMapValues;
        return (0, utils_2.buildTree)(filterTreeValues, !!keyword);
    }, [filterNode, keyword, treeMapValues]);
    var computedCheckedKeys = (0, react_1.useMemo)(function () {
        return {
            checked: checkCollectValues
                .filter(function (it) { return it[utils_2.checkStatSymbol] === "checked"; })
                .map(function (it) { return it[utils_2.keySymbol].value; }),
            halfChecked: checkCollectValues
                .filter(function (it) { return it[utils_2.checkStatSymbol] === "halfChecked"; })
                .map(function (it) { return it[utils_2.keySymbol].value; }),
        };
    }, [checkCollectValues]);
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
    }, [loading, preserveDataMode, value]);
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
    // 初始化数据
    (0, react_1.useEffect)(function () {
        var _a;
        setLoading(true);
        (_a = requestRef.current) === null || _a === void 0 ? void 0 : _a.call(requestRef, { searchKey: keyword }, "init", null).then(function (data) {
            var map = (0, utils_2.flatTree)(data !== null && data !== void 0 ? data : [], null, treeMapRef.current, requestNeedExtraRef.current);
            if (!map.size)
                return;
            Array.from(map.entries()).forEach(function (_a) {
                var key = _a[0], item = _a[1];
                return treeMapRef.current.set(key, item);
            });
            setUpdate({});
            setLoading(false);
        });
    }, [keyword]);
    var handleSearch = (0, react_1.useCallback)(function (value) { return setKeyword(value); }, []);
    var handleLoadData = (0, react_1.useCallback)(function (treeNode) {
        var _a, _b, _c;
        var node = (_a = treeMapRef.current.get((0, utils_1.computePropName)(treeNode, requestNeedExtraRef.current.keyPropName))) !== null && _a !== void 0 ? _a : null;
        return ((_c = (_b = requestRef
            .current) === null || _b === void 0 ? void 0 : _b.call(requestRef, { searchKey: keyword }, "lazy", node).then(function (data) {
            var map = (0, utils_2.flatTree)(data !== null && data !== void 0 ? data : [], node, treeMapRef.current, requestNeedExtraRef.current);
            if (!map.size)
                return; // 没有数据改动跳过
            Array.from(map.entries()).forEach(function (_a) {
                var key = _a[0], item = _a[1];
                return treeMapRef.current.set(key, item);
            });
            setUpdate({});
        })) !== null && _c !== void 0 ? _c : Promise.resolve());
    }, [keyword]);
    var handleCheckedChange = (0, react_1.useCallback)(function (checkStatus, info) {
        var checkedKeys = checkStatus.checked;
        var checked = info.checked;
        var checkedNodes = checkedKeys
            .map(function (k) { return treeMapRef.current.get(k); })
            .filter(Boolean);
        // 处理保留父节点逻辑
        if (preserveDataMode !== "only-child") {
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
    }, [preserveDataMode]);
    var handleCheckAll = (0, react_1.useCallback)(function (e) {
        var _a;
        var checked = (_a = e === null || e === void 0 ? void 0 : e.target) === null || _a === void 0 ? void 0 : _a.checked;
        var checkedKeys = checked ? Array.from(treeMapRef.current.keys()) : [];
        handleCheckedChange({ checked: checkedKeys, halfChecked: [] }, {
            checked: checked,
        });
    }, [handleCheckedChange]);
    return (<div aria-label="normal-tree" className={style_module_less_1.default.pickTree}>
      <AuthingSpin_1.AuthingSpin newIndicator spinFull clearSpin spinning={loading}>
        {!!showSearch && (<SimpleSearch_1.SimpleSearch prefix={<IconFont_1.IconFont type="authing-search-line" style={{ color: "#8a92a6" }}/>} width="100%" isNewStyle onSearch={handleSearch} placeholder={placeholder}/>)}
        {!!showCheckAll && (<div className={style_module_less_1.default.checkAll}>
            <SimpleCheckboxV2_1.SimpleCheckbox onChange={handleCheckAll} checked={checkedValues.length === treeMapRef.current.size} indeterminate={!!checkedValues.length &&
                checkedValues.length !== treeMapRef.current.size}>
              {t("common.checkAll")}
            </SimpleCheckboxV2_1.SimpleCheckbox>
            <span className={style_module_less_1.default.total}>
              {checkedValues.length}/{treeMapRef.current.size}
            </span>
          </div>)}
        <antd_1.Tree blockNode checkable selectable={false} {...treeProps} checkStrictly checkedKeys={computedCheckedKeys} onCheck={handleCheckedChange} className={(0, classnames_1.default)(style_module_less_1.default.tree, treeProps.className)} loadData={usingLazyLoad ? handleLoadData : undefined} treeData={computedTreeData} titleRender={function (dataNode) { return (<TreeNodeItem_1.TreeNodeItem dataNode={dataNode} title={(0, utils_1.computePropName)(dataNode, titlePropName)} description={(0, utils_1.computePropName)(dataNode, descPropName)} avatar={(0, utils_1.computePropName)(dataNode, avatarPropName, "avatar")}/>); }}/>
      </AuthingSpin_1.AuthingSpin>
    </div>);
};
exports.PickTree = PickTree;
