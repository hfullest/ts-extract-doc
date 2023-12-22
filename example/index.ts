import { writeFileSync } from "fs";
import { extractTsToMarkdown } from "../src"; // 引入库
import { resolve } from "path";


const path = resolve(__dirname, './demo.tsx');

const result = extractTsToMarkdown(path, {
    document: { strategy: 'manual' },
    markdown: { template: "beauty" },
});

writeFileSync(resolve(process.cwd(), "./Demo.md"), result, "utf-8");