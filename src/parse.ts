import { Project, SourceFile, ts, Symbol } from 'ts-morph';
import { Document, ParserOptions } from './interface';
import { isClassComponentKind, isClassKind, isFunctionKind, isJSXComponentKind, isTypesKind } from './utils/utils';
import { collectDocFromType } from './source/types';
import { collectDocFromFunction } from './source/function';
import { collectDocFromClass } from './source/class';
import { collectDocFromJSXComponent } from './source/jsx-component';
import { collectDocFromClassComponent } from './source/class-component';

export const defaultOptions: ts.CompilerOptions = {
  jsx: ts.JsxEmit.React,
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.Latest,
};

export const defaultParserOpts: ParserOptions = {};

export const getFullJsDocComment = (symbol: Symbol) => {
  console.log(symbol);
};

export const parse = (
  filePathOrPaths: string | string[],
  compilerOptions: ts.CompilerOptions = defaultOptions,
  parserOpts: ParserOptions = defaultParserOpts
): Document[][] => {
  const filePaths = Array.isArray(filePathOrPaths) ? filePathOrPaths : [filePathOrPaths];

  const project = new Project();

  project.addSourceFilesAtPaths(filePaths);

  const sourceFiles = project.getSourceFiles();

  const filesDocs = sourceFiles.map(genDocuments);

  return filesDocs;
};

export const genDocuments = (file: SourceFile): Document[] => {
  const exportSymbols = file.getExportSymbols();
  debugger;
  const docs = (
    exportSymbols.map((it) => {
      if (isJSXComponentKind(it)) return collectDocFromJSXComponent(it);
      if (isClassComponentKind(it)) return collectDocFromClassComponent(it);
      if (isTypesKind(it)) return collectDocFromType(it);
      if (isFunctionKind(it)) return collectDocFromFunction(it);
      if (isClassKind(it)) return collectDocFromClass(it);
      return null;
    }) as Document[]
  ).filter(Boolean);

  return docs;
};
