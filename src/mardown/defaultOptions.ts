import { GenMarkdownOptions } from '../interface';

/** 默认配置 */
const defaultOptions: GenMarkdownOptions = {
  headerRender: (doc, headerMark) => `${headerMark} ${doc.name}${doc.version ? ` ~(${doc.version})~` : ''}\n`,
  headLevel: 3,
  columns: [
    {
      title: '名称',
      dataIndex: 'name',
      align: 'center',
      render: (record) => `${record.name}${record.isOptional ? ` ~(可选)~` : ''}`,
    },
    { title: '说明', dataIndex: 'description', align: 'center' },
    { title: '类型', dataIndex: 'type', align: 'center' },
    { title: '默认值', dataIndex: 'defaultValue', align: 'center' },
    { title: '版本', dataIndex: 'version', align: 'center' },
  ],
  table: {
    lineBreakDelimiter: ' ',
    whiteSpaceFill: '-',
  },
};

export default defaultOptions;
