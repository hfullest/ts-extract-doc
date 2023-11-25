"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealTemplate = void 0;
var react_1 = require("react");
var Cascader_1 = require("./Cascader");
var Normal_1 = require("./Normal");
var PickTree_1 = require("./PickTree");
var TabsChannel_1 = require("./TabsChannel");
function dealTemplate(_a) {
    var template = _a.template, templateProps = _a.templateProps;
    switch (template) {
        //vscode 类型推断正确，但是由于 babel ts 插件版本问题类型报错，故暂时忽略
        case "tabs-channel":
            // @ts-ignore
            return <TabsChannel_1.TabsChannel {...templateProps}/>;
        case "cascader":
            // @ts-ignore
            return <Cascader_1.PickCascader {...templateProps}/>;
        case "pick-tree":
            // @ts-ignore
            return <PickTree_1.PickTree {...templateProps}/>;
        case "normal":
        default:
            // @ts-ignore
            return <Normal_1.PickNormal {...templateProps}/>;
        //@ts-check
    }
}
exports.dealTemplate = dealTemplate;
