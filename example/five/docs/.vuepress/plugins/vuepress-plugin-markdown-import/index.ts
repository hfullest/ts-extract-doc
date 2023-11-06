import { Plugin, PluginTuple } from "vuepress/config";
import { readFileSync, stat, writeFileSync } from "fs";
import { resolve } from "path";
import MarkdownIt, {
  Nesting,
} from "../../../../../../SelfWorkSpace/markdown-it-ts/dist/index.mjs";

export interface MarkdownImportOptions<MarkdownIt = any> {
  importers?: Array<
    Record<
      string,
      {
        alias: Record<string, string>;
        handler: (md: MarkdownIt) => void;
      }
    >
  >;
}

const VuePressMarkdownImportPlugin = (options: MarkdownImportOptions = {}) => {
  const { importers } = options;

  return {
    name: "vuepress-plugin-markdown-import",
    extendMarkdown: (md) => {
      /************************************* */
      const source = readFileSync(
        resolve(__dirname, "../../../ui-button1.md"),
        "utf-8"
      );
      const mmd: MarkdownIt = new MarkdownIt();
      mmd.block.ruler.before(
        "paragraph",
        "@import",
        (state, startLine, endLine) => {
          const pos = state.bMarks[startLine] + state.tShift[startLine];
          const max = state.eMarks[startLine];
          const source = state.src.slice(pos, max);
          const targetReg =
            /@import(:(\S+))?(\s+)(([^\/\s]+)(\/[^\?\s\[\]]+)\??(.*))/;
          const match = targetReg.exec(source);
          console.log(match);
          if (!match) return false;
          const [, , identifier, , roughPath, alias, restPath, params] = match;
          console.log({ identifier, roughPath, alias, restPath, params });
          //   const token = state.push<"@import">(
          //     "@import",
          //     "import",
          //     Nesting.opening
          //   );
          return false;
        }
      );

      debugger;
      const result = mmd.render(source);
      console.log("::::::::::", result);
      process.exit();
      /************************************** */
    },
  };
};

export default VuePressMarkdownImportPlugin;
