import { defineConfig } from "vuepress/config";

import VuePressMarkdownImportPlugin from "./plugins/plugin-tsdoc";
import reactDocgenTypescript from "@joshwooding/vite-plugin-react-docgen-typescript";
import { readFileSync } from "fs";
import VuePressTsGenDocPlugin from "./plugins/vuepress-plugin-ts-gendoc";

export default defineConfig({
  title: "Hello VuePress",
  description: "Just playing around",
  configureWebpack: {},
  markdown: {
    lineNumbers: true,
    extendMarkdown: (md) => {},
  },
  plugins: [
    // [VuePressMarkdownImportPlugin as any, { test: 1 }]
    [VuePressTsGenDocPlugin as any],
  ],
});
