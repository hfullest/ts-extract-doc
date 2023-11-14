import { Project, SourceFile, ts, InterfaceDeclaration } from 'ts-morph';
import { Document, ParserOptions } from './interface';
import { JSDocCustomTagEnum } from './utils/constants';
import { resolve } from 'path';
import universalParse from './utils/universalParse';

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

  project.enableLogging();

  project.addSourceFilesFromTsConfig(resolve(process.cwd(), 'tsconfig.json'));

  project.addSourceFilesAtPaths(filePaths);

  const sourceFiles = project.getSourceFiles();

  const filesDocs = sourceFiles.filter((file) => filePaths.includes(file.getFilePath())).map(genDocuments);

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
      if (aStartLine !== bStartLine) return aStartLine - bStartLine;
      const aEndLine = aSym?.getDeclarations()?.[0]?.getEndLineNumber();
      const bEndLine = bSym?.getDeclarations()?.[0]?.getEndLineNumber();
      return aEndLine - bEndLine;
    });
  const docs = (Array.from(outputSymbols).map((it) => universalParse(it)) as Document[]).filter(Boolean);

  return docs;
};
