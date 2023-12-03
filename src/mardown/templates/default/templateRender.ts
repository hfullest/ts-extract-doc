import { Document, DocumentClass, DocumentInterface, DocumentMethod, DocumentProp } from '../../../models';
import DataSource from './DataSource';
import { TemplateDefault } from './interface';

export type FillType = 'props' | 'methods' | 'staticProps' | 'staticMethods';

const getHeadLevel = (level: TemplateDefault['headLevel'] = 0) => '#######'.slice(-level);

const getTargetInfo = (type: FillType, doc: DocumentClass, config: { headMark: string } & TemplateDefault) => {
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
  options: TemplateDefault,
): string => {
  const { columns = [] } = options ?? {};
  const headMark = getHeadLevel((options?.headLevel ?? 0) + 1);
  const target = getTargetInfo(type, doc as DocumentClass, { ...options, headMark });
  const propsDoc: [string, DocumentProp | DocumentMethod][] = Object.entries(target?.member ?? {});
  const titleStr = columns.map((it) => it.title).join('|');
  const colSpanStr = columns
    .map((it) => {
      const splits = Array(it?.title.length).fill('-');
      switch (it.align) {
        case 'center':
          splits.unshift(':');
          splits.push(':');
          break;
        case 'left':
          splits.unshift(':');
          break;
        case 'right':
          splits.push(':');
          break;
      }
      return splits.join('');
    })
    .join('|');
  const defaultSpace = String.fromCharCode(32); /** 空格 */
  const propsStr = propsDoc
    ?.map(([, doc], index) => {
      const dataSource = new DataSource(doc);
      const fields = columns
        .map((col) => {
          if (typeof col?.render === 'function') return col.render(dataSource, index, doc);
          return (dataSource[col?.dataIndex] ?? options?.table?.whiteSpaceFill ?? defaultSpace) as string;
        })
        .map((it) => options.table?.escapeRules?.(it) ?? it);
      if (!fields.length) return '';
      return `|${fields.join('|').replace(/\n/g, options?.table?.lineBreakDelimiter ?? defaultSpace)}|`;
    })
    .filter(Boolean)
    .join('\n');
  const header = target?.header;
  const tableTitle = titleStr ? `|${titleStr}|` : '';
  const tableColSpan = colSpanStr ? `|${colSpanStr}|` : '';
  const dataRows = `${propsStr}`;
  const result = [header, tableTitle, tableColSpan, dataRows].filter(Boolean).join('\n');
  return dataRows ? `${result}\n` : '';
};

export const templateRender = (doc: Document, options: TemplateDefault): string => {
  const { headLevel = 3, headerRender } = options ?? {};
  const { name, description, extraDescription, example } = doc;
  const header = headerRender?.(doc, getHeadLevel(headLevel)) ?? `${getHeadLevel(headLevel)} ${name}\n`;
  const desc = description ? `${description}\n` : '';
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
  const extra = extraDescription ? `${extraDescription}` : '';
  const exampleCode = example ? `\n\`\`\`tsx\n${example}\n\`\`\`` : '';
  const result = [header, desc, propsTable, methodsTable, staticPropsTable, staticMethodsTable, extra, exampleCode]
    .filter(Boolean)
    .join('\n');
  return `${result}\n`;
};
