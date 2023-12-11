import { TableConfig } from '.';
import { Document } from '../../../models';
import { encodeBase64 } from '../../../utils/base64';
import DataSource, { DataSourceDocumentType } from './DataSource';

export const generateTable = (
  propDocs: DataSourceDocumentType[],
  document: Document,
  config: TableConfig,
  options: { header?: string; css?: string; footer?: string },
) => {
  if (!propDocs?.length) return '';
  const { columns = [] } = config ?? {};
  const headerTh = columns
    .map((it) => {
      const style = it?.align ? `style='text-align:${it.align}'` : '';
      return `<th ${style}>${it.title}</th>`;
    })
    .join('\n');
  const headerRows = headerTh ? `<thead>\n<tr>\n${headerTh}\n</tr>\n</thead>` : '';
  const bodyTd = propDocs
    .map((doc, index) => {
      const dataSource = new DataSource(doc, document);
      const fields = columns
        .map((col) => {
          const content = {
            current: dataSource[col?.dataIndex]?.toString().replace(/\n/g, config?.lineBreakDelimiter ?? '\n'),
          };
          if (typeof col?.render === 'function') content.current = col.render(dataSource, index, doc);
          const style = col?.align ? `style='text-align:${col?.align}'` : '';
          return `<td data-field='${col?.dataIndex}' ${style}>${content.current ?? config?.whiteSpaceFill}</td>`;
        })
        .join('\n');
      return `<tr>${fields ? `\n${fields}\n` : ''}</tr>`;
    })
    .join('\n');
  const bodyRows = `<tbody>${bodyTd ? `\n${bodyTd}\n` : ''}</tbody>`;
  const header = options?.header;
  const fullId = encodeBase64([...document?.getId(), header, 'table'].join('-'));
  const presetCss = options?.css
    ? `<style>${options?.css}</style>`
    : `<style>
    table[data-id='${fullId}'] p { margin:0;}
    table[data-id='${fullId}'] [data-field='type'],
    table[data-id='${fullId}'] [data-field='referenceType']{color:${config?.themeColor ?? 'unset'}}
    </style>`;
  const tableContent = [presetCss, headerRows, bodyRows].filter(Boolean).join('\n');
  const table = columns?.length && propDocs?.length ? `<table data-id='${fullId}'>\n${tableContent}\n</table>\n` : '';

  return [header, table, options?.footer?.toString()].filter(Boolean).join('\n');
};
