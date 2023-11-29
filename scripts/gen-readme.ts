import { execSync } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";

function genReadme() {
    const isBuild = existsSync(resolve(__dirname, '../dist/es/index.js'));
    if (!isBuild) { execSync(`npm run build`) }
    
}

genReadme();