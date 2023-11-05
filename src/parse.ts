import { Project, SourceFile, ts, Symbol } from 'ts-morph';
import { Document, ParserOptions } from './interface';
import {
  isClassComponentKind,
  isClassKind,
  isFunctionKind,
  isFCComponentKind,
  isDeclarationKind,
  isEnumOrLiteralOrRecordKind,
} from './utils/utils';
import { collectDocFromDeclaration } from './source/declaration';
import { collectDocFromFunction } from './source/function';
import { collectDocFromClass } from './source/class';
import { collectDocFromFCComponent } from './source/fc-component';
import { collectDocFromClassComponent } from './source/class-component';
import { collectDocFromEnumOrLiteral } from './source/enum-literal-object';

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
      if (isFCComponentKind(it)) return collectDocFromFCComponent(it);
      if (isClassComponentKind(it)) return collectDocFromClassComponent(it);
      if (isDeclarationKind(it)) return collectDocFromDeclaration(it);
      if (isFunctionKind(it)) return collectDocFromFunction(it);
      if (isClassKind(it)) return collectDocFromClass(it);
      if (isEnumOrLiteralOrRecordKind(it)) return collectDocFromEnumOrLiteral(it);
      return null;
    }) as Document[]
  ).filter(Boolean);

  return docs;
};
