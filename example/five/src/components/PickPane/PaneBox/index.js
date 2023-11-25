"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaneBox = void 0;
var react_1 = require("react");
var antd_1 = require("antd");
var IconFont_1 = require("@/components/IconFont");
var Empty_1 = require("@/ui-components-next/Empty");
var UiButton_1 = require("@/ui-components-next/UiButton");
var locales_1 = require("@/locales");
var utils_1 = require("../utils");
var style_module_less_1 = require("./style.module.less");
var PaneBox = function (props) {
    var value = props.value, header = props.header, _a = props.clearBtnText, clearBtnText = _a === void 0 ? locales_1.default.t("application.delete") : _a, _b = props.showAllClear, showAllClear = _b === void 0 ? true : _b, onChange = props.onChange, _c = props.emptyText, emptyText = _c === void 0 ? <Empty_1.Empty /> : _c, _d = props.titlePropName, titlePropName = _d === void 0 ? "title" : _d, _e = props.descPropName, descPropName = _e === void 0 ? "desc" : _e, _f = props.avatarPropName, avatarPropName = _f === void 0 ? "avatar" : _f, _g = props.keyPropName, keyPropName = _g === void 0 ? titlePropName : _g;
    var _h = (0, react_1.useState)([]), dataSource = _h[0], setDataSource = _h[1];
    (0, react_1.useEffect)(function () { return setDataSource(value); }, [value]);
    var handleChange = (0, react_1.useCallback)(function (values) {
        setDataSource(values);
        onChange === null || onChange === void 0 ? void 0 : onChange(values);
    }, [onChange]);
    var handleItemClear = (0, react_1.useCallback)(function (item, index) { return function () {
        var filterItems = dataSource === null || dataSource === void 0 ? void 0 : dataSource.filter(function (it, i) {
            return !((0, utils_1.computePropName)(item, keyPropName) &&
                Object.is((0, utils_1.computePropName)(it, keyPropName), (0, utils_1.computePropName)(item, keyPropName)) &&
                index === i);
        });
        handleChange(filterItems);
    }; }, [dataSource, handleChange, keyPropName]);
    var handleClearAll = (0, react_1.useCallback)(function () { return handleChange([]); }, [handleChange]);
    var computedHeader = (0, react_1.useMemo)(function () {
        var headerElement = typeof header === "function" ? header(dataSource) : header;
        return (<>
        {headerElement}
        {showAllClear && (<UiButton_1.UiButton type="link" className={style_module_less_1.default.clearAllBtn} padding={false} onClick={handleClearAll}>
            {clearBtnText}
          </UiButton_1.UiButton>)}
      </>);
    }, [clearBtnText, dataSource, handleClearAll, header, showAllClear]);
    var renderItem = (0, react_1.useCallback)(function (item, i) {
        return (<antd_1.List.Item actions={[
                <span className="icon-close" onClick={handleItemClear(item, i)}>
              <IconFont_1.IconFont type="authing-close-fill"/>
            </span>,
            ]}>
          <antd_1.List.Item.Meta avatar={(0, utils_1.computePropName)(item, avatarPropName, "avatar")} title={(0, utils_1.computePropName)(item, titlePropName)} description={(0, utils_1.computePropName)(item, descPropName)}/>
        </antd_1.List.Item>);
    }, [avatarPropName, descPropName, handleItemClear, titlePropName]);
    return (<div className={style_module_less_1.default.paneBox}>
      <antd_1.List bordered={false} header={computedHeader} itemLayout="horizontal" dataSource={dataSource} renderItem={renderItem} locale={{ emptyText: emptyText }}/>
    </div>);
};
exports.PaneBox = PaneBox;
