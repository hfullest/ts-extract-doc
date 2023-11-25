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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickPane = void 0;
var react_1 = require("react");
var classnames_1 = require("classnames");
var PaneBox_1 = require("./PaneBox");
var PickBox_1 = require("./PickBox");
var pickpane_module_less_1 = require("./pickpane.module.less");
/** 选择面板 */
function PickPane(props) {
    var value = props.value, onChange = props.onChange, paneConfig = props.paneConfig, template = props.template, templateProps = props.templateProps, pickRender = props.pickRender, className = props.className, style = props.style, _a = props.width, width = _a === void 0 ? style === null || style === void 0 ? void 0 : style.width : _a, _b = props.height, height = _b === void 0 ? style === null || style === void 0 ? void 0 : style.height : _b;
    var _c = (0, react_1.useState)([]), pickedSource = _c[0], setPickedSource = _c[1];
    (0, react_1.useEffect)(function () {
        value !== undefined && setPickedSource(value);
    }, [value]);
    var handleChange = (0, react_1.useCallback)(function (value) {
        var clonedValues = Array.from(value);
        setPickedSource(clonedValues);
        onChange === null || onChange === void 0 ? void 0 : onChange(clonedValues);
    }, [onChange]);
    var renderConfig = pickRender !== undefined ? { pickRender: pickRender } : { template: template, templateProps: templateProps };
    return (<div aria-label="transfer-box" className={(0, classnames_1.default)(pickpane_module_less_1.default["pick-pane-container"], className)} style={__assign(__assign({}, style), { width: width, height: height })}>
      <div className={pickpane_module_less_1.default["pick-box"]}>
        <PickBox_1.PickBox {...renderConfig} value={pickedSource} onChange={handleChange}/>
      </div>
      <div className={pickpane_module_less_1.default["pane-box"]}>
        <PaneBox_1.PaneBox {...paneConfig} value={pickedSource} onChange={handleChange}/>
      </div>
    </div>);
}
exports.PickPane = PickPane;
