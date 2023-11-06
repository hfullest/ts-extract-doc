import React, { useMemo } from "react";

import { IPick } from "../interface";
import { dealTemplate } from "../template";
import styles from "./style.module.less";

export const PickBox = <D extends unknown = any>(props: IPick<D>) => {
  const {
    template,
    templateProps,
    pickRender: PickerRender,
    value,
    onChange,
  } = props;

  const InjectedPickElement = useMemo(() => {
    let PickerElement;
    if (PickerRender) {
      PickerElement = React.isValidElement(PickerRender)
        ? PickerRender
        : typeof PickerRender === "function"
        ? React.createElement(PickerRender)
        : null;
    } else {
      PickerElement = dealTemplate({ template, templateProps } as any);
    }
    return PickerElement
      ? React.cloneElement(PickerElement, { value, onChange })
      : null;
  }, [PickerRender, value, onChange, template, templateProps]);

  return <div className={styles.pickBox}>{InjectedPickElement}</div>;
};
