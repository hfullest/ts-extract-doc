import {
  Document,
  DocumentClass,
  DocumentClassComponent,
  DocumentEnum,
  DocumentFunction,
  DocumentFunctionComponent,
  DocumentInterface,
  DocumentMethod,
  DocumentProp,
} from '../../../models';
import DataSource from './DataSource';
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

function handleClassInterfaceEtc(doc: Document, options: TemplateBeauty) {
  const tableConfig = getTableConfig(doc, options);
  const propsTable = generateTable((doc as DocumentClass)?.props, doc, tableConfig, {
    header: tableConfig?.propHeadName,
  });
  const methodsTable = generateTable((doc as DocumentClass)?.methods, doc, tableConfig, {
    header: tableConfig?.methodHeadName,
  });
  const staticPropsTable = generateTable((doc as DocumentClass)?.staticProps, doc, tableConfig, {
    header: tableConfig?.staticPropHeadName,
  });
  const staticMethodsTable = generateTable((doc as DocumentClass)?.staticMethods, doc, tableConfig, {
    header: tableConfig.staticMethodHeadName,
  });
  return [propsTable, methodsTable, staticPropsTable, staticMethodsTable].filter(Boolean);
}

function handleFunction(doc: Document, options: TemplateBeauty): string[] {
  // const
  return [];
}

const CONTENT_RECORDS = [
  {
    types: [DocumentClass, DocumentInterface, DocumentEnum, DocumentFunctionComponent, DocumentClassComponent],
    handler: handleClassInterfaceEtc,
  },
  { types: [DocumentFunction], handler: handleFunction },
];

export const templateRender = (doc: Document, options: TemplateBeauty): string => {
  const { headLevel = 3, headerRender } = options ?? {};
  const { name, description, extraDescription, example } = doc;
  const header = headerRender?.(doc, headLevel) ?? `${getHeadLevel(headLevel)} ${name}\n`;
  const desc = description ? `<div>${description}</div>\n` : '';
  debugger;
  const targetHandler = CONTENT_RECORDS?.find((it) => it.types.some((Constor) => doc instanceof Constor))?.handler;
  const content = targetHandler?.(doc, options) ?? [];
  const extra = extraDescription ? `<div>${extraDescription}</div>` : '';
  const exampleCode = example ? `\n\`\`\`tsx\n${example}\n\`\`\`` : '';
  const result = [header, desc, ...content, exampleCode, extra].filter(Boolean).join('\n');
  return `${result}\n`;
};
