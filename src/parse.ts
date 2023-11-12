import {
  Project,
  SourceFile,
  ts,
  Symbol,
  Node,
  InterfaceDeclaration,
  FunctionDeclaration,
  ClassDeclaration,
} from 'ts-morph';
import { Document, ParserOptions } from './interface';
import { isClassComponentKind, isFCComponentKind, isEnumOrLiteralOrRecordKind } from './utils/utils';
import { collectDocFromFCComponent } from './source/fc-component';
import { collectDocFromClassComponent } from './source/class-component';
import { collectDocFromEnumOrLiteral } from './source/enum-literal-object';
import { DocumentClass, DocumentFunction, DocumentInterface, DocumentTypeAlias } from './modules';
import { JSDocCustomTagEnum } from './utils/constants';

export const defaultCompilerOptions: ts.CompilerOptions = {
  jsx: ts.JsxEmit.React,
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.Latest,
};

export const defaultParserOpts: ParserOptions = {};

export const parse = (
  filePathOrPaths: string | string[],
  compilerOptions: ts.CompilerOptions = defaultCompilerOptions,
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
  const localSymbols = file.getLocals();
  debugger;
  const outputSymbols = localSymbols
    ?.map((symbol) => {
      const node = (symbol.getValueDeclaration() ?? symbol.getDeclarations()[0]) as InterfaceDeclaration;
      if (node?.isExported?.()) return symbol;
      const tags = symbol?.getJsDocTags();
      if (tags?.some((tag) => tag.getName() === JSDocCustomTagEnum['output'])) return symbol;
    })
    .filter(Boolean)
    ?.sort((aSym, bSym) => {
      const aStartLine = aSym?.getDeclarations()?.[0]?.getStartLineNumber();
      const bStartLine = bSym?.getDeclarations()?.[0]?.getStartLineNumber();
      return aStartLine - bStartLine;
    });
  const docs = (
    Array.from(outputSymbols).map((it) => {
      const node = it?.getValueDeclaration() ?? it?.getDeclarations()[0];
      if (isFCComponentKind(it)) return collectDocFromFCComponent(it);
      if (isClassComponentKind(it)) return collectDocFromClassComponent(it);
      if (DocumentInterface.isTarget(node)) return new DocumentInterface(it);
      if (DocumentClass.isTarget(node)) return new DocumentClass(it);
      if (DocumentFunction.isTarget(node)) return new DocumentFunction(it);
      if (DocumentTypeAlias.isTarget(node)) return new DocumentTypeAlias(it);
      // if (isDeclarationKind(it)) return collectDocFromDeclaration(it);
      // if (isFunctionKind(it)) return collectDocFromFunction(it);
      if (isEnumOrLiteralOrRecordKind(it)) return collectDocFromEnumOrLiteral(it);
      return null;
    }) as Document[]
  ).filter(Boolean);

  return docs;
};
