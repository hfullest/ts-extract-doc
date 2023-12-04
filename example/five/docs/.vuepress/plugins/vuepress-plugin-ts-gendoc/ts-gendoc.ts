import { resolve } from "path";
import parser from "react-docgen-typescript";
import {
  markdownRender,
  renderers,
} from "react-docgen-typescript-markdown-render";
import { MarkdownImportOptions } from "./vuepress-plugin-markdown-import";
import { extractTsToMarkdown } from "../../../../../../src/index";
import { writeFileSync } from "fs";
// import { parse } from "../../../../../../src/react-docgen-typescript/src/index";
import { generateMarkdown } from "ts-document";

export default {
  "ts-gendoc": {
    alias: { "@": resolve(process.cwd(), "src") },
    level: 3,
    handler(md, tokens, idx) {
      const token = tokens[idx];
      const { path, params } = token.meta;
      /*************************************** */
      const result = extractTsToMarkdown(path, {
        markdown: { template: "beauty" },
      });
      writeFileSync(resolve(process.cwd(), "./测试内容.md"), result, "utf-8");
      // parse(path);
      debugger;
      // const tsDocument = generateMarkdown(path, {
      //   sourceFilesPaths: ["**/*.ts"],
      // });
      // console.log(tsDocument);
      // // writeFileSync(
      // //   resolve(process.cwd(), "./tsDocument.md"),
      // //   JSON.stringify(tsDocument),
      // //   "utf-8",
      // // );

      // /***************************************** */

      // const componentDocs = parser.parse(path, {
      //   savePropValueAsString: true,
      // });
      // const mdDoc = markdownRender(componentDocs, {
      //   renderer: renderers.aliMaterialRenderer,
      //   language: "zh_CN",
      // });
      // console.log({ mdDoc });
      process.exit();

      // const componentTokens = md.parse(mdDoc, {});
      // componentTokens.forEach(
      //   (it) => (it.level = Math.max(it.level + token.level - 3, 0))
      // );
      // const html = md.renderer.render(componentTokens, {}, {});

      // console.log(mdDoc);
      // process.exit();
      // return html.replace(/}}/g, "} }"); // 为了解决vue-loader误把 }} 当做模版字符解析
    },
  },
} as MarkdownImportOptions["importers"];
