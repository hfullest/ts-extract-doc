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
exports.CascaderBreadcrumb = void 0;
var react_1 = require("react");
var antd_1 = require("antd");
var CascaderBreadcrumb = function (props) {
    var paths = props.paths, _a = props.breadcrumbPropName, breadcrumbPropName = _a === void 0 ? "breadcrumbName" : _a, onPathChange = props.onPathChange, breadcrumbProps = __rest(props, ["paths", "breadcrumbPropName", "onPathChange"]);
    var itemsNodes = (0, react_1.useMemo)(function () {
        var handleClick = function (e, path) {
            var _a;
            (_a = path === null || path === void 0 ? void 0 : path.onClick) === null || _a === void 0 ? void 0 : _a.call(path, e);
            onPathChange === null || onPathChange === void 0 ? void 0 : onPathChange(path);
        };
        return paths === null || paths === void 0 ? void 0 : paths.map(function (path, i) {
            var _a, _b;
            var computedName = typeof breadcrumbPropName === "function"
                ? (_a = breadcrumbPropName(path)) !== null && _a !== void 0 ? _a : path["breadcrumbName"] // 兼容breadcrumbPropName函数执行为空情况
                : path[breadcrumbPropName];
            return (<antd_1.Breadcrumb.Item key={(_b = path === null || path === void 0 ? void 0 : path.key) !== null && _b !== void 0 ? _b : i} dropdownProps={path === null || path === void 0 ? void 0 : path.dropdownProps} onClick={function (e) { return handleClick(e, path); }} href={path === null || path === void 0 ? void 0 : path.href} overlay={path === null || path === void 0 ? void 0 : path.overlay}>
          {computedName}
        </antd_1.Breadcrumb.Item>);
        });
    }, [breadcrumbPropName, onPathChange, paths]);
    return <antd_1.Breadcrumb {...breadcrumbProps}>{itemsNodes}</antd_1.Breadcrumb>;
};
exports.CascaderBreadcrumb = CascaderBreadcrumb;
