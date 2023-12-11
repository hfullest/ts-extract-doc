import {
  Document,
  DocumentClass,
  DocumentClassComponent,
  DocumentEnum,
  DocumentFunction,
  DocumentFunctionComponent,
  DocumentInterface,
  DocumentIntersection,
  DocumentObject,
} from '../../../models';
import { getFileUpdateTime } from '../../../utils/getFileUpdateTime';
import { beautyMarkdownOptions } from './defaultOptions';
import { TableConfig, TableConfigFunction, TemplateBeauty } from './interface';
import { generateTable } from './table';

export type FillType = 'props' | 'methods' | 'staticProps' | 'staticMethods';

const getHeadLevel = (level: TemplateBeauty['headLevel'] = 0) => '#######'.slice(-level);

const getTableConfig = (doc: Document, options: TemplateBeauty): TableConfig => {
  const tableConfig = {
    current: (beautyMarkdownOptions?.table as TableConfigFunction)?.(doc, {} as TableConfig, options),
  };
  if (typeof options?.table === 'function') {
    tableConfig.current = options?.table?.(doc, tableConfig.current, options);
  }
  return tableConfig.current;
};

function handleClassInterfaceEtc(doc: Document, options: TemplateBeauty): string[] {
  const tableConfig = getTableConfig(doc, options);
  const propsTable = generateTable(Array.from(Object.values((doc as DocumentClass)?.props ?? {})), doc, tableConfig, {
    header: tableConfig?.propHeadName,
  });
  const methodsTable = generateTable(
    Array.from(Object.values((doc as DocumentClass)?.methods ?? {})),
    doc,
    tableConfig,
    {
      header: tableConfig?.methodHeadName,
    },
  );
  const staticPropsTable = generateTable(
    Array.from(Object.values((doc as DocumentClass)?.staticProps ?? {})),
    doc,
    tableConfig,
    { header: tableConfig?.staticPropHeadName },
  );
  const staticMethodsTable = generateTable(
    Array.from(Object.values((doc as DocumentClass)?.staticMethods ?? {})),
    doc,
    tableConfig,
    { header: tableConfig.staticMethodHeadName },
  );
  return [propsTable, methodsTable, staticPropsTable, staticMethodsTable].filter(Boolean);
}

function handleFunction(doc: Document, options: TemplateBeauty): string[] {
  const tableConfig = getTableConfig(doc, options);
  const funDoc = doc instanceof DocumentFunction ? doc : null;
  const paramsTable = generateTable(funDoc?.parameters!, doc, tableConfig, {
    header: tableConfig?.propHeadName,
  });
  const returnHead = tableConfig?.returnHeadName!;
  const returns = funDoc?.returns?.type?.toTypeString()!;
  const returnContent = returns ? `<code>${returns}</code>\n` : '';
  const returnFooter = funDoc?.returns?.type?.description ?? funDoc?.returns?.description;
  return [paramsTable, returnHead, returnContent, returnFooter!].filter(Boolean);
}

function handleEnum(doc: Document, options: TemplateBeauty): string[] {
  const tableConfig = getTableConfig(doc, options);
  const enumDoc = doc instanceof DocumentEnum ? doc : null;
  const membersTable = generateTable(enumDoc?.members!, doc, tableConfig, {
    header: tableConfig?.memberHeadName,
  });
  return [membersTable].filter(Boolean);
}

function genFileInfo(doc: Document, options: TemplateBeauty): string {
  const fileInfo = options?.fileInfo;
  if (!fileInfo) return '';
  const location = fileInfo?.showLocation ? doc?.location : '';
  const position = fileInfo?.position;
  const lastUpdateTime = getFileUpdateTime(doc);
  const justifyContent = position === 'left' ? 'flex-start' : position === 'center' ? 'center' : 'flex-end';
  const locationHtml = `<span onclick="navigator.clipboard.writeText(\'${location}\')" style='display:flex;align-items:center;cursor:pointer;text-decoration: underline;'>${location}</span>`;
  return `<div style='font-size:0.8em;margin-top:10px;display:flex;justify-content:${justifyContent};align-items:center;'>
  文件位置：${locationHtml}&ensp;&ensp;
  上次更新时间：<span>${lastUpdateTime}</span>
  </div>`;
}

const CONTENT_RECORDS = [
  {
    types: [
      DocumentClass,
      DocumentInterface,
      DocumentObject,
      DocumentIntersection,
      DocumentFunctionComponent,
      DocumentClassComponent,
    ],
    handler: handleClassInterfaceEtc,
  },
  { types: [DocumentFunction], handler: handleFunction },
  { types: [DocumentEnum], handler: handleEnum },
];

export const templateRender = (doc: Document, options: TemplateBeauty): string => {
  const { headLevel = 3, headerRender } = options ?? {};
  const { name, description, extraDescription, example } = doc;
  const header = headerRender?.(doc, headLevel) ?? `${getHeadLevel(headLevel)} ${name}\n`;
  const desc = description ? `<div>${description}</div>\n` : '';
  const targetHandler = CONTENT_RECORDS?.find((it) => it.types.some((Constor) => doc instanceof Constor))?.handler;
  const content = targetHandler?.(doc, options) ?? [];
  const extra = extraDescription ? `<div>${extraDescription}</div>` : '';
  const exampleCode = example ? `\n\`\`\`tsx\n${example}\n\`\`\`` : '';
  const fileInfo = genFileInfo(doc, options);
  const result = [header, desc, ...content, exampleCode, extra, fileInfo].filter(Boolean).join('\n');
  return `${result}\n`;
};
