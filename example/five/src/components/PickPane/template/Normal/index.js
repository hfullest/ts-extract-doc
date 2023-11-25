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
exports.PickNormal = void 0;
var react_1 = require("react");
var react_infinite_scroller_1 = require("react-infinite-scroller");
var antd_1 = require("antd");
var IconFont_1 = require("@/components/IconFont");
var AuthingSpin_1 = require("@/ui-components-next/AuthingSpin");
var Empty_1 = require("@/ui-components-next/Empty");
var SimpleCheckboxV2_1 = require("@/ui-components-next/SimpleCheckboxV2");
var SimpleSearch_1 = require("@/ui-components-next/SimpleSearch");
var usePagination_1 = require("@/hooks/usePagination");
var locales_1 = require("@/locales");
var utils_1 = require("../../utils");
var style_module_less_1 = require("./style.module.less");
var t = locales_1.default.t.bind(locales_1.default);
var PickNormal = function (props) {
    var placeholder = props.placeholder, _a = props.avatarPropName, avatarPropName = _a === void 0 ? "avatar" : _a, _b = props.titlePropName, titlePropName = _b === void 0 ? "title" : _b, _c = props.descPropName, descPropName = _c === void 0 ? "desc" : _c, _d = props.keyPropName, keyPropName = _d === void 0 ? "key" : _d, values = props.value, onChange = props.onChange, request = props.request, initialPagination = props.pagination, _e = props.showSearch, showSearch = _e === void 0 ? true : _e, maxHeight = props.maxHeight, minHeight = props.minHeight, height = props.height, _f = props.scrollLoad, scrollLoad = _f === void 0 ? true : _f, loadingConfig = props.loadingConfig, _g = props.showCheckAll, showCheckAll = _g === void 0 ? true : _g, _h = props.counter, counter = _h === void 0 ? false : _h, rules = props.rules, searchFilter = props.searchFilter, _j = props.emptyText, emptyText = _j === void 0 ? <Empty_1.Empty /> : _j, restProps = __rest(props, ["placeholder", "avatarPropName", "titlePropName", "descPropName", "keyPropName", "value", "onChange", "request", "pagination", "showSearch", "maxHeight", "minHeight", "height", "scrollLoad", "loadingConfig", "showCheckAll", "counter", "rules", "searchFilter", "emptyText"]);
    var _k = (0, react_1.useState)([]), dataSource = _k[0], setDataSource = _k[1];
    var _l = (0, react_1.useState)(""), keyword = _l[0], setKeyword = _l[1];
    var counterRef = (0, react_1.useRef)(counter);
    var onChangeRef = (0, react_1.useRef)(onChange);
    var requestRef = (0, react_1.useRef)(request);
    var searchFilterRef = (0, react_1.useRef)(searchFilter);
    var _m = (0, usePagination_1.usePagination)(__assign({ showSizeChanger: false }, initialPagination)), pagination = _m[0], setPagination = _m[1];
    var defaultPageRef = (0, react_1.useRef)(__assign({ limit: 10, page: 1 }, initialPagination));
    var _o = {
        page: pagination.current,
        limit: pagination.pageSize,
    }, page = _o.page, limit = _o.limit;
    var _p = (0, react_1.useState)(false), loading = _p[0], setLoading = _p[1];
    var computedDataSource = (0, react_1.useMemo)(function () {
        return dataSource
            .filter(function (it) { var _a, _b; return (_b = (_a = rules === null || rules === void 0 ? void 0 : rules.filter) === null || _a === void 0 ? void 0 : _a.call(rules, it, values)) !== null && _b !== void 0 ? _b : true; })
            .filter(function (it) { var _a, _b; return (_b = (_a = searchFilterRef.current) === null || _a === void 0 ? void 0 : _a.call(searchFilterRef, keyword, it)) !== null && _b !== void 0 ? _b : true; });
    }, [dataSource, keyword, rules, values]);
    var excludeDisabledDataSource = (0, react_1.useMemo)(function () {
        return Array.from(computedDataSource).filter(function (it) { var _a, _b; return (_b = (_a = rules === null || rules === void 0 ? void 0 : rules.disabled) === null || _a === void 0 ? void 0 : _a.call(rules, it, values)) !== null && _b !== void 0 ? _b : true; });
    }, [computedDataSource, rules, values]);
    var usingScrollLoadMore = (0, react_1.useMemo)(function () { return !initialPagination && !!scrollLoad; }, [initialPagination, scrollLoad]);
    var handleRequest = (0, react_1.useCallback)(function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        var reqParams = (params !== null && params !== void 0 ? params : [])[0];
        if (typeof requestRef.current !== "function" || loading)
            return;
        setLoading(true);
        return Promise.resolve(requestRef.current.apply(requestRef, params))
            .then(function (data) {
            var _a = Array.isArray(data)
                ? { list: data, total: data === null || data === void 0 ? void 0 : data.length }
                : data !== null && data !== void 0 ? data : {}, list = _a.list, total = _a.total;
            setDataSource(function (dataSource) {
                if (usingScrollLoadMore &&
                    reqParams.page !== defaultPageRef.current.page // page 不为初始页，比如page为1，则不需要合并数据
                ) {
                    var map = new Map(dataSource
                        .concat(list)
                        .map(function (it) { return [(0, utils_1.computePropName)(it, keyPropName), it]; }));
                    return Array.from(map.values());
                }
                return list;
            });
            setPagination(function (page) {
                var _a, _b;
                return ({
                    current: +((_a = reqParams === null || reqParams === void 0 ? void 0 : reqParams.page) !== null && _a !== void 0 ? _a : page.current),
                    pageSize: +((_b = reqParams === null || reqParams === void 0 ? void 0 : reqParams.limit) !== null && _b !== void 0 ? _b : page.pageSize),
                    total: total,
                });
            });
        })
            .finally(function () { return setLoading(false); });
    }, [keyPropName, loading, setPagination, usingScrollLoadMore]);
    (0, react_1.useEffect)(function () {
        handleRequest({
            limit: defaultPageRef.current.limit,
            page: defaultPageRef.current.page,
        }, "init");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    var handleSearch = (0, react_1.useCallback)(function (value) {
        setKeyword(value);
        if (!value) {
            handleRequest({ limit: limit, page: defaultPageRef.current.page }, "init"); // 清空搜索框重新拉取数据
        }
        else {
            handleRequest({ limit: limit, page: defaultPageRef.current.page, searchKey: value }, "search");
        }
    }, [handleRequest, limit]);
    var handleChange = (0, react_1.useCallback)(function (item) { return function () {
        var _a, _b, _c;
        var newValues = Array.from(values !== null && values !== void 0 ? values : []);
        var findIndex = newValues.findIndex(function (it) {
            return (0, utils_1.computePropName)(item, keyPropName) &&
                Object.is((0, utils_1.computePropName)(it, keyPropName), (0, utils_1.computePropName)(item, keyPropName));
        });
        if (findIndex < 0) {
            (_a = newValues === null || newValues === void 0 ? void 0 : newValues.push) === null || _a === void 0 ? void 0 : _a.call(newValues, item);
        }
        else {
            (_b = newValues === null || newValues === void 0 ? void 0 : newValues.splice) === null || _b === void 0 ? void 0 : _b.call(newValues, findIndex, 1);
        }
        (_c = onChangeRef.current) === null || _c === void 0 ? void 0 : _c.call(onChangeRef, newValues);
    }; }, [keyPropName, values]);
    var handleLoadMore = (0, react_1.useCallback)(function () {
        if (loading)
            return;
        handleRequest({ limit: limit, page: page + 1, searchKey: keyword }, "scroll");
    }, [handleRequest, keyword, limit, loading, page]);
    var handleCheckAll = (0, react_1.useCallback)(function (e) {
        var _a, _b;
        var checked = (_a = e === null || e === void 0 ? void 0 : e.target) === null || _a === void 0 ? void 0 : _a.checked;
        var value = checked ? excludeDisabledDataSource : [];
        (_b = onChangeRef.current) === null || _b === void 0 ? void 0 : _b.call(onChangeRef, value);
    }, [excludeDisabledDataSource]);
    var computedCounter = (0, react_1.useMemo)(function () {
        var _a, _b;
        var defaultCounter = (excludeDisabledDataSource === null || excludeDisabledDataSource === void 0 ? void 0 : excludeDisabledDataSource.length)
            ? "".concat((_a = values === null || values === void 0 ? void 0 : values.length) !== null && _a !== void 0 ? _a : 0, "/").concat(excludeDisabledDataSource === null || excludeDisabledDataSource === void 0 ? void 0 : excludeDisabledDataSource.length)
            : "";
        if (counterRef.current === true)
            return defaultCounter;
        if (typeof counterRef.current === "function") {
            return (_b = counterRef.current) === null || _b === void 0 ? void 0 : _b.call(counterRef, Array.from(values !== null && values !== void 0 ? values : []), excludeDisabledDataSource);
        }
        return null;
    }, [excludeDisabledDataSource, values]);
    var renderItem = (0, react_1.useCallback)(function (item, i) {
        var _a, _b, _c, _d;
        var avatar = (0, utils_1.computePropName)(item, avatarPropName, "avatar");
        var selected = (_b = (_a = rules === null || rules === void 0 ? void 0 : rules.checked) === null || _a === void 0 ? void 0 : _a.call(rules, item, values)) !== null && _b !== void 0 ? _b : (_c = values === null || values === void 0 ? void 0 : values.find) === null || _c === void 0 ? void 0 : _c.call(values, function (it) {
            return (0, utils_1.computePropName)(item, keyPropName) &&
                Object.is((0, utils_1.computePropName)(it, keyPropName), (0, utils_1.computePropName)(item, keyPropName));
        });
        var disabled = (_d = rules === null || rules === void 0 ? void 0 : rules.disabled) === null || _d === void 0 ? void 0 : _d.call(rules, item, values);
        return (<antd_1.List.Item onClick={!disabled ? handleChange(item) : undefined}>
          <SimpleCheckboxV2_1.SimpleCheckbox checked={!!selected} disabled={!!disabled}/>
          <antd_1.List.Item.Meta avatar={avatar} title={(0, utils_1.computePropName)(item, titlePropName)} description={(0, utils_1.computePropName)(item, descPropName)}/>
        </antd_1.List.Item>);
    }, [
        avatarPropName,
        descPropName,
        handleChange,
        keyPropName,
        rules,
        titlePropName,
        values,
    ]);
    var renderList = (0, react_1.useMemo)(function () {
        return (<antd_1.List bordered={false} itemLayout="horizontal" {...restProps} locale={{ emptyText: emptyText }} loading={loading && __assign({ indicator: <AuthingSpin_1.AuthingSpin newIndicator/> }, loadingConfig)} pagination={initialPagination && pagination} dataSource={computedDataSource} renderItem={renderItem} style={__assign(__assign({}, restProps.style), { maxHeight: maxHeight, minHeight: minHeight, height: height })}/>);
    }, [
        computedDataSource,
        emptyText,
        height,
        initialPagination,
        loading,
        loadingConfig,
        maxHeight,
        minHeight,
        pagination,
        renderItem,
        restProps,
    ]);
    return (<div aria-label="normal-list" className={style_module_less_1.default.pickNormal}>
      {showSearch && (<SimpleSearch_1.SimpleSearch prefix={<IconFont_1.IconFont type="authing-search-line" style={{ color: "#8a92a6" }}/>} width="100%" isNewStyle onSearch={handleSearch} placeholder={placeholder}/>)}
      {!!showCheckAll && (<div className={style_module_less_1.default.checkAll}>
          <SimpleCheckboxV2_1.SimpleCheckbox onChange={handleCheckAll} checked={!!(values === null || values === void 0 ? void 0 : values.length) &&
                (values === null || values === void 0 ? void 0 : values.length) === (excludeDisabledDataSource === null || excludeDisabledDataSource === void 0 ? void 0 : excludeDisabledDataSource.length)} indeterminate={!!(values === null || values === void 0 ? void 0 : values.length) &&
                values.length < (excludeDisabledDataSource === null || excludeDisabledDataSource === void 0 ? void 0 : excludeDisabledDataSource.length)}>
            {t("common.checkAll")}
          </SimpleCheckboxV2_1.SimpleCheckbox>
          <span className={style_module_less_1.default.total}>{computedCounter}</span>
        </div>)}
      {usingScrollLoadMore ? (<div className={style_module_less_1.default.infiniteScroll} style={{ height: "100%", overflowY: "auto" }}>
          <react_infinite_scroller_1.default loadMore={handleLoadMore} useWindow={false} initialLoad={false} hasMore={!!(computedDataSource === null || computedDataSource === void 0 ? void 0 : computedDataSource.length) &&
                (computedDataSource === null || computedDataSource === void 0 ? void 0 : computedDataSource.length) < (pagination === null || pagination === void 0 ? void 0 : pagination.total)}>
            {renderList}
          </react_infinite_scroller_1.default>
        </div>) : (renderList)}
    </div>);
};
exports.PickNormal = PickNormal;
