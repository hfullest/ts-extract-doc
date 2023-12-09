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
import { TemplateBeauty } from './interface';

export type FillType = 'props' | 'methods' | 'staticProps' | 'staticMethods';

const getHeadLevel = (level: TemplateBeauty['headLevel'] = 0) => '#######'.slice(-level);

const getTargetInfo = (type: FillType, doc: DocumentClass, config: { headMark: string } & TemplateBeauty) => {
  const headMark = config?.headMark ?? '';
  const typeMap: Record<
    FillType,
    {
      header: string;
      member:
        | DocumentClass['props']
        | DocumentClass['methods']
        | DocumentClass['staticProps']
        | DocumentClass['staticMethods'];
    }
  > = {
    props: {
      header: Object.keys(doc?.props ?? {}).length ? `${headMark} ${config?.table?.propHeadName}\n` : '',
      member: doc?.props,
    },
    methods: {
      header: Object.keys(doc?.methods ?? {}).length ? `${headMark} ${config?.table?.methodHeadName}\n` : '',
      member: doc?.methods,
    },
    staticProps: {
      header: Object.keys((doc as DocumentClass)?.staticProps ?? {}).length
        ? `${headMark} ${config?.table?.staticPropHeadName}\n`
        : '',
      member: (doc as DocumentClass)?.staticProps,
    },
    staticMethods: {
      header: Object.keys((doc as DocumentClass)?.staticMethods ?? {}).length
        ? `${headMark} ${config?.table?.staticMethodHeadName}\n`
        : '',
      member: (doc as DocumentClass)?.staticMethods,
    },
  };
  return typeMap[type];
};

/** 填充类或interface文档表格 */
const fillClassOrInterfaceTableByDoc = (
  doc: DocumentInterface | DocumentClass,
  type: FillType,
  options: TemplateBeauty,
): string => {
  const { columns = [] } = options ?? {};
  const headMark = getHeadLevel((options?.headLevel ?? 0) + 1);
  const target = getTargetInfo(type, doc as DocumentClass, { ...options, headMark });
  const propsDoc: [string, DocumentProp | DocumentMethod][] = Object.entries(target?.member ?? {});
  const headerTh = columns
    .map((it) => {
      const style = it?.align ? `style='text-align:${it.align}'` : '';
      return `<th ${style}>${it.title}</th>`;
    })
    .join('\n');
  const headerRows = headerTh ? `<thead>\n<tr>\n${headerTh}\n</tr>\n</thead>` : '';
  const bodyTd = propsDoc
    .map(([, doc], index) => {
      const dataSource = new DataSource(doc);
      const fields = columns
        .map((col) => {
          const content = { current: dataSource[col?.dataIndex] };
          if (typeof col?.render === 'function') content.current = col.render(dataSource, index, doc);
          const style = col?.align ? `style='text-align:${col?.align}'` : '';
          return `<td data-type='${col?.dataIndex}' ${style}>${content.current ?? options?.table?.whiteSpaceFill}</td>`;
        })
        .join('\n');
      return `<tr>${fields ? `\n${fields}\n` : ''}</tr>`;
    })
    .join('\n');
  const bodyRows = `<tbody>${bodyTd ? `\n${bodyTd}\n` : ''}</tbody>`;
  const header = target?.header;
  const presetCss = `<style>table[data-id='${doc.id}'] p { margin:0; }</style>`;
  const tableContent = [presetCss, headerRows, bodyRows].filter(Boolean).join('\n');
  const table = columns?.length && propsDoc?.length ? `<table data-id='${doc.id}'>\n${tableContent}\n</table>\n` : '';

  return [header, table].filter(Boolean).join('\n');
};

function handleClassInterfaceEtc(doc: Document, options: TemplateBeauty) {
  const propsTable = fillClassOrInterfaceTableByDoc(doc as DocumentInterface | DocumentClass, 'props', options);
  const methodsTable = fillClassOrInterfaceTableByDoc(doc as DocumentInterface | DocumentClass, 'methods', options);
  const staticPropsTable = fillClassOrInterfaceTableByDoc(
    doc as DocumentInterface | DocumentClass,
    'staticProps',
    options,
  );
  const staticMethodsTable = fillClassOrInterfaceTableByDoc(
    doc as DocumentInterface | DocumentClass,
    'staticMethods',
    options,
  );
  return [propsTable, methodsTable, staticPropsTable, staticMethodsTable].filter(Boolean);
}

function handleReactComponent(doc: Document, options: TemplateBeauty): string[] {
  return [];
}

const CONTENT_RECORDS = [
  {
    types: [DocumentClass, DocumentInterface, DocumentEnum, DocumentFunctionComponent, DocumentClassComponent],
    handler: handleClassInterfaceEtc,
  },
  { types: [DocumentFunction], handler: handleReactComponent },
];

export const templateRender = (doc: Document, options: TemplateBeauty): string => {
  const { headLevel = 3, headerRender } = options ?? {};
  const { name, description, extraDescription, example } = doc;
  const header = headerRender?.(doc, headLevel) ?? `${getHeadLevel(headLevel)} ${name}\n`;
  const desc = description ? `<div>${description}</div>\n` : '';
  const targetHandler = CONTENT_RECORDS?.find((it) =>
    it.types.some((Constor) => Reflect.getPrototypeOf(doc) === Constor.prototype),
  )?.handler;
  const content = targetHandler?.(doc, options) ?? [];
  const extra = extraDescription ? `<div>${extraDescription}</div>` : '';
  const exampleCode = example ? `\n\`\`\`tsx\n${example}\n\`\`\`` : '';
  const result = [header, desc, ...content, exampleCode, extra].filter(Boolean).join('\n');
  return `${result}\n`;
};
