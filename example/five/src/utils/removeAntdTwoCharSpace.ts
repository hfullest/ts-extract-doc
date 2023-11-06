import React from "react";

/** 移除antd两个字符空格
 *  主要针对antd两个字符间空格问题
 * 注意：这是个hack方法
 */
export const removeAntdTwoCharSpace = (
  children: React.ReactNode
): React.ReactNode => {
  const rxTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
  const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);
  const childList = React.Children.toArray(children);
  if (
    childList.length === 1 &&
    typeof childList[0] === "string" &&
    isTwoCNChar(childList[0])
  ) {
    /** 使用hack手段解决antd两个字符空格问题 */
    const hackElement = React.createElement("i", {
      key: "hack-i",
      style: { display: "none" },
    });
    childList.unshift(hackElement);
    const newElement = React.createElement(
      "div",
      {
        key: "hack-div",
        style: {
          letterSpacing: 0,
          display: "inline-flex",
          justifyContent: "center",
          alignItems: "center",
        },
      },
      childList
    );
    return newElement;
  }
  return children;
};
