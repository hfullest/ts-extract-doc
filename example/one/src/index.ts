import { resolve } from 'path';
import { generateMarkdown } from '../../../src/index';


generateMarkdown(resolve(process.cwd(),'./example/one/src/example.tsx'))

// const result = generateMarkdown();
// console.log(result)