/** JSDoc 标准标签 */
export enum JSDocTagEnum {
  'abstract' = 'abstract',
  'virtual' = 'virtual',
  'access' = 'access',
  'alias' = 'alias',
  'async' = 'async',
  'augments' = 'augments',
  'extends' = 'extends',
  'author' = 'author',
  'borrows' = 'borrows',
  'callback' = 'callback',
  'class' = 'class',
  'constructor' = 'constructor',
  'classdesc' = 'classdesc',
  'constant' = 'constant',
  'const' = 'const',
  'constructs' = 'constructs',
  'copyright' = 'copyright',
  'default' = 'default',
  'defaultvalue' = 'defaultvalue',
  'deprecated' = 'deprecated',
  'description' = 'description',
  'desc' = 'desc',
  'enum' = 'enum',
  'event' = 'event',
  'example' = 'example',
  'exports' = 'exports',
  'external' = 'external',
  'host' = 'host',
  'file' = 'file',
  'fileoverview' = 'fileoverview',
  'overview' = 'overview',
  'fires' = 'fires',
  'emits' = 'emits',
  'function' = 'function',
  'func' = 'func',
  'method' = 'method',
  'generator' = 'generator',
  'global' = 'global',
  'hideconstructor' = 'hideconstructor',
  'ignore' = 'ignore',
  'implements' = 'implements',
  'inheritdoc' = 'inheritdoc',
  'inner' = 'inner',
  'instance' = 'instance',
  'interface' = 'interface',
  'kind' = 'kind',
  'lends' = 'lends',
  'license' = 'license',
  'listens' = 'listens',
  'member' = 'member',
  'var' = 'var',
  'memberof' = 'memberof',
  'mixes' = 'mixes',
  'mixin' = 'mixin',
  'module' = 'module',
  'name' = 'name',
  'namespace' = 'namespace',
  'override' = 'override',
  'package' = 'package',
  'param' = 'param',
  'argument' = 'argument',
  'arg' = 'arg',
  'private' = 'private',
  'property' = 'property',
  'prop' = 'prop',
  'protected' = 'protected',
  'public' = 'public',
  'readonly' = 'readonly',
  'requires' = 'requires',
  'returns' = 'returns',
  'return' = 'return',
  'see' = 'see',
  'since' = 'since',
  'static' = 'static',
  'summary' = 'summary',
  'this' = 'this',
  'throws' = 'throws',
  'exception' = 'exception',
  'todo' = 'todo',
  'tutorial' = 'tutorial',
  'type' = 'type',
  'typedef' = 'typedef',
  'variation' = 'variation',
  'version' = 'version',
  'yields' = 'yields',
  'yield' = 'yield',
}

/** 自定义`JSDoc`标签 */
export enum JSDocCustomTagEnum {
  /** 手动指定文档输出 使用`@output` */
  'output' = 'output',
  /** 手动指定忽略文档输出 使用`@ignoreOutput` */
  'ignoreOutput' = 'ignoreOutput',
  /** 手动指定为`react`组件 */
  'reactComponent' = 'reactComponent',
  /** `jsDoc`内注释开始标签，由于注释内注释需要转译等操作，编写成本较高，因此提供标签注释，配合`@annoteEnd`一起使用 */
  'annoteStart' = 'annoteStart',
  /** `jsDoc`内注释结束标签，由于注释内注释需要转译等操作，编写成本较高，因此提供标签注释，配合`@annoteStart`一起使用 */
  'annoteEnd' = 'annoteEnd',
  /** 尝试合并计算类型属性，可以指定计算深度，默认为`5`，如果失败则回退到最近的一次深度类型，可以手动指定计算深度，默认`-1`，递归计算所有深度 */
  'calculate' = 'calculate',
  /** 从当前层级开始往下，禁用属性类型计算，优先级比`@calculte`高 */
  'noCalculate' = 'noCalculate',
  /** 指定文档摆放顺序，用来排序 */
  'order' = 'order',
  /** 文档 id */
  'id' = 'id',
  /** 指定当前文档属性类型要特殊链接的地址，使用`@href {#id}`或者`@href {https://example.com}` */
  'href'='href'
}
