"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeNodeItem = void 0;
var react_1 = require("react");
var list_1 = require("antd/lib/list");
var classnames_1 = require("classnames");
var style_module_less_1 = require("./style.module.less");
var TreeNodeItem = function (props) {
    var title = props.title, avatar = props.avatar, description = props.description;
    return (<div className={(0, classnames_1.default)(style_module_less_1.default.treeNodeItem)}>
      <list_1.default.Item className={style_module_less_1.default.itemMetaWrapper}>
        <list_1.default.Item.Meta title={title} avatar={avatar} description={description}/>
      </list_1.default.Item>
    </div>);
};
exports.TreeNodeItem = TreeNodeItem;
