"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_2 = require("@testing-library/react");
var _1 = require(".");
var prefixCls = "".concat(_1.UI_PREFIX, "-btn");
var antPrefixCls = "ant-btn";
var role = "test-ui-button";
describe("【UiButton】case:", function () {
    describe("loading 属性", function () {
        describe("loading: true", function () {
            test("".concat(prefixCls, "-loading \u7C7B\u540D\u6DFB\u52A0\u6B63\u5E38"), function () {
                var queryByRole = (0, react_2.render)(<_1.UiButton role={role} loading={true}>
            loading按钮
          </_1.UiButton>).queryByRole;
                var btnEle = queryByRole(role);
                expect(btnEle === null || btnEle === void 0 ? void 0 : btnEle.className).toContain("".concat(prefixCls, "-loading"));
                expect(btnEle === null || btnEle === void 0 ? void 0 : btnEle.className).toContain("".concat(antPrefixCls, "-loading"));
            });
            test("按钮不可点击", function () { return __awaiter(void 0, void 0, void 0, function () {
                var callback, getByRole;
                return __generator(this, function (_a) {
                    callback = jest.fn();
                    getByRole = (0, react_2.render)(<_1.UiButton role={role} loading={true} onClick={callback}>
            loading按钮
          </_1.UiButton>).getByRole;
                    getByRole(role).click();
                    expect(callback).not.toBeCalled(); // loading 状态按钮不可点击
                    return [2 /*return*/];
                });
            }); });
            test("快照相同", function () {
                var queryByRole = (0, react_2.render)(<_1.UiButton role={role} loading={true}>
            loading按钮
          </_1.UiButton>).queryByRole;
                expect(queryByRole(role)).toMatchSnapshot();
            });
        });
        describe("loading: {type: 'contain'}", function () {
            test("loading 图标和按钮内容共存", function () {
                var _a = (0, react_2.render)(<_1.UiButton role={role} loading={{ type: "contain" }}>
            loading按钮
          </_1.UiButton>), queryByRole = _a.queryByRole, queryByText = _a.queryByText;
                var btnEle = queryByRole(role);
                expect(btnEle === null || btnEle === void 0 ? void 0 : btnEle.className).toContain("".concat(prefixCls, "-loading"));
                expect(btnEle === null || btnEle === void 0 ? void 0 : btnEle.className).toContain("".concat(prefixCls, "-loading-contain"));
                expect(btnEle === null || btnEle === void 0 ? void 0 : btnEle.className).toContain("".concat(antPrefixCls, "-loading"));
                expect(queryByRole("img")).toBeInTheDocument();
                expect(queryByText("loading按钮")).toBeInTheDocument();
                expect(btnEle).toMatchSnapshot();
            });
            test("按钮不可点击", function () { return __awaiter(void 0, void 0, void 0, function () {
                var callback, getByRole;
                return __generator(this, function (_a) {
                    callback = jest.fn();
                    getByRole = (0, react_2.render)(<_1.UiButton role={role} loading={{ type: "contain" }} onClick={callback}>
            loading按钮
          </_1.UiButton>).getByRole;
                    getByRole(role).click();
                    expect(callback).not.toBeCalled(); // loading 状态按钮不可点击
                    return [2 /*return*/];
                });
            }); });
        });
        describe("loading: {icon:<div>loading icon</div>}", function () {
            test("替换loading图标", function () {
                var _a, _b;
                var _c = (0, react_2.render)(<_1.UiButton role={role} loading={{ icon: <div>loading icon</div> }}>
            loading按钮
          </_1.UiButton>), queryByRole = _c.queryByRole, queryByText = _c.queryByText;
                expect((_a = queryByRole(role)) === null || _a === void 0 ? void 0 : _a.className).not.toContain("".concat(antPrefixCls, "-loading"));
                expect((_b = queryByRole(role)) === null || _b === void 0 ? void 0 : _b.className).toContain("".concat(prefixCls, "-loading"));
                expect(queryByText("loading icon")).toBeInTheDocument();
                expect(queryByRole("img")).not.toBeInTheDocument(); // antd 默认 loading 图标不渲染
                expect(queryByRole(role)).toMatchSnapshot();
            });
        });
        describe("loading: {loading: false}", function () {
            test("不进行 loading", function () {
                var queryByRole = (0, react_2.render)(<_1.UiButton role={role} loading={{ loading: false }}>
            loading按钮
          </_1.UiButton>).queryByRole;
                expect(queryByRole(role)).not.toContain("".concat(antPrefixCls, "-loading"));
                expect(queryByRole(role)).not.toContain("".concat(prefixCls, "-loading"));
                expect(queryByRole("img")).not.toBeInTheDocument();
                expect(queryByRole(role)).toMatchSnapshot();
            });
        });
    });
    //TODO: disabled 单测
    describe.skip("disabled 属性", function () {
        test("disabled 属性为 boolean 是否工作正常", function () { });
        test("disabled 属性为配置对象是否工作正常", function () { });
    });
    describe.skip("align 属性", function () { });
    describe.skip("tooltip 属性", function () { });
});
