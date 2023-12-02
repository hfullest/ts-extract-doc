import { Project, SourceFile, InterfaceDeclaration, Symbol } from 'ts-morph';
import { DocumentParseOptions } from './interface';
import { JSDocCustomTagEnum } from './utils/constants';
import { resolve } from 'path';
import { Document, DocumentParser, defaultDocumentOptions } from './models';

const singletonProject = new Project();

export const parse = (
  filePathOrPaths: string | string[],
  parserOpts: DocumentParseOptions = defaultDocumentOptions,
): Document[][] => {
  const filePaths = Array.isArray(filePathOrPaths) ? filePathOrPaths : [filePathOrPaths];
  const singleton = parserOpts?.singleton ?? true;
  const customProject = parserOpts?.project;
  const defaultProject = singleton ? singletonProject : new Project();
  const project = typeof customProject === 'function' ? customProject(singleton) : defaultProject;

  project.addSourceFilesFromTsConfig(parserOpts?.tsConfigPath ?? resolve(process.cwd(), 'tsconfig.json'));

  project.addSourceFilesAtPaths(filePaths);

  const sourceFiles = project.getSourceFiles();

  const filesDocs = sourceFiles
    .filter((file) => filePaths.includes(file.getFilePath()))
    .map((it) => genDocuments(it, parserOpts));

  return filesDocs;
};

export const genDocuments = (file: SourceFile, parseOptions: DocumentParseOptions): Document[] => {
  const localSymbols = file.getLocals();
  const strategy = {
    default: (parseOptions?.strategy ?? 'default') === 'default',
    export: parseOptions?.strategy === 'export',
    manual: parseOptions?.strategy === 'manual',
  };
  debugger;
  const outputSymbols = localSymbols
    ?.map((symbol) => {
      const tags = symbol?.getJsDocTags();
      const tagsModel = tags.reduce(
        (res, tag) => {
          if (tag.getName() === JSDocCustomTagEnum['ignoreOutput']) res.ignoreOutput = true;
          else if (tag.getName() === JSDocCustomTagEnum['output']) res.output = true;
          return res;
        },
        { ignoreOutput: false, output: false },
      );
      if (strategy.manual || strategy.default) {
        if (tagsModel.ignoreOutput) return;
        if (tagsModel.output) return symbol;
      }
      if (strategy.export || strategy.default) {
        const node = (symbol.getValueDeclaration() ?? symbol.getDeclarations()[0]) as InterfaceDeclaration;
        if (node?.isExported?.()) return symbol;
      }
      return;
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
