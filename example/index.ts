import { writeFileSync } from "fs";
import { extractTsToMarkdown } from "../src"; // 引入库
import { resolve } from "path";


const path = resolve(process.cwd(), './demo.tsx');

const result = extractTsToMarkdown(path, {
    // document: { strategy: 'manual' }, // 项目里可以使用手动指定，这里为了方便，对所有导出都进行文档输出
    markdown: { template: "beauty" },
});

writeFileSync(resolve(process.cwd(), "./Demo.md"), result, "utf-8");