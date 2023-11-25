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
exports.AntdButton = exports.UI_PREFIX = void 0;
var button_1 = require("antd/lib/button");
var classnames_1 = require("classnames");
var react_1 = require("react");
var antd_1 = require("antd");
var removeAntdTwoCharSpace_1 = require("@/utils/removeAntdTwoCharSpace");
require("./styles.less");
var ButtonWithToolTip = function (props) {
    var tooltip = props.tooltip, buttonProps = __rest(props, ["tooltip"]);
    if (!tooltip)
        return <button_1.default {...buttonProps} aria-label="button"/>;
    var BridgeButton = function (props) { return (<button_1.default {...props} aria-label="button"/>); };
    BridgeButton.__ANT_BUTTON = true;
    return (<antd_1.Tooltip {...tooltip}>
      <BridgeButton {...buttonProps}/>
    </antd_1.Tooltip>);
};
/** 处理两个字符空格问题 */
var dealSpace = function (children, needSpace) {
    if (needSpace)
        return children;
    return (0, removeAntdTwoCharSpace_1.removeAntdTwoCharSpace)(children);
};
/** 类名前缀
 * @variation
 */
exports.UI_PREFIX = "ui"; // 注意和style里变量保持一致
var AntdButton = function (props) {
    var _a;
    var _b;
    var children = props.children, _c = props.autoInsertSpaceInButton, autoInsertSpaceInButton = _c === void 0 ? false : _c, className = props.className, loading = props.loading, type = props.type, disabled = props.disabled, tooltip = props.tooltip, _d = props.align, align = _d === void 0 ? "center" : _d, padding = props.padding, buttonProps = __rest(props, ["children", "autoInsertSpaceInButton", "className", "loading", "type", "disabled", "tooltip", "align", "padding"]);
    var prefixCls = "".concat(exports.UI_PREFIX, "-btn");
    var loadingType = typeof loading === "object" ? (_b = loading === null || loading === void 0 ? void 0 : loading.type) !== null && _b !== void 0 ? _b : "cover" : "cover";
    /** 定义子节点管道处理函数 */
    var childrenHandlers = [
        function (children) { return dealSpace(children, autoInsertSpaceInButton); },
    ];
    var computedTooltip = typeof disabled === "object" ? disabled.tooltip : tooltip;
    var computedChidren = childrenHandlers.reduce(function (children, handler) { return handler === null || handler === void 0 ? void 0 : handler(children, props); }, children);
    var loadingOptions = typeof loading === "object" ? __assign({ loading: true }, loading) : { loading: loading };
    var computedLoading = !!(loadingOptions.loading && !loadingOptions.icon); // 自定义 loading 图标不使用默认loading，配合自定义样式实现
    var computedIcon = loadingOptions.loading && loadingOptions.icon ? (<span className={"".concat(prefixCls, "-loading-icon")}>{loadingOptions.icon}</span>) : buttonProps.icon ? (<span className={"".concat(prefixCls, "-icon")}>{buttonProps.icon}</span>) : null;
    var classes = (0, classnames_1.default)(className, prefixCls, (_a = {
            twoCharNotSpace: !autoInsertSpaceInButton
        },
        _a["".concat(prefixCls, "-type-").concat(type)] = type && typeof type === "string",
        _a["".concat(prefixCls, "-disabled")] = !!disabled,
        _a["".concat(prefixCls, "-size-").concat(buttonProps === null || buttonProps === void 0 ? void 0 : buttonProps.size)] = !!(buttonProps === null || buttonProps === void 0 ? void 0 : buttonProps.size),
        _a["".concat(prefixCls, "-align-").concat(align)] = !!align,
        _a["".concat(prefixCls, "-loading")] = !!loading,
        _a["".concat(prefixCls, "-loading-").concat(loadingType)] = !!loading,
        _a));
    var styles = __assign(__assign(__assign({}, buttonProps === null || buttonProps === void 0 ? void 0 : buttonProps.style), (padding === false && { padding: 0 })), (padding && { padding: padding }));
    return (<ButtonWithToolTip {...buttonProps} className={classes} style={styles} icon={computedIcon} type={type} disabled={!!disabled} tooltip={computedTooltip} loading={computedLoading}>
      {computedChidren}
    </ButtonWithToolTip>);
};
exports.AntdButton = AntdButton;
exports.AntdButton.Group = button_1.default.Group;
