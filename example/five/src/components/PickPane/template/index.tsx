import React from "react";

import { PickPaneMustRequired, PickRenderType } from "../interface";
import { PickCascader, PickCascaderProps } from "./Cascader";
import { PickNormal, PickNormalProps } from "./Normal";
import { PickTree, PickTreeProps } from "./PickTree";
import { TabsChannel, TabsChannelProps } from "./TabsChannel";

export declare namespace PickTemplate {
  export interface TabsChannel<D> {
    template: "tabs-channel";
    templateProps: Omit<TabsChannelProps<D>, keyof PickPaneMustRequired>;
  }

  export interface Normal<D> {
    template: "normal";
    templateProps: Omit<PickNormalProps<D>, keyof PickPaneMustRequired>;
  }

  export interface Cascader<D> {
    template: "cascader";
    templateProps: Omit<PickCascaderProps<D>, keyof PickPaneMustRequired>;
  }

  export interface PickTree<D> {
    template: "pick-tree";
    templateProps: Omit<PickTreeProps<D>, keyof PickPaneMustRequired>;
  }
}

export type AllPickTemplates<D = any> =
  | PickTemplate.TabsChannel<D>
  | PickTemplate.Normal<D>
  | PickTemplate.Cascader<D>
  | PickTemplate.PickTree<D>;

export function dealTemplate({
  template,
  templateProps,
}: AllPickTemplates): Exclude<PickRenderType<any>, Function> {
  switch (template) {
    //vscode 类型推断正确，但是由于 babel ts 插件版本问题类型报错，故暂时忽略
    case "tabs-channel":
      // @ts-ignore
      return <TabsChannel {...templateProps} />;
    case "cascader":
      // @ts-ignore
      return <PickCascader {...templateProps} />;
    case "pick-tree":
      // @ts-ignore
      return <PickTree {...templateProps} />;
    case "normal":
    default:
      // @ts-ignore
      return <PickNormal {...templateProps} />;
    //@ts-check
  }
}
