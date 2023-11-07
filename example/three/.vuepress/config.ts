import { defineConfig } from 'vuepress/config';
import { run } from '../src';

export default defineConfig((ctx) => {
  console.log('hahahahah');

  return {
    markdown: {
      extendMarkdown: (md) => {
        console.log('ahhfha');
        run();
        process.exit();
      },
    },
  };
});
