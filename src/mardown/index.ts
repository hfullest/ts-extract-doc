import { Document, TableDataSource } from '../interface';

export interface GenMarkdownOptions {
  headLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const generateMarkdown = (docsFiles: Document[][], options: GenMarkdownOptions = {}): string => {
  const documents: string[] = [];
  docsFiles.forEach((file) => {
    file.forEach((doc) => {
      documents.push(templateReplacement(doc, options));
    });
  });
  return documents.join('\n');
};

const getHeadLevel = (level: GenMarkdownOptions['headLevel']) => '#######'.slice(-level);

const fillPropsTableByDoc = (
  doc: Document,
  options?: {
    columns: {
      align?: 'left' | 'right' | 'center';
      dataIndex: keyof TableDataSource;
      title: string;
    }[];
  }
): string => {
  const { columns } = options;
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
  const propsStr = propsDoc
    ?.map(([, doc]) => {
      const fields = columns.map((col) => {
        const defaultSpace = ' ';
        switch (col?.dataIndex) {
          case 'name':
            return doc.name ?? defaultSpace;
          case 'description':
            return doc.description ?? defaultSpace;
          case 'defaultValue':
            return doc.defaultValue ?? defaultSpace;
          case 'isOptional':
            return doc.isOptional ?? defaultSpace;
          case 'type':
            return doc.type.name ?? defaultSpace;
          case 'version':
            return doc.version ?? defaultSpace;
        }
      });
      return `|${fields.join('|').replace(/\n/g, '<br/>')}|`;
    })
    .join('\n');
  const tableTitle = `|${titleStr}|`;
  const tableColSpan = `|${colSpanStr}|`;
  const dataRows = `${propsStr}`;
  return [tableTitle, tableColSpan, dataRows].join('\n');
};

const templateReplacement = (doc: Document, options: GenMarkdownOptions): string => {
  const { headLevel: topLevel = 3 } = options;
  const { name, description, extraDescription, example } = doc;
  const header = `${getHeadLevel(topLevel)} ${name}`;
  const desc = `${description}`;
  const propsTable = fillPropsTableByDoc(doc, {
    columns: [
      { title: '名称', dataIndex: 'name', align: 'center' },
      { title: '说明', dataIndex: 'description', align: 'left' },
      { title: '类型', dataIndex: 'type', align: 'right' },
      { title: '默认值', dataIndex: 'defaultValue' },
      { title: '版本', dataIndex: 'version' },
    ],
  });
  const extra = `${extraDescription}`;
  const exampleCode = example ? `\n\`\`\`tsx\n${example}\n\`\`\`` : '';
  const result = [header, desc, propsTable, extra, exampleCode].filter(Boolean).join('\n');
  return `\n${result}\n`;
};
