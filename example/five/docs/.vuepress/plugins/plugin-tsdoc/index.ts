import { Plugin, PluginTuple } from "vuepress/config";
import { testTsDoc, parseTs, reactDoc, reactDocTs } from "./tsdoc";
import { readFileSync, stat, writeFileSync } from "fs";
import { resolve } from "path";
import MarkdownIt, {
  Nesting,
} from "../../../../../../SelfWorkSpace/markdown-it-ts/dist/index.mjs";

// testTsDoc();
// parseTs();
// reactDoc();
// reactDocTs();
// process.exit();

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
    name: "vuepress-plugin-react-docgen-typescript",
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
      //   console.log("vuepress-plugin-tsdoc", md.block.);
      //   const origin = md.renderer.rules.link_open;
      //   md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
      //     // console.log({ tokens, idx, options, env, self });
      //     return origin?.(tokens, idx, options, env, self) ?? "";
      //   };
      //     md.core.ruler.at('block',(state)=>{
      // console.log('core$$$$$$$$$$$:', JSON.stringify(state.tokens,null,2));
      // return true;
      //     })
      // md.block.ruler.before(
      //   "paragraph",
      //   "import:react-docgen-typescript",
      //   (state, startLine, endLine, slient) => {
      //     console.log(JSON.stringify({src: state.src, startLine,endLine},null,2));
      //   const  pos = state.bMarks[startLine] + state.tShift[startLine],
      //     max = state.eMarks[startLine];
      // // console.log(JSON.parse(JSON.stringify(state)),{ startLine, endLine,max,pos});
      // let text = state.src.substring(pos, max);
      // console.log(text);
      //     // process.exit()
      //     // writeFileSync(
      //     //   resolve(__dirname, "./output3.json"),
      //     //   JSON.stringify(
      //     //     { tokens: state.tokens, startLine, endLine, slient },
      //     //     null,
      //     //     2
      //     //   ),
      //     //   {encoding:"utf-8",flag:'w'}
      //     // );
      //     //   var ch,
      //     //     level,
      //     //     tmp,
      //     //     token,
      //     //     pos = state.bMarks[startLine] + state.tShift[startLine],
      //     //     max = state.eMarks[startLine];
      //     //   console.log(JSON.parse(JSON.stringify(state)), {
      //     //     startLine,
      //     //     endLine,
      //     //     pos,
      //     //     max,
      //     //   });
      //   //   process.exit();
      //   return true;
      //   }
      // );
    },
  };
};

export default VuePressMarkdownImportPlugin;
