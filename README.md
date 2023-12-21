# ts-extract-doc

Typescript项目文档提取。

`ts-extract-doc`库基于 [ts-morph](https://github.com/dsherret/ts-morph)，通过抽象语法树分析提取 `typescript`声明的 `函数`、`类`、`接口（interface）`、`类型别名(TypeAlias)`、`枚举`、`react组件(类组件和函数组件)`的 `jsdoc`文档注释和类型，生成文档元数据模型，再通过解析相应的文档模型即可定制 `markdown`文档生成结构。该库支持自定义 `jsdoc`注释标签并自行使用。

## 安装

```shell
yarn add -D ts-extract-doc

// pnpm i -D ts-extract-doc

// npm i -D ts-extract-doc
```

## 使用

基本使用

```js
import { resolve }  from 'path';
import { writeFileSync } from "fs";
import { extractTsToMarkdown } from 'ts-extract-doc';

const path ="your/path/to/ts/file";
const result = extractTsToMarkdown(path);
writeFileSync(resolve(process.cwd(), "./markdown.md"), result, "utf-8");

```

高级使用

```js
import { resolve }  from 'path';
import { writeFileSync } from "fs";
import { extractTsToMarkdown } from 'ts-extract-doc';

// 可以定制自己需要的文档渲染规则
const markdownOptions = {
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
};
const path ="your/path/to/ts/file";
const result = extractTsToMarkdown(path, { markdown: markdownOptions });
writeFileSync(resolve(process.cwd(), "./markdown.md"), result, "utf-8");
```

## 文档说明

可用方法：

- `extractTsToMarkdown(path:string, options: ConfigOptions):string` 从入口文件提取成 `markdown`文档
- `parseSourceFile(filePathOrPaths: string | string[], parseOptions?: DocumentParseOptions):Document[][]` 解析入口文件生成文档模型
- `generateMarkdown(docsFiles: Document[][], options: GenMarkdownOptions = defaultOptions): string` 将文档模型转换成 `markdown`文档

### ConfigOptions

全部配置选项，`extractTsToMarkdown(path:string, options: ConfigOptions)`

|        名称        |        说明        | 类型                                           | 默认值 |
| :----------------: | :-----------------: | ---------------------------------------------- | :----: |
|   markdown(可选)   | markdown 相关的配置 | [`GenMarkdownOptions`](#genmarkdownoptions)     |   -   |
| tsConfigPath(可选) |  tsconfig.json路径  | `string`                                     |   -   |
|   document(可选)   |  文档生成相关配置  | [`DocumentParseOptions`](#documentparseoptions) |   -   |

### GenMarkdownOptions

#### 属性

|       名称       |     说明     |                                                                                                                                    类型                                                                                                                                    | 默认值 | 版本 |
| :---------------: | :----------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :----: | :--: |
| headLevel~(可选)~ | 默认标题等级 |                                                                                                                    1\| 2 \| 3 \| 4 \| 5 \| 6 \| number                                                                                                                    |   -   |  -  |
|      columns      |  表格列配置  |                                                                                                                       [OptionsColums[]](#optionscolums)                                                                                                                       |   -   |  -  |
|   table~(可选)~   |      -      | {          propHeadName: string;          methodHeadName: string;          staticPropHeadName: string;          staticMethodHeadName: string;          lineBreakDelimiter?: string;          whiteSpaceFill?: string;          escapeRules?: (text: string) => string;   } |   -   |  -  |

#### 方法

|         名称         |      说明      |                     类型                     | 默认值 | 版本 |
| :------------------: | :------------: | :-------------------------------------------: | :----: | :--: |
| headerRender~(可选)~ | 标题自定义渲染 | (doc: Document, headerMark: string) => string |   -   |  -  |

### DocumentParseOptions

#### 属性

|          名称          |             说明             |  类型  | 默认值 | 版本 |
| :--------------------: | :--------------------------: | :----: | :----: | :--: |
|  nestedLevel~(可选)~  | 当前文档嵌套等级，默认 `0` | number |   -   |  -  |
| maxNestedLevel~(可选)~ |   最大嵌套等级，默认 `2`   | number |   -   |  -  |

### OptionsColums

#### 属性

|     名称     |             说明             |             类型             | 默认值 | 版本 |
| :-----------: | :--------------------------: | :--------------------------: | :----: | :--: |
|     title     |            列名称            |            string            |   -   |  -  |
|   dataIndex   | 列数据在数据项中对应的属性名 |       keyof DataSource       |   -   |  -  |
| align~(可选)~ |            列布局            | 'left'\| 'right' \| 'center' |   -   |  -  |

## 背景介绍与目标

### 现状

目前了解到的开源库一般都是针对性的全方案文档输出库，优点是使用心智成本较低，但缺点是没有覆盖绝大多数场景，当有定制化需求时，很难满足二次开发的需要，不得不进行妥协或者各种 `hack`方案，且复用性大大减弱。再者有像 `tsdoc`/`ts-morph`等优秀的 `ts`语法分析基础库，但是还是需要自行通过语法树获取元数据，其实大部分场景下所需要的元数据基本上差不多，没有一款折衷的开源库，既能屏蔽 `ts`抽象语法树语法，减小二次开发成本，又能为全方案提供文档元数据能力，能够更加灵活的进行定制与扩展。

### 目标

开发一款能够从 `ts`中提取文档的工具库，该工具库能提取 `ts`常用语法声明的文档元数据，可以通过自定义处理文档模型元数据进行自定义文档渲染，，既能屏蔽 `ts`抽象语法树语法，减小二次开发成本，又能为全方案提供文档元数据能力，能够更加灵活的进行定制与扩展，满足既能单独生成文档文件又能配合 `markdown`插件使用的需求。

### 同类型比较

|            名称            | `函数`/`类`/`接口`/`类型别名`/`枚举` | `react组件` | 按需分析文件 | 可使用元数据 | 二次开发成本 | markdown模版自定义 |  | 自定义 `jsdoc`标签使用 | 说明                                                     |
| :-------------------------: | :--------------------------------------------: | ------------- | ------------ | ------------ | ------------ | :----------------: | - | ------------------------ | -------------------------------------------------------- |
|     `ts-extract-doc`     |                       ✅                       | ✅            | ✅           | ✅           | 低           |         ✅         |  | ✅                       | 支持功能覆盖绝大多数场景，使用成本和二次开发陈本都比较比 |
|    `tsdoc`/`typedoc`    |                       ✅                       | ❌            | ✅           | ✅           | 高           |         ❌         |  | ✅                       | 提供功能十分丰富，使用成本低，二次开发成本很高           |
|       `ts-document`       |                       ✅                       | ❌            | ✅           | ❌           | 较高         |         ❌         |  | ❌                       | 也是基于 `ts-morph`进行了封装，但是功能和灵活度不够    |
|      `styleguidist`      |                       ❌                       | ✅            | ✅           | ❌           | 高           |         ✅         |  | ❌                       | 仅使用于 `react`组件文档生成                           |
| `react-docgen-typescript` |                       ❌                       | ✅            | ✅           | ❌           | 一般         |         ✅         |  | ❌                       | 仅针对 `react`组件文档提取                             |
|      `api-extractor`      |                       ❌                       | ✅            | ✅           |              | 一般         |         ✅         |  | ✅                       | 仅针对 `react`组件文档提取                             |
|        `storybook`        |                       ❌                       | ✅            | ✅           |              | 高           |         ✅         |  | ❌                       | 仅针对 `react`组件文档提取                             |

## 项目思考与设计

### 1. 分析 TS 可能存在的类型

根据日常使用及 ts 官网介绍，归纳总结常用的类型声明。

- 类
- 接口
- 函数
- 对象字面量
- 基本类型
- 枚举
- 复杂类型推导
- .......

### 2. 前期准备，借鉴吸收

通过学习优秀文档站点的布局设计，描述补充等，提取共性与特性。

学习已有类似能力开源库的实现，横向比对多个开源库的优点与不足(比较见上)。

学习已有哪些工具，工具能提供哪些帮助，还有哪些疑点与难点。

### 3. 项目立项

项目立项阶段，思考项目如何搭建及架构，如何设计能让项目结构清晰易懂，可维护可扩展，借鉴优秀的设计模式方法，也不用特意取考虑用那些或者一定要多用之类，那样就有点为了设计而设计了，从优秀的设计里找灵感，找到最适合本项目的方式方法即可。

- 技术选型 (`ts` or `js+jsdoc`) => ts
- 设计模式

  - 函数式编程
  - 面向对象编程
  - 六大设计原则(单一、开闭、里氏替换、...略)
  - 设计模式 (单例、工厂、策略、....略)
- 项目结构

  - 文档模型
  - 文档渲染
  - 定制插件
- 项目搭建

  - `tsc` 打包
  - `rollup` 打包
  - `webpack` 打包
  - 单元测试，快照
  - 输出产物，`commonjs`、`esm`、`types`

### 4. 开发与调试

  开源社区对 `ts抽象语法树` 操作的优秀开源库，基本上都是基于 `typescript` 自提供的 `ast`操作API，npm使用量比较高的是 `ts-morph`，因此本项目基于的是 [`ts-morph`](https://ts-morph.com/) 开源库，普遍来说，对 `ts抽象语法树`操作的API，文档都不全，对 `ast`的开发都是基于 [`ts-ast-viewer`](https://ts-ast-viewer.com/) 进行节点选取与参考。

因此本项目的开发需要准确的知道节点类型，当文档不全进行开发时，可以进行调试式编程，边断点调试边编程，在调试过成查看节点状态和调用栈信息。

### 5. 项目发布与版本管理

发版符合 [`semVer规范`](https://semver.org/lang/zh-CN/)，项目使用 `standard-version`进行版本管理和 `CHANGELOG`自动生成

## 项目目录

```powershell

./src/models                           # 文档模型相关目录
├── Document.ts                        # 通用文档解析入口
├── defaultOptions.ts                  # 默认配置
├── helper                             # 文档辅助目录
│   ├── BaseDocField.ts
│   ├── DocumentDecorator.ts
│   ├── DocumentEnumMember.ts
│   ├── DocumentExport.ts
│   ├── DocumentMethod.ts
│   ├── DocumentParameter.ts
│   ├── DocumentProp.ts
│   ├── DocumentReturn.ts
│   ├── DocumentTag.ts
│   ├── DocumentTypeParameter.ts
│   ├── RealSymbolOrOther.ts           # 复杂类型推导解析辅助
│   └── index.ts
├── index.ts
├── normal                             # 常用文档模型解析目录
│   ├── DocumentArray.ts
│   ├── DocumentBasic.ts
│   ├── DocumentClass.ts
│   ├── DocumentEnum.ts
│   ├── DocumentFunction.ts
│   ├── DocumentInterface.ts
│   ├── DocumentIntersection.ts
│   ├── DocumentObject.ts
│   ├── DocumentTuple.ts
│   ├── DocumentUnion.ts
│   └── index.ts
└── react                              # react 组件文档模型解析目录
    ├── DocumentClassComponent.ts
    ├── DocumentFunctionComponent.ts
    └── index.ts

./src/markdown                         # 文档模型转 markdown 相关
├── index.ts
└── templates                          # 模板定义，可以根据不同的 markdown 解析语法定制不同的模板
    ├── beauty
    │   ├── DataSource.ts              # 表格列字段映射，通过将文档模型的字段解析映射到列数据模型，供模板使用
    │   ├── defaultOptions.ts
    │   ├── index.ts
    │   ├── interface.ts
    │   ├── table.ts                   # 表格渲染规则定义
    │   └── templateRender.ts          # 根据不同的文档模型类型分发渲染规则
    ├── default
    │   ├── DataSource.ts
    │   ├── defaultOptions.ts
    │   ├── index.ts
    │   ├── interface.ts
    │   └── templateRender.ts
    └── index.ts
```

### 文档模型

文档模型的定义，主要基于 `原子化开发`的思考，尽可能的让特征模型最小化，再通过模型组合+功能继承的方式封装组合成常用文档模型以供使用，这样可以具有较高的可扩展性和可维护性。

文档模型的设计采取的 `面向对象编程`，考虑到需要定义字段接口类型声明，因此使用类定义方式将字段声明和功能实现统一，模型即字段类型，公共字段采取基类继承的方式实现扩展。

### 渲染模板

通过对文档模型字段进行列字段映射，再通过各自文档类型进行各自的规则渲染，让列字段的使用可以通过类似于 `antd`表格配置 [`columns`](https://ant-design.antgroup.com/components/table-cn#column)，符合使用习惯，减小心智成本。同时提供模板默认配置，允许自定义覆盖合并。

> ***提问：为什么不一开始就将文档模型字段定义成可以直接使用的列字段数据？，为什么还要加一层映射？***

## 插件使用

项目自提供了基于 `markdown-loader`的可用插件，可以直接引用插件配合使用，无须感知内部细节。

使用方法

```md
@import:doc @/components/Button/index.tsx
```

```typescript
/**
* 简单描述
* @descriptioin
* 这里的内容会作为补充内容渲染
*
*/
export interface Button{

}
```

函数使用

函数参数支持参数前注释和后注释， `函数jsdoc @param注释`>`前置注释`>`后置注释`，一般建议优先使用 `jsdoc注释`，便于兼容大多数文档生成规则

```tsx

/** 
* @param {string} p1 这里是p1 jsdoc 注释
 */
function (p1:string /** 这里是p1后置注释 */,
// 这里是p2的前置注释
 p2:boolean
/** 这里是p2后置注释 */
){

}
```

## 支持的标签

|       名称       |                                                            说明                                                            |               如何使用               | 是否为 `JSDOC`标准标签 |
| :---------------: | :-------------------------------------------------------------------------------------------------------------------------: | :----------------------------------: | :----------------------: |
|    `@alias`    |                                             名称别名，可以手动指定展示文档名称                                             |        `@alias <aliasName>`        |            是            |
|   `@default`   |                                                         指定默认值                                                         |     `@default <defaultValue>`     |            是            |
| `@description` |                                     额外的文档描述，可以使用使用支持的 `markdown`语法                                     | `@description <descriptionString>` |            是            |
|    `@output`    |                                            文档输出，指定的文档才会进行输出展示                                            |             `@output`             |            否            |
| `@ignoreOutput` |                               忽略文档输出，针对默认全部 `export`策略下手动反向忽略输出使用                               |          `@ignoreOutput`          |            否            |
|    `@order`    |                                            手动指定文档输出顺序，按从小到大排序                                            |       `@order <orderNumber>`       |            否            |
|  `@calculate`  | 对于需要计算合并的类型进行指定，可以尝试进行合并计算，例如相交类型.默认递归合并计算，可以手动指定计算深度，从当前层级往下算 |   `@calculate <calculateLevel>`   |            否            |
| `@noCalculate` |                                               从当前层级开始往下禁用计算合并                                               |           `@noCalculate`           |            否            |

TODO:

- [X] 类构造函数处理
- [X] 解析readonly
- [ ] 处理泛型参数
- [X] 处理继承
- [ ] 处理组件或者函数的export
- [X] 支持 `@reactComponent`标签
- [X] `@name` 使用注解自定义的名称，可以在这里指定链接跳转
- [X] 支持 `@noOutput`标签
- [ ] 支持使用缓存
- [X] 处理函数重载
- [X] 支持href跳转
- [X] 处理兼容自定义tsconfig.json文件
- [X] 处理嵌套层级-1
- [X] 支持id
- [X] 添加parent属性
- [ ] 类型标签，标题头部
