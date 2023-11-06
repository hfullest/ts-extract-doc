import { Col, Row } from "antd";
import React from "react";

import { UiButton, UiButtonProps } from ".";

export const UiButtonExample = () => {
  const buttons: UiButtonProps[] = [
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
  return (
    <>
      {buttons.map((it, key) => (
        <Row gutter={[16, 16]} key={key}>
          <Col span={4} style={{ display: "flex", justifyContent: "flex-end" }}>
            <h3>{it?.title || it?.type}:&ensp;</h3>
          </Col>
          <Col>
            <UiButton {...it} size="small" disabled={false}>
              小尺寸按钮
            </UiButton>
          </Col>
          <Col>
            <UiButton {...it} size="large" disabled={false}>
              大尺寸按钮
            </UiButton>
          </Col>
          <Col>
            <UiButton {...it} disabled={false}>
              中尺寸按钮
            </UiButton>
          </Col>
          <Col>
            <UiButton disabled {...it}>
              中尺寸按钮
            </UiButton>
          </Col>
        </Row>
      ))}
    </>
  );
};
