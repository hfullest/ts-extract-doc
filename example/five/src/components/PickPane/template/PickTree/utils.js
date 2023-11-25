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
exports.wipeAuxiliary = exports.conductCheck = exports.flatTree = exports.buildTree = exports.buildLevelMap = exports.isLeafSymbol = exports.childrenSymbol = exports.keySymbol = exports.paginationSymbol = exports.positionSymol = exports.indexSymbol = exports.levelSymbol = exports.checkStatSymbol = exports.parentSymbol = void 0;
var utils_1 = require("../../utils");
/** 父节点属性 */
exports.parentSymbol = Symbol("parent");
/** 选中状态属性 */
exports.checkStatSymbol = Symbol("checkStatus");
/** 当前层级 */
exports.levelSymbol = Symbol("level");
exports.indexSymbol = Symbol("index");
exports.positionSymol = Symbol("position");
exports.paginationSymbol = Symbol("pagination");
exports.keySymbol = Symbol("keyPropName");
exports.childrenSymbol = Symbol("childrenPropName");
exports.isLeafSymbol = Symbol("isLeafPropName");
var addAuxiliary = function (node, values) {
    var key = values[exports.keySymbol].value;
    var children = values[exports.childrenSymbol].value;
    var isLeaf = values[exports.isLeafSymbol].value;
    Object.assign(node !== null && node !== void 0 ? node : {}, values, __assign(__assign(__assign({}, (key !== undefined && { key: key })), (children !== undefined && { children: children })), (isLeaf !== undefined && { isLeaf: isLeaf })));
};
var isCheckDisabled = function (node) {
    var disabled = node.disabled, disableCheckbox = node.disableCheckbox, checkable = node.checkable;
    return !!(disabled || disableCheckbox) || checkable === false;
};
/** 构建层级映射 */
var buildLevelMap = function (nodesMap) {
    var maxLevel = 0;
    var levelMap = new Map();
    nodesMap.forEach(function (node) {
        var level = node[exports.levelSymbol];
        var levelSet = levelMap.get(level);
        if (!levelSet) {
            levelSet = new Set();
            levelMap.set(level, levelSet);
        }
        levelSet.add(node);
        maxLevel = Math.max(maxLevel, level);
    });
    return [levelMap, maxLevel];
};
exports.buildLevelMap = buildLevelMap;
/** 根据子节点填充父节点 */
var paddingParentByChildNodes = function (nodes) {
    var _a, _b, _c, _d, _e, _f;
    var paddingNodes = new Map();
    var _g = (0, exports.buildLevelMap)(nodes), levelMap = _g[0], maxLevel = _g[1];
    for (var level = maxLevel; level > 0; level--) {
        var nodes_3 = (_a = levelMap.get(level)) !== null && _a !== void 0 ? _a : new Set();
        for (var _i = 0, nodes_1 = nodes_3; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            var key = node[exports.keySymbol].value;
            if (paddingNodes.has(key))
                continue;
            paddingNodes.set(key, node);
            var parent_1 = node[exports.parentSymbol];
            while (parent_1) {
                var parentKey = parent_1[exports.keySymbol].value;
                if (!paddingNodes.has(parentKey)) {
                    paddingNodes.set(parentKey, parent_1);
                }
                parent_1 = parent_1[exports.parentSymbol];
            }
        }
    }
    var _h = (0, exports.buildLevelMap)(paddingNodes), padLevelMap = _h[0], padMaxLevel = _h[1];
    var visitedKeys = new Set();
    for (var level = padMaxLevel; level > 0; level--) {
        var nodes_4 = (_b = padLevelMap.get(level)) !== null && _b !== void 0 ? _b : new Set();
        var _loop_1 = function (originNode) {
            var key = originNode[exports.keySymbol].value;
            var node = visitedKeys.has(key) ? originNode : __assign({}, originNode);
            var parentKey = node[exports.parentSymbol]
                ? node[exports.parentSymbol][exports.keySymbol].value
                : "";
            if (!visitedKeys.has(key)) {
                visitedKeys.add(key);
                paddingNodes.set(key, node);
            }
            if (paddingNodes.has(parentKey)) {
                var parent_2 = Object.assign({}, node[exports.parentSymbol]);
                if (visitedKeys.has(parentKey)) {
                    parent_2 = paddingNodes.get(parentKey);
                    var targetIndex = (_d = (_c = parent_2[exports.childrenSymbol].value) === null || _c === void 0 ? void 0 : _c.findIndex(function (it) { return it[exports.keySymbol].value === key; })) !== null && _d !== void 0 ? _d : -1;
                    if (targetIndex >= 0) {
                        (_e = parent_2[exports.childrenSymbol].value) === null || _e === void 0 ? void 0 : _e.splice(targetIndex, 1, node);
                    }
                    node[exports.parentSymbol] = parent_2;
                }
                else {
                    var children = (_f = parent_2[exports.childrenSymbol].value) === null || _f === void 0 ? void 0 : _f.map(function (it) { return paddingNodes.get(it[exports.keySymbol].value); }).filter(Boolean);
                    parent_2[parent_2[exports.childrenSymbol].name] = children;
                    parent_2[exports.childrenSymbol] = Object.assign({}, parent_2[exports.childrenSymbol], {
                        value: children,
                    });
                    node[exports.parentSymbol] = parent_2;
                    visitedKeys.add(parentKey);
                    paddingNodes.set(parentKey, parent_2);
                }
            }
        };
        for (var _j = 0, nodes_2 = nodes_4; _j < nodes_2.length; _j++) {
            var originNode = nodes_2[_j];
            _loop_1(originNode);
        }
    }
    return Array.from(paddingNodes.values());
};
/** 将按顺序排列的树重新构建成树结构 */
function buildTree(nodes, usingPadding) {
    var _a;
    if (usingPadding === void 0) { usingPadding = false; }
    if (!Array.isArray(nodes))
        return [];
    var paddingNodes = usingPadding
        ? paddingParentByChildNodes(nodes)
        : nodes;
    var sortedNodes = paddingNodes.sort(function (a, b) {
        var aStr = a[exports.indexSymbol].split("-").join("");
        var bStr = b[exports.indexSymbol].split("-").join("");
        var maxLen = Math.max(aStr.length, bStr.length);
        aStr = aStr.padEnd(maxLen, "0");
        bStr = bStr.padEnd(maxLen, "0");
        return Number(aStr) - Number(bStr);
    }); // 根据位置进行排序，保证存入的集合都是正确的树结构顺序
    var map = new Map(); // 存父元素key 和节点 map, key为父节点key，value为子节点集合
    for (var _i = 0, sortedNodes_1 = sortedNodes; _i < sortedNodes_1.length; _i++) {
        var node = sortedNodes_1[_i];
        var parent_3 = node[exports.parentSymbol];
        var parentKey = parent_3 ? parent_3[exports.keySymbol].value : null;
        var parentNodes = map.get(parentKey);
        if (!Array.isArray(parentNodes))
            map.set(parentKey, [node]);
        else
            parentNodes.push(node);
    }
    return (_a = map.get(null)) !== null && _a !== void 0 ? _a : []; // 返回树的根节点数组
}
exports.buildTree = buildTree;
/** 拍平树结构，将树结构各个节点放置到`Map`中，并使用symbol记录父节点，方便还原树结构 */
var flatTree = function (treeData, initParent, allTreeMap, options) {
    if (initParent === void 0) { initParent = null; }
    if (allTreeMap === void 0) { allTreeMap = new Map(); }
    var _a = options !== null && options !== void 0 ? options : {}, _b = _a.keyPropName, keyPropName = _b === void 0 ? "key" : _b, _c = _a.childrenPropName, childrenPropName = _c === void 0 ? "children" : _c, _d = _a.isLeafPropName, isLeafPropName = _d === void 0 ? "isLeaf" : _d;
    var map = new Map();
    var level = ((initParent && initParent[exports.levelSymbol]) || 0) + 1;
    var traverse = function (treeData, parent, status, level, index) {
        var _a;
        var _b;
        if (index === void 0) { index = 1; }
        var parentIndex = parent ? parent[exports.indexSymbol] + "-" : "";
        var parentPosition = parent ? (_b = parent[exports.positionSymol]) !== null && _b !== void 0 ? _b : [] : [];
        for (var _i = 0, treeData_1 = treeData; _i < treeData_1.length; _i++) {
            var node = treeData_1[_i];
            var key = (0, utils_1.computePropName)(node, keyPropName);
            var children = (0, utils_1.computePropName)(node, childrenPropName);
            var isLeaf = (0, utils_1.computePropName)(node, isLeafPropName);
            if (allTreeMap.has(key))
                continue;
            if (!key) {
                key = Math.random().toString(16).slice(2);
                console.error("\u6570\u636E\u9879\u4E2D\u672A\u627E\u5230\u6307\u5B9A\u7684\u552F\u4E00\u5B57\u6BB5`".concat(keyPropName, "`\uFF0C\u8BF7\u6B63\u786E\u6307\u5B9A\u552F\u4E00\u5B57\u6BB5\uFF01\u8BF7\u6CE8\u610F\uFF1A\u8FD9\u91CC\u5C06\u6682\u65F6\u4F7F\u7528\u968F\u673A\u6570`").concat(key, "`\u4F5C\u4E3A\u8BE5\u6570\u636E\u9879\u7684\u552F\u4E00\u5B57\u6BB5."));
            }
            addAuxiliary(node, (_a = {},
                _a[exports.parentSymbol] = parent,
                _a[exports.checkStatSymbol] = status,
                _a[exports.levelSymbol] = level,
                _a[exports.indexSymbol] = parentIndex + index++,
                _a[exports.positionSymol] = parentPosition.concat(node),
                _a[exports.paginationSymbol] = null,
                _a[exports.keySymbol] = { name: keyPropName, value: key },
                _a[exports.childrenSymbol] = { name: childrenPropName, value: children },
                _a[exports.isLeafSymbol] = { name: isLeafPropName, value: isLeaf },
                _a));
            map.set(key, node);
            if (Array.isArray(children)) {
                traverse(children, node, status, level + 1);
            }
        }
    };
    var initParentChildren = (0, utils_1.computePropName)(initParent, childrenPropName);
    var startIndex = ((initParentChildren === null || initParentChildren === void 0 ? void 0 : initParentChildren.length) || 0) + 1;
    traverse(treeData, initParent, "nocheck", level, startIndex);
    if (initParent && map.size) {
        var children = treeData
            .map(function (it) { return map.get((0, utils_1.computePropName)(it, keyPropName)); })
            .filter(Boolean);
        if (!(initParentChildren === null || initParentChildren === void 0 ? void 0 : initParentChildren.length)) {
            var parentChildren = children;
            initParent[exports.childrenSymbol] = {
                name: childrenPropName,
                value: parentChildren,
            };
            initParent[childrenPropName] = parentChildren;
        }
        else {
            var parentChildren = initParentChildren;
            parentChildren.push.apply(parentChildren, children);
        }
    }
    return map;
};
exports.flatTree = flatTree;
var fillConductCheck = function (nodesMap, levelMap, maxLevel) {
    var _a, _b, _c, _d;
    var checkedNodes = new Map(nodesMap);
    var halfCheckedNodes = new Map();
    // 自上而下遍历
    for (var level = 1; level <= maxLevel; level++) {
        var nodes = (_a = levelMap.get(level)) !== null && _a !== void 0 ? _a : new Set();
        for (var _i = 0, nodes_5 = nodes; _i < nodes_5.length; _i++) {
            var node = nodes_5[_i];
            if (checkedNodes.has(node[exports.keySymbol].value) && !isCheckDisabled(node)) {
                (_b = node[exports.childrenSymbol].value) === null || _b === void 0 ? void 0 : _b.forEach(function (it) {
                    if (isCheckDisabled(it))
                        return;
                    checkedNodes.set(it[exports.keySymbol].value, it);
                });
            }
        }
    }
    //自下而上遍历
    var visitedKeys = new Set();
    for (var level = maxLevel; level > 0; level--) {
        var nodes = (_c = levelMap.get(level)) !== null && _c !== void 0 ? _c : new Set();
        var _loop_2 = function (node) {
            var parent_4 = node[exports.parentSymbol];
            var allChecked = true;
            var partialChecked = false;
            if (isCheckDisabled(node) ||
                !parent_4 ||
                visitedKeys.has(parent_4[exports.keySymbol].value))
                return "continue";
            var parentKey = parent_4[exports.keySymbol].value;
            if (isCheckDisabled(parent_4)) {
                visitedKeys.add(parentKey);
                return "continue";
            }
            (_d = parent_4[exports.childrenSymbol].value) === null || _d === void 0 ? void 0 : _d.forEach(function (it) {
                if (isCheckDisabled(it))
                    return;
                var key = it[exports.keySymbol].value;
                var checked = checkedNodes.has(key);
                if (allChecked && !checked)
                    allChecked = false;
                if (!partialChecked && (checked || halfCheckedNodes.has(key)))
                    partialChecked = true;
            });
            if (allChecked)
                checkedNodes.set(parentKey, parent_4);
            if (partialChecked)
                halfCheckedNodes.set(parentKey, parent_4);
            visitedKeys.add(parentKey);
        };
        for (var _e = 0, nodes_6 = nodes; _e < nodes_6.length; _e++) {
            var node = nodes_6[_e];
            _loop_2(node);
        }
    }
    Array.from(halfCheckedNodes.entries()).forEach(function (_a) {
        var key = _a[0], node = _a[1];
        if (checkedNodes.has(key)) {
            halfCheckedNodes.delete(key);
        }
        else {
            node[exports.checkStatSymbol] = "halfChecked";
        }
    });
    Array.from(checkedNodes.values()).forEach(function (it) { return (it[exports.checkStatSymbol] = "checked"); });
    return { checkedNodes: checkedNodes, halfCheckedNodes: halfCheckedNodes };
};
var cleanConductCheck = function (nodesMap, halfNodesMap, levelMap, maxLevel) {
    var _a, _b, _c, _d;
    var checkedNodes = new Map(nodesMap);
    var halfCheckedNodes = new Map(halfNodesMap);
    // 自上而下遍历
    for (var level = 1; level <= maxLevel; level++) {
        var nodes = (_a = levelMap.get(level)) !== null && _a !== void 0 ? _a : new Set();
        for (var _i = 0, nodes_7 = nodes; _i < nodes_7.length; _i++) {
            var node = nodes_7[_i];
            var key = node[exports.keySymbol].value;
            if (!checkedNodes.has(key) &&
                !halfCheckedNodes.has(key) &&
                !isCheckDisabled(node)) {
                (_b = node[exports.childrenSymbol].value) === null || _b === void 0 ? void 0 : _b.forEach(function (it) {
                    if (isCheckDisabled(it))
                        return;
                    checkedNodes.delete(it[exports.keySymbol].value);
                });
            }
        }
    }
    //自下而上遍历
    halfCheckedNodes.clear();
    var visitedKeys = new Set();
    for (var level = maxLevel; level > 0; level--) {
        var nodes = (_c = levelMap.get(level)) !== null && _c !== void 0 ? _c : new Set();
        var _loop_3 = function (node) {
            var parent_5 = node[exports.parentSymbol];
            var allChecked = true;
            var partialChecked = false;
            if (isCheckDisabled(node) ||
                !parent_5 ||
                visitedKeys.has(parent_5[exports.keySymbol].value))
                return "continue";
            var parentKey = parent_5[exports.keySymbol].value;
            if (isCheckDisabled(parent_5)) {
                visitedKeys.add(parentKey);
                return "continue";
            }
            (_d = parent_5[exports.childrenSymbol].value) === null || _d === void 0 ? void 0 : _d.forEach(function (it) {
                if (isCheckDisabled(it))
                    return;
                var key = it[exports.keySymbol].value;
                var checked = checkedNodes.has(key);
                if (allChecked && !checked)
                    allChecked = false;
                if (!partialChecked && (checked || halfCheckedNodes.has(key)))
                    partialChecked = true;
            });
            if (!allChecked)
                checkedNodes.delete(parentKey);
            if (partialChecked)
                halfCheckedNodes.set(parentKey, parent_5);
            visitedKeys.add(parentKey);
        };
        for (var _e = 0, nodes_8 = nodes; _e < nodes_8.length; _e++) {
            var node = nodes_8[_e];
            _loop_3(node);
        }
    }
    Array.from(halfCheckedNodes.entries()).forEach(function (_a) {
        var key = _a[0], node = _a[1];
        if (checkedNodes.has(key)) {
            halfCheckedNodes.delete(key);
        }
        else {
            node[exports.checkStatSymbol] = "halfChecked";
        }
    });
    Array.from(checkedNodes.values()).forEach(function (it) { return (it[exports.checkStatSymbol] = "checked"); });
    return { checkedNodes: checkedNodes, halfCheckedNodes: halfCheckedNodes };
};
/** 根据传入选中的节点集合与整棵树的对比，自动计算出当前应该的全选节点和半选状态
 *
 * @param nodes 整棵树当前需要的全选的节点集合
 * @param checked 触发计算的操作类型方式
 *              - `true`, 表示选中某个节点导致的重新计算
 *              - `false`, 表示反选某个节点或多个节点导致的重新计算
 * @param allTreeMap 整棵树的Map集合
 * @returns 返回全选和半选的Map集合
 *
 * check 处理逻辑借鉴于：https://github.com/react-component/tree/blob/master/src/utils/conductUtil.ts
 */
