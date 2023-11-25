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
exports.TabsChannel = void 0;
var react_1 = require("react");
var antd_1 = require("antd");
var classnames_1 = require("classnames");
var PickBox_1 = require("../../PickBox");
var style_module_less_1 = require("./style.module.less");
var TabsChannel = function (props) {
    var value = props.value, onChange = props.onChange, tabPanes = props.tabPanes, tabsConfig = props.tabsConfig;
    var renderPanes = (0, react_1.useMemo)(function () {
        return tabPanes === null || tabPanes === void 0 ? void 0 : tabPanes.map(function (it, i) {
            var renderer = it.renderer, tabKey = it.tabKey, _a = it.key, key = _a === void 0 ? tabKey : _a, children = it.children, rest = __rest(it, ["renderer", "tabKey", "key", "children"]);
            var renderChildren = renderer ? (<PickBox_1.PickBox {...renderer} value={value} onChange={onChange}/>) : (children);
            return (<antd_1.Tabs.TabPane key={key !== null && key !== void 0 ? key : i} {...rest}>
          {renderChildren}
        </antd_1.Tabs.TabPane>);
        });
    }, [onChange, tabPanes, value]);
    return (<div aria-label="tab-channel" className={style_module_less_1.default.tabsChannel}>
      <antd_1.Tabs {...tabsConfig} className={(0, classnames_1.default)(tabsConfig === null || tabsConfig === void 0 ? void 0 : tabsConfig.className, style_module_less_1.default.tabs)}>
        {renderPanes}
      </antd_1.Tabs>
    </div>);
};
exports.TabsChannel = TabsChannel;
