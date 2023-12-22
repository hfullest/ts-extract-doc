import { DocumentEnum } from '../../../models';
import { escapeHTMLTags } from '../../../utils/escapeHTMLTag';
import { TableConfig, TemplateBeauty } from './interface';

/** `markdown`默认`beauty`模版配置 */
const beautyMarkdownOptions: TemplateBeauty = {
  template: 'beauty',
  headerRender: (doc, headerLevel) => {
    headerLevel = (Number(headerLevel) || 3) % 7;
    const versionStyle = `
    position:absolute;
    font-size:0.6em;
    color:#888;
    top:0;
    margin-left:0.2em;
    background-color:#eee;
    padding:0.05em 0.3em;
    border-radius:0.3em;`;
    const versionHtml = doc?.version ? `<span style='${versionStyle}'>${escapeHTMLTags(doc?.version)}</span>` : '';
    const content = [escapeHTMLTags(doc?.toFullNameString()), versionHtml].filter(Boolean).join('');
    return `<h${headerLevel} id='${doc?.getId()}' style='position:relative'>${content}</h${headerLevel}>\n`;
  },
  headLevel: 3,
  fileInfo: {
    showLocation: true,
    showUpdateTime: true,
    position: 'left',
  },
  table: (doc, config, options) => {
    const level = (options?.headLevel ?? 3) + 1;
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        align: 'center',
        render: (record) =>
          `${record.name}${record.isOptional ? ` (可选)` : ''} ${record?.deprecated ? `(已废弃)` : ''}`,
      },
      { title: '说明', dataIndex: 'description', align: 'center' },
      { title: '类型', dataIndex: 'referenceType', align: 'center' },
      { title: '默认值', dataIndex: 'defaultValue', align: 'center' },
      { title: '版本', dataIndex: 'version', align: 'center' },
    ] as TableConfig['columns'];
    const enumColums = [
      {
        title: '名称',
        dataIndex: 'label',
        align: 'center',
        render: (record) =>
          `${record.name}${record.isOptional ? ` (可选)` : ''} ${record?.deprecated ? `(已废弃)` : ''}`,
      },
      { title: '值', dataIndex: 'value', align: 'center' },
      { title: '描述', dataIndex: 'description', align: 'center' },
    ] as TableConfig['columns'];
    return {
      themeColor: '#c41d7f',
      columns: doc instanceof DocumentEnum ? enumColums : columns,
      propHeadName: `<h${level} id='${doc.getId(['props'])}'>属性</h${level}>\n`,
      methodHeadName: `<h${level} id='${doc.getId(['methods'])}'>方法</h${level}>\n`,
      staticPropHeadName: `<h${level} id='${doc.getId(['staticProps'])}'>静态属性</h${level}>\n`,
      staticMethodHeadName: `<h${level} id='${doc.getId(['staticMethods'])}'>静态方法</h${level}>\n`,
      memberHeadName: `<h${level} id='${doc.getId(['members'])}'>成员</h${level}>\n`,
      paramHeadName: `<h${level} id='${doc.getId(['params'])}'>参数</h${level}>\n`,
      returnHeadName: `<h${level} id='${doc.getId(['returns'])}'>返回类型</h${level}>\n`,
      eventHeadName: `<h${level} id='${doc.getId(['events'])}'>事件</h${level}>\n`,
      lineBreakDelimiter: ' ',
      whiteSpaceFill: '-',
      escapeRules(text) {
        // 处理包含`|`字符串文本，替换成`\|`进行转译
        if (text.includes('|')) {
          return text.replace(/([^`]*)(`[^`]*`)?([^`]*)/g, ($0, $1, $2, $3) => {
            return `${$1?.replaceAll('|', `\\|`) ?? ''}${$2 ?? ''}${$3?.replaceAll('|', `\\|`) ?? ''}`;
          });
        }
        return text;
      },
      referenceHandler: (href, content) => `<a href="${href}">${content}</a>`,
    };
  },
};

export { beautyMarkdownOptions };
