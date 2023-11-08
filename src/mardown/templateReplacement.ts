import { DataSource, Document, GenMarkdownOptions } from '../interface';

const getHeadLevel = (level: GenMarkdownOptions['headLevel']) => '#######'.slice(-level);

/** 填充表格 */
const fillTableByDoc = (doc: Document, type: 'props' | 'method', options: GenMarkdownOptions): string => {
  const { columns = [] } = options ?? {};
  debugger;
  const propsDoc = Object.entries(doc?.props ?? {}).filter(([, prop]) => !prop.isMethod);
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
        defaultValue: doc.defaultValue,
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
  const tableTitle = titleStr ? `|${titleStr}|` : '';
  const tableColSpan = colSpanStr ? `|${colSpanStr}|` : '';
  const dataRows = `${propsStr}`;
  const result = [tableTitle, tableColSpan, dataRows].filter(Boolean).join('\n');
  return `${result}\n`;
};

export const templateReplacement = (doc: Document, options: GenMarkdownOptions): string => {
  const { headLevel = 3, headerRender } = options ?? {};
  const { name, description, extraDescription, example } = doc;
  const header = headerRender?.(doc, getHeadLevel(headLevel)) ?? `${getHeadLevel(headLevel)} ${name}\n`;
  const desc = `${description}`;
  const propsTable = fillTableByDoc(doc, 'props', options);
  const extra = `${extraDescription}`;
  const exampleCode = example ? `\n\`\`\`tsx\n${example}\n\`\`\`` : '';
  const result = [header, desc, propsTable, extra, exampleCode].filter(Boolean).join('\n');
  return `${result}\n`;
};
