"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiButtonExample = void 0;
var antd_1 = require("antd");
var react_1 = require("react");
var _1 = require(".");
var UiButtonExample = function () {
    var buttons = [
        { type: "primary" },
        { type: "minority" },
        { type: "textlink" },
        { type: "warn" },
        { type: "danger" },
        { type: "link" },
        { type: "text" },
        { type: "dashed" },
        { type: "ghost" },
        { type: "ghostLight" },
        { title: "loading true", type: "primary", loading: true },
        { title: "loading contain", type: "primary", loading: { type: "contain" } },
        //@ts-ignore
        { type: "ghost", native: true, title: "native ghost" },
        //@ts-ignore
        { type: "ghostLight", native: true, title: "native ghostLight" },
    ];
    return (<>
      {buttons.map(function (it, key) { return (<antd_1.Row gutter={[16, 16]} key={key}>
          <antd_1.Col span={4} style={{ display: "flex", justifyContent: "flex-end" }}>
            <h3>{(it === null || it === void 0 ? void 0 : it.title) || (it === null || it === void 0 ? void 0 : it.type)}:&ensp;</h3>
          </antd_1.Col>
          <antd_1.Col>
            <_1.UiButton {...it} size="small" disabled={false}>
              小尺寸按钮
            </_1.UiButton>
          </antd_1.Col>
          <antd_1.Col>
            <_1.UiButton {...it} size="large" disabled={false}>
              大尺寸按钮
            </_1.UiButton>
          </antd_1.Col>
          <antd_1.Col>
            <_1.UiButton {...it} disabled={false}>
              中尺寸按钮
            </_1.UiButton>
          </antd_1.Col>
          <antd_1.Col>
            <_1.UiButton disabled {...it}>
              中尺寸按钮
            </_1.UiButton>
          </antd_1.Col>
        </antd_1.Row>); })}
    </>);
};
exports.UiButtonExample = UiButtonExample;
