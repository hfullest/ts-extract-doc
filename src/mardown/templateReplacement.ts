import { DataSource, Document, GenMarkdownOptions } from '../interface';
import { DocumentClass, DocumentInterface, DocumentMethod, DocumentProp } from '../modules';

const getHeadLevel = (level: GenMarkdownOptions['headLevel']) => '#######'.slice(-level);

/** 填充表格 */
const classFillTableByDoc = (
  doc: DocumentInterface | DocumentClass,
  type: 'props' | 'methods' | 'staticProps' | 'staticMethods',
  options: GenMarkdownOptions
): string => {
  const { columns = [] } = options ?? {};
  debugger;
  const currentHeader = getHeadLevel((options?.headLevel ?? 0) + 1);
  const typeMap: Record<
    typeof type,
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
      header: Object.keys(doc?.props ?? {}).length ? `${currentHeader} ${options?.table?.propHeadName}\n` : '',
      member: doc?.props,
    },
    methods: {
      header: Object.keys(doc?.methods ?? {}).length ? `${currentHeader} ${options?.table?.methodHeadName}\n` : '',
      member: doc?.methods,
    },
    staticProps: {
      header: Object.keys((doc as DocumentClass)?.staticProps ?? {}).length
        ? `${currentHeader} ${options?.table?.staticPropHeadName}\n`
        : '',
      member: (doc as DocumentClass)?.staticProps,
    },
    staticMethods: {
      header: Object.keys((doc as DocumentClass)?.staticMethods ?? {}).length
        ? `${currentHeader} ${options?.table?.staticPropHeadName}\n`
        : '',
      member: (doc as DocumentClass)?.staticMethods,
    },
  };
  const target = typeMap[type];
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
      const dataSource: DataSource = {
        name: doc.name,
        description: doc.description,
        defaultValue: doc?.defaultValue,
        isOptional: doc.isOptional,
        type: doc.type?.name,
        version: doc.version,
      };
      const fields = columns.map((col) => {
        if (typeof col?.render === 'function') return col.render(dataSource, index);
        return dataSource[col?.dataIndex] ?? options?.table?.whiteSpaceFill ?? defaultSpace;
      });
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
  return `${result}\n`;
};

export const templateReplacement = (doc: Document, options: GenMarkdownOptions): string => {
  const { headLevel = 3, headerRender } = options ?? {};
  const { name, description, extraDescription, example } = doc;
  const header = headerRender?.(doc, getHeadLevel(headLevel)) ?? `${getHeadLevel(headLevel)} ${name}\n`;
  const desc = description ? `${description}\n` : '';
  const propsTable = classFillTableByDoc(doc as DocumentInterface | DocumentClass, 'props', options);
  const methodsTable = classFillTableByDoc(doc as DocumentInterface | DocumentClass, 'methods', options);
  const staticPropsTable = classFillTableByDoc(doc as DocumentInterface | DocumentClass, 'staticProps', options);
  const staticMethodsTable = classFillTableByDoc(doc as DocumentInterface | DocumentClass, 'staticMethods', options);
  const extra = extraDescription ? `${extraDescription}` : '';
  const exampleCode = example ? `\n\`\`\`tsx\n${example}\n\`\`\`` : '';
  const result = [header, desc, propsTable, methodsTable, staticPropsTable, staticMethodsTable, extra, exampleCode]
    .filter(Boolean)
    .join('\n');
  return `${result}\n`;
};
