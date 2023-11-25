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
exports.IconFont = void 0;
// TODO 将所有使用 css font 方式的图标改为这个组件
var react_1 = require("react");
// import "./style.less";
var classnames_1 = require("classnames");
var IconFont = function (params) {
    var type = params.type, style = params.style, className = params.className, fill = params.fill, size = params.size, rest = __rest(params, ["type", "style", "className", "fill", "size"]);
    var sizeStyle = size ? { fontSize: "".concat(parseFloat(size), "px") } : {};
    return (<span style={__assign(__assign({}, style), sizeStyle)} {...rest} className={(0, classnames_1.default)(className, "anticon", "authing-icon")}>
      <svg width="1em" height="1em" fill={fill ? fill : "currentColor"}>
        <use xlinkHref={"#".concat(type)}></use>
      </svg>
    </span>);
};
exports.IconFont = IconFont;
