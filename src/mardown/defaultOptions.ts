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
      render: (record) => `${record.name}${record.isOptional ? ` ~(可选)~` : ''} ${record?.deprecated ? `*~(已废弃)~*` : ''}`,
    },
    { title: '说明', dataIndex: 'description', align: 'center' },
    { title: '类型', dataIndex: 'type', align: 'center' },
    { title: '默认值', dataIndex: 'defaultValue', align: 'center' },
    { title: '版本', dataIndex: 'version', align: 'center' },
  ],
  table: {
    propHeadName: '属性',
    methodHeadName: '方法',
    staticPropHeadName: '静态属性',
    staticMethodHeadName: '静态方法',
    lineBreakDelimiter: ' ',
    whiteSpaceFill: '-',
  },
};

export default defaultOptions;
