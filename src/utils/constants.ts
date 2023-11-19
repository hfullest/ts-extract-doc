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
  /** 手动指定文档输出 使用`@doc-output` */
  'output' = 'output',
  /** 手动指定为`react`组件 */
  'reactComponent' = 'reactComponent',
  /** 指定属性是否需要展开，可以指定展示深度，默认为`1`，该标签可用于属性类型为接口类型，需要继续展示该属性接口类型时指定 */
  'expand' = 'expand',
  /** `jsDoc`内注释开始标签，由于注释内注释需要转译等操作，编写成本较高，因此提供标签注释，配合`@annoteEnd`一起使用 */
  'annoteStart' = 'annoteStart',
  /** `jsDoc`内注释结束标签，由于注释内注释需要转译等操作，编写成本较高，因此提供标签注释，配合`@annoteStart`一起使用 */
  'annoteEnd' = 'annoteEnd',
}
