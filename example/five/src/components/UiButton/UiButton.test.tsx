import React from "react";

import { render } from "@testing-library/react";

import { UI_PREFIX, UiButton } from ".";

const prefixCls = `${UI_PREFIX}-btn`;
const antPrefixCls = `ant-btn`;
const role = `test-ui-button`;

describe("【UiButton】case:", () => {
  describe("loading 属性", () => {
    describe("loading: true", () => {
      test(`${prefixCls}-loading 类名添加正常`, () => {
        const { queryByRole } = render(
          <UiButton role={role} loading={true}>
            loading按钮
          </UiButton>
        );
        const btnEle = queryByRole(role);
        expect(btnEle?.className).toContain(`${prefixCls}-loading`);
        expect(btnEle?.className).toContain(`${antPrefixCls}-loading`);
      });
      test("按钮不可点击", async () => {
        const callback = jest.fn();
        const { getByRole } = render(
          <UiButton role={role} loading={true} onClick={callback}>
            loading按钮
          </UiButton>
        );
        getByRole(role).click();
        expect(callback).not.toBeCalled(); // loading 状态按钮不可点击
      });
      test("快照相同", () => {
        const { queryByRole } = render(
          <UiButton role={role} loading={true}>
            loading按钮
          </UiButton>
        );
        expect(queryByRole(role)).toMatchSnapshot();
      });
    });

    describe("loading: {type: 'contain'}", () => {
      test("loading 图标和按钮内容共存", () => {
        const { queryByRole, queryByText } = render(
          <UiButton role={role} loading={{ type: "contain" }}>
            loading按钮
          </UiButton>
        );
        const btnEle = queryByRole(role);
        expect(btnEle?.className).toContain(`${prefixCls}-loading`);
        expect(btnEle?.className).toContain(`${prefixCls}-loading-contain`);
        expect(btnEle?.className).toContain(`${antPrefixCls}-loading`);
        expect(queryByRole("img")).toBeInTheDocument();
        expect(queryByText("loading按钮")).toBeInTheDocument();
        expect(btnEle).toMatchSnapshot();
      });
      test("按钮不可点击", async () => {
        const callback = jest.fn();
        const { getByRole } = render(
          <UiButton
            role={role}
            loading={{ type: "contain" }}
            onClick={callback}
          >
            loading按钮
          </UiButton>
        );
        getByRole(role).click();
        expect(callback).not.toBeCalled(); // loading 状态按钮不可点击
      });
    });

    describe("loading: {icon:<div>loading icon</div>}", () => {
      test("替换loading图标", () => {
        const { queryByRole, queryByText } = render(
          <UiButton role={role} loading={{ icon: <div>loading icon</div> }}>
            loading按钮
          </UiButton>
        );
        expect(queryByRole(role)?.className).not.toContain(
          `${antPrefixCls}-loading`
        );
        expect(queryByRole(role)?.className).toContain(`${prefixCls}-loading`);
        expect(queryByText("loading icon")).toBeInTheDocument();
        expect(queryByRole("img")).not.toBeInTheDocument(); // antd 默认 loading 图标不渲染
        expect(queryByRole(role)).toMatchSnapshot();
      });
    });

    describe("loading: {loading: false}", () => {
      test("不进行 loading", () => {
        const { queryByRole } = render(
          <UiButton role={role} loading={{ loading: false }}>
            loading按钮
          </UiButton>
        );
        expect(queryByRole(role)).not.toContain(`${antPrefixCls}-loading`);
        expect(queryByRole(role)).not.toContain(`${prefixCls}-loading`);
        expect(queryByRole("img")).not.toBeInTheDocument();
        expect(queryByRole(role)).toMatchSnapshot();
      });
    });
  });

  //TODO: disabled 单测
  describe.skip("disabled 属性", () => {
    test("disabled 属性为 boolean 是否工作正常", () => {});

    test("disabled 属性为配置对象是否工作正常", () => {});
  });

  describe.skip("align 属性", () => {});

  describe.skip("tooltip 属性", () => {});
});
