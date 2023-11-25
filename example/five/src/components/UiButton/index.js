"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.ExampleClass = exports.exampleObj = exports.exampleVar1 = exports.ExampleEnum = exports.ErrorBound = exports.DeclarationFunction = exports.ArrowFunction = exports.UI_PREFIX = exports.testRefUiButton = exports.UiButton = exports.BBBB = exports.ReactClassComponentA = void 0;
var react_1 = require("react");
var AntdButton_1 = require("./AntdButton");
Object.defineProperty(exports, "UI_PREFIX", { enumerable: true, get: function () { return AntdButton_1.UI_PREFIX; } });
var ReactClassComponentA = /** @class */ (function (_super) {
    __extends(ReactClassComponentA, _super);
    function ReactClassComponentA() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReactClassComponentA.prototype.render = function () {
        return <div>哈哈哈</div>;
    };
    ReactClassComponentA.defaultProps = { c: { c1: 'aaa' }, e: 'sdkfdsfs' };
    return ReactClassComponentA;
}(react_1.default.Component));
exports.ReactClassComponentA = ReactClassComponentA;
var BBBB;
(function (BBBB) {
    BBBB["AA"] = "123";
    BBBB["BB"] = "345";
})(BBBB || (exports.BBBB = BBBB = {}));
/** 测试UiButton 描述
 *
 *  */
var UiButton = function (props1) {
    var _a = props1.native, native = _a === void 0 ? false : _a, buttonProps = __rest(props1, ["native"]);
    var Button = AntdButton_1.AntdButton;
    var innerFun = function () {
        if (1 + 1 === 2)
            return <div>哈哈</div>;
        else
            return <Button {...buttonProps}></Button>;
    };
    if (1 + 1 === 2)
        return null;
    else
        return <div>哈哈哈</div>;
    // return React.createElement('div',{})
};
exports.UiButton = UiButton;
var testRefUiButton = function () { return react_1.default.forwardRef(exports.UiButton); };
exports.testRefUiButton = testRefUiButton;
exports.default = exports.UiButton;
exports.UiButton.__ANT_BUTTON = true;
exports.UiButton.Group = AntdButton_1.AntdButton.Group;
/**
 *  AB测试函数
 * @param p1 参数一
 * @param p2 参数二
 * @returns  返回字符串
 */
var ArrowFunction = function (p1, p2) {
    return p1 + p2;
};
exports.ArrowFunction = ArrowFunction;
/**
 * 这个是DelcarationFunction 的描述
 *
 * @description
 * 这里是对`DeclarationFunction`函数的补充描述，这里可以使用`markdown`语法
 */
function DeclarationFunction(a /** 测试声明函数的a参数后置注释 */, b, c) {
    if (c === void 0) { c = "ssss"; }
}
exports.DeclarationFunction = DeclarationFunction;
/** 错误边界 */
var ErrorBound = /** @class */ (function () {
    function ErrorBound() {
    }
    /** 渲染函数
     * @public
     */
    ErrorBound.prototype.render = function () {
        return <div>哈哈哈</div>;
    };
    return ErrorBound;
}());
exports.ErrorBound = ErrorBound;
/** 枚举类型 */
var ExampleEnum;
(function (ExampleEnum) {
    ExampleEnum[ExampleEnum["AAA"] = 0] = "AAA";
    ExampleEnum[ExampleEnum["BBB"] = 1] = "BBB";
})(ExampleEnum || (exports.ExampleEnum = ExampleEnum = {}));
exports.exampleVar1 = 1234;
/** 字面量对象 */
exports.exampleObj = {
    a1: 123,
    b2: true,
    c3: {
        tt: 323,
    },
};
/** 这个是对ExampleClass类的描述 */
var ExampleClass = /** @class */ (function () {
    function ExampleClass() {
        /** a属性
         * @default 'hahah'
         *
         * 这里是markdown区域
         *
         *
         */
        this.a = "124";
        /** 接口函数定义
         * @param {string} p1 参数一字符串
         * @param {number} p2 参数二数值
         * @returns {boolean} 返回值测试
         */
        this.bb = function () { return ""; };
        this.cccPrivate = "1234";
        /** 测试公共方法 */
        this.dddPublic = 12;
    }
    ExampleClass.fffStaticProp = true;
    /** 这个是静态方法 */
    ExampleClass.eeeStaticMethod = function (a, b) {
        return 456;
    };
    return ExampleClass;
}());
exports.ExampleClass = ExampleClass;
