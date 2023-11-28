import { Project, SourceFile, InterfaceDeclaration, Symbol } from 'ts-morph';
import { DocumentParseOptions } from './interface';
import { JSDocCustomTagEnum } from './utils/constants';
import { resolve } from 'path';
import { Document, DocumentParser, defaultDocumentOptions } from './models';

const singletonProject = new Project();

export const parse = (
  filePathOrPaths: string | string[],
  parserOpts: DocumentParseOptions = defaultDocumentOptions,
  singleton = false,
): Document[][] => {
  const filePaths = Array.isArray(filePathOrPaths) ? filePathOrPaths : [filePathOrPaths];

  const project = singleton ? singletonProject : new Project();

  project.addSourceFilesFromTsConfig(parserOpts?.tsConfigPath ?? resolve(process.cwd(), 'tsconfig.json'));

  project.addSourceFilesAtPaths(filePaths);

  const sourceFiles = project.getSourceFiles();

  const filesDocs = sourceFiles
    .filter((file) => filePaths.includes(file.getFilePath()))
    .map((it) => genDocuments(it, { ...parserOpts, project }));

  return filesDocs;
};

export const genDocuments = (file: SourceFile, parseOptions: DocumentParseOptions): Document[] => {
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
      const aStartLine = aSym?.getDeclarations()?.[0]?.getStartLineNumber() ?? 0;
      const bStartLine = bSym?.getDeclarations()?.[0]?.getStartLineNumber() ?? 0;
      if (aStartLine !== bStartLine) return aStartLine - bStartLine;
      const aEndLine = aSym?.getDeclarations()?.[0]?.getEndLineNumber() ?? 0;
      const bEndLine = bSym?.getDeclarations()?.[0]?.getEndLineNumber() ?? 0;
      return aEndLine - bEndLine;
    });
  const docs = (
    Array.from(outputSymbols ?? []).map((it) => DocumentParser(it as Symbol, parseOptions)) as Document[]
  ).filter(Boolean);

  return docs;
};
