import { DataSource, Document, GenMarkdownOptions } from '../interface';
import { DocumentClass, DocumentInterface, DocumentMethod, DocumentProp } from '../modules';

const getHeadLevel = (level: GenMarkdownOptions['headLevel']) => '#######'.slice(-level);

/** 填充表格 */
const fillTableByDoc = (
  doc: DocumentInterface | DocumentClass,
  type: 'props' | 'methods',
  options: GenMarkdownOptions
): string => {
  const { columns = [], table: { propHeadName = '', methodHeadName = '' } = {} } = options ?? {};
  debugger;
  const currentHeader = getHeadLevel((options?.headLevel ?? 0) + 1);
  const propsDoc: [string, DocumentProp | DocumentMethod][] = Object.entries(
    (type === 'methods' ? doc?.methods : doc?.props) ?? {}
  );
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
        defaultValue: type === 'props' ? (doc as DocumentProp)?.defaultValue : void 0,
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
  const headerName = type === 'methods' ? methodHeadName : propHeadName;
  const header = `${currentHeader} ${headerName}\n`;
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
  const desc = `${description}\n`;
  const propsTable = fillTableByDoc(doc as DocumentInterface | DocumentClass, 'props', options);
  const methodsTable = fillTableByDoc(doc as DocumentInterface | DocumentClass, 'methods', options);
  const extra = `${extraDescription}`;
  const exampleCode = example ? `\n\`\`\`tsx\n${example}\n\`\`\`` : '';
  const result = [header, desc, propsTable, methodsTable, extra, exampleCode].filter(Boolean).join('\n');
  return `${result}\n`;
};
