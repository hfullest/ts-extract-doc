import React, { useCallback, useEffect, useState } from "react";

import classNames from "classnames";

import { PaneBox } from "./PaneBox";
import { PickBox } from "./PickBox";
import { PickPaneProps } from "./interface";
import styles from "./pickpane.module.less";

/** 选择面板 */
export function PickPane<T = any>(props: PickPaneProps<T>): React.ReactElement {
  const {
    value,
    onChange,
    paneConfig,
    template,
    templateProps,
    pickRender,
    className,
    style,
    width = style?.width,
    height = style?.height,
  } = props;
  const [pickedSource, setPickedSource] = useState<T[]>([]);
  useEffect(() => {
    value !== undefined && setPickedSource(value);
  }, [value]);
  const handleChange = useCallback<(v: T[]) => void>(
    (value) => {
      const clonedValues = Array.from(value);
      setPickedSource(clonedValues);
      onChange?.(clonedValues);
    },
    [onChange]
  );
  const renderConfig: any =
    pickRender !== undefined ? { pickRender } : { template, templateProps };
  return (
    <div
      aria-label="transfer-box"
      className={classNames(styles["pick-pane-container"], className)}
      style={{ ...style, width, height }}
    >
      <div className={styles["pick-box"]}>
        <PickBox
          {...renderConfig}
          value={pickedSource}
          onChange={handleChange}
        />
      </div>
      <div className={styles["pane-box"]}>
        <PaneBox {...paneConfig} value={pickedSource} onChange={handleChange} />
      </div>
    </div>
  );
}
