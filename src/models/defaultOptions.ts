import { DocumentParseOptions } from '../interface';

/** 文档解析默认配置 */
const documentParseOptions: DocumentParseOptions = {
  nestedLevel: 0,
  maxNestedLevel: 2,
  strategy: 'default',
  singleton: true,
  idGenerator: (name) => name?.toLocaleLowerCase(),
  autoCalculate:true,
};

export default documentParseOptions;
