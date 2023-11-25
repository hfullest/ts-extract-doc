"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePropName = void 0;
var react_1 = require("react");
var antd_1 = require("antd");
var computePropName = function (item, prop, type) {
    if (type === void 0) { type = "normal"; }
    var computed = typeof prop === "function" ? prop(item) : item === null || item === void 0 ? void 0 : item[prop];
    if (type === "avatar") {
        var computedAva = !computed ? null : typeof computed === "string" ? (<antd_1.Avatar src={computed} shape="circle"/>) : react_1.default.isValidElement(computed) ? (computed) : (<antd_1.Avatar shape="circle" size={28} {...computed}/>);
        return computedAva;
    }
    return computed;
};
exports.computePropName = computePropName;
