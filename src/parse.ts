import { Project, ts } from 'ts-morph';
import { ComponentDoc, ParserOptions } from './interface';

export const defaultOptions: ts.CompilerOptions = {
  jsx: ts.JsxEmit.React,
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.Latest,
};

export const defaultParserOpts: ParserOptions = {};

export const parse = (
  filePathOrPaths: string | string[],
  compilerOptions: ts.CompilerOptions = defaultOptions,
  parserOpts: ParserOptions = defaultParserOpts
): ComponentDoc[] => {
  const filePaths = Array.isArray(filePathOrPaths) ? filePathOrPaths : [filePathOrPaths];

  const project = new Project();
  project.

};
