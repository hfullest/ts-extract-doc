import { Project } from 'ts-morph';
import { parse } from './parse';

// const project = new Project();

// 从文件系统加载tsconfig.json文件，并将其中的所有源文件添加到项目中
// project.addSourceFilesAtPaths('../example/tsconfig.json');
// project.addSourceFilesAtPaths('./example/**/*.ts');

// 获取项目中的所有源文件
// const sourceFiles = project.getSourceFiles();

// console.log(sourceFiles);

export const parseSourceFile = (filePathOrPaths: string | string[]) => {
  return parse(filePathOrPaths);
};

export { generateMarkdown } from './mardown';