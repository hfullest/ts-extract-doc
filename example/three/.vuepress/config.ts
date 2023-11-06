import { defineConfig } from 'vuepress/config';
import { run } from '../src';

export default defineConfig({
  markdown: {
    extendMarkdown: (md) => {
        console.log('ahhfha')
      run();
      process.exit();
    },
  },
});
