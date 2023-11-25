"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAntdTwoCharSpace = void 0;
var react_1 = require("react");
/** 移除antd两个字符空格
 *  主要针对antd两个字符间空格问题
 * 注意：这是个hack方法
 */
var removeAntdTwoCharSpace = function (children) {
    var rxTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
    var isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);
    var childList = react_1.default.Children.toArray(children);
    if (childList.length === 1 &&
        typeof childList[0] === "string" &&
        isTwoCNChar(childList[0])) {
        /** 使用hack手段解决antd两个字符空格问题 */
        var hackElement = react_1.default.createElement("i", {
            key: "hack-i",
            style: { display: "none" },
        });
        childList.unshift(hackElement);
        var newElement = react_1.default.createElement("div", {
            key: "hack-div",
            style: {
                letterSpacing: 0,
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
            },
        }, childList);
        return newElement;
    }
    return children;
};
exports.removeAntdTwoCharSpace = removeAntdTwoCharSpace;
