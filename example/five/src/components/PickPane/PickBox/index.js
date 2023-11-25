"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickBox = void 0;
var react_1 = require("react");
var template_1 = require("../template");
var style_module_less_1 = require("./style.module.less");
var PickBox = function (props) {
    var template = props.template, templateProps = props.templateProps, PickerRender = props.pickRender, value = props.value, onChange = props.onChange;
    var InjectedPickElement = (0, react_1.useMemo)(function () {
        var PickerElement;
        if (PickerRender) {
            PickerElement = react_1.default.isValidElement(PickerRender)
                ? PickerRender
                : typeof PickerRender === "function"
                    ? react_1.default.createElement(PickerRender)
                    : null;
        }
        else {
            PickerElement = (0, template_1.dealTemplate)({ template: template, templateProps: templateProps });
        }
        return PickerElement
            ? react_1.default.cloneElement(PickerElement, { value: value, onChange: onChange })
            : null;
    }, [PickerRender, value, onChange, template, templateProps]);
    return <div className={style_module_less_1.default.pickBox}>{InjectedPickElement}</div>;
};
exports.PickBox = PickBox;
