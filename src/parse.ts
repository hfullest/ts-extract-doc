import { Project, SourceFile, InterfaceDeclaration, Symbol } from 'ts-morph';
import { DocumentParseOptions } from './interface';
import { JSDocCustomTagEnum } from './utils/jsDocTagDefinition';
import { resolve } from 'path';
import { Document, DocumentCarryInfo, DocumentParser, defaultDocumentOptions } from './models';
import outputManager from './utils/OutputManager';
import { existsSync } from 'fs';
import logger from './utils/Logger';

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

  const tsConfigPath = parserOpts?.tsConfigPath ?? resolve(process.cwd(), 'tsconfig.json');
  
  if (existsSync(tsConfigPath)) {
    project.addSourceFilesFromTsConfig(tsConfigPath);
    logger.info(`tsConfig 成功加载配置`);
  } else {
    logger.error(`tsConfig 配置文件未找到`);
  }

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
  for (let symbol of outputSymbols) {
    const doc = DocumentParser(symbol as Symbol, Object.assign({}, parseOptions, new DocumentCarryInfo()));
    outputManager.append(doc!);
  }
  const docs = outputManager.getDocs();
  outputManager.clear(); // 清空本次文档处理
  const orderedDocs = docs.sort((a, b) => a.order - b.order);
  return orderedDocs;
};