var conductCheck = function (nodes, checked, allTreeMap) {
    if (!Array.isArray(nodes))
        return new Map();
    var nodesMap = new Map(nodes.map(function (it) { return [it[exports.keySymbol].value, it]; }));
    allTreeMap.forEach(function (node) { return (node[exports.checkStatSymbol] = "nocheck"); } // 初始化选中状态
    );
    var _a = (0, exports.buildLevelMap)(allTreeMap), levelMap = _a[0], maxLevel = _a[1];
    var checksNodes = fillConductCheck(nodesMap, levelMap, maxLevel);
    if (!checked) {
        checksNodes = cleanConductCheck(nodesMap, checksNodes.halfCheckedNodes, levelMap, maxLevel);
    }
    var checkesEntities = Array.from(checksNodes.checkedNodes.values())
        .concat(Array.from(checksNodes.halfCheckedNodes.values()))
        .map(function (it) { return [it[exports.keySymbol].value, it]; });
    var map = new Map(checkesEntities);
    return map;
};
exports.conductCheck = conductCheck;
/** 清理辅助属性，保持数据干净性 */
var wipeAuxiliary = function (nodes) {
    if (!Array.isArray(nodes))
        return [];
    var newNodes = nodes.map(function (node) {
        var _a = node, _b = exports.parentSymbol, parent = _a[_b], _c = exports.checkStatSymbol, checkStatus = _a[_c], _d = exports.levelSymbol, level = _a[_d], _e = exports.indexSymbol, order = _a[_e], _f = exports.positionSymol, position = _a[_f], _g = exports.paginationSymbol, pagination = _a[_g], _h = exports.keySymbol, keyPropName = _a[_h], _j = exports.childrenSymbol, childrenPropName = _a[_j], _k = exports.isLeafSymbol, isLeafPropName = _a[_k], rest = __rest(_a, [typeof _b === "symbol" ? _b : _b + "", typeof _c === "symbol" ? _c : _c + "", typeof _d === "symbol" ? _d : _d + "", typeof _e === "symbol" ? _e : _e + "", typeof _f === "symbol" ? _f : _f + "", typeof _g === "symbol" ? _g : _g + "", typeof _h === "symbol" ? _h : _h + "", typeof _j === "symbol" ? _j : _j + "", typeof _k === "symbol" ? _k : _k + ""]);
        var childrenName = node[exports.childrenSymbol].name;
        var children = rest[childrenName];
        if (Array.isArray(children)) {
            rest[childrenName] = (0, exports.wipeAuxiliary)(children);
        }
        if (keyPropName.name !== "key")
            delete rest["key"];
        if (childrenPropName.name !== "children")
            delete rest["children"];
        if (isLeafPropName.name !== "isLeaf")
            delete rest["isLeaf"];
        return rest;
    });
    return newNodes;
};
exports.wipeAuxiliary = wipeAuxiliary;
