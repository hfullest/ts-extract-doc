# ts-extract-doc

Typescript项目文档提取。

`ts-extract-doc`库基于 [ts-morph](https://github.com/dsherret/ts-morph)，通过抽象语法树分析提取`typescript`声明的`函数`、`类`、`接口（interface）`、`类型别名(TypeAlias)`、`枚举`、`react组件(类组件和函数组件)`的`jsdoc`文档注释和类型，生成文档元数据模型，再通过解析相应的文档模型即可定制`markdown`文档生成结构。该库支持自定义`jsdoc`注释标签并自行使用。

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

- `extractTsToMarkdown(path:string, options: ConfigOptions):string` 从入口文件提取成`markdown`文档

- `parseSourceFile(filePathOrPaths: string | string[], parseOptions?: DocumentParseOptions):Document[][]` 解析入口文件生成文档模型

- `generateMarkdown(docsFiles: Document[][], options: GenMarkdownOptions = defaultOptions): string` 将文档模型转换成`markdown`文档

  

### ConfigOptions

全部配置选项，`extractTsToMarkdown(path:string, options: ConfigOptions)`

|        名称        |        说明         | 类型                                            | 默认值 |
| :----------------: | :-----------------: | ----------------------------------------------- | :----: |
|   markdown(可选)   | markdown 相关的配置 | [`GenMarkdownOptions`](#GenMarkdownOptions)     |   -    |
| tsConfigPath(可选) |  tsconfig.json路径  | `string`                                        |   -    |
|   document(可选)   |  文档生成相关配置   | [`DocumentParseOptions`](#DocumentParseOptions) |   -    |

### GenMarkdownOptions {#GenMarkdownOptions}

#### 属性

|名称|说明|类型|默认值|版本|
|:--:|:--:|:--:|:---:|:--:|
|headLevel ~(可选)~ |默认标题等级|1 \| 2 \| 3 \| 4 \| 5 \| 6 \| number|-|-|
|columns |表格列配置|[OptionsColums[]](#OptionsColums)|-|-|
|table ~(可选)~ |-|{          propHeadName: string;          methodHeadName: string;          staticPropHeadName: string;          staticMethodHeadName: string;          lineBreakDelimiter?: string;          whiteSpaceFill?: string;          escapeRules?: (text: string) => string;   }|-|-|

#### 方法

|名称|说明|类型|默认值|版本|
|:--:|:--:|:--:|:---:|:--:|
|headerRender ~(可选)~ |标题自定义渲染|(doc: Document, headerMark: string) => string|-|-|

### DocumentParseOptions {#DocumentParseOptions}

#### 属性

|名称|说明|类型|默认值|版本|
|:--:|:--:|:--:|:---:|:--:|
|nestedLevel ~(可选)~ |当前文档嵌套等级，默认`0`|number|-|-|
|maxNestedLevel ~(可选)~ |最大嵌套等级，默认`2`|number|-|-|

### OptionsColums {#OptionsColums}

#### 属性

|名称|说明|类型|默认值|版本|
|:--:|:--:|:--:|:---:|:--:|
|title |列名称|string|-|-|
|dataIndex |列数据在数据项中对应的属性名|keyof DataSource|-|-|
|align ~(可选)~ |列布局|'left' \| 'right' \| 'center'|-|-|



## 背景介绍与目标

### 现状

目前了解到的开源库一般都是针对性的全方案文档输出库，优点是使用心智成本较低，但缺点是没有覆盖绝大多数场景，当有定制化需求时，很难满足二次开发的需要，不得不进行妥协或者各种`hack`方案，且复用性大大减弱。再者有像`tsdoc`/`ts-morph`等优秀的`ts`语法分析基础库，但是还是需要自行通过语法树获取元数据，其实大部分场景下所需要的元数据基本上差不多，没有一款折衷的开源库，既能屏蔽`ts`抽象语法树语法，减小二次开发成本，又能为全方案提供文档元数据能力，能够更加灵活的进行定制与扩展。

### 目标

开发一款能够从`ts`中提取文档的工具库，该工具库能提取`ts`常用语法声明的文档元数据，可以通过自定义处理文档模型元数据进行自定义文档渲染，，既能屏蔽`ts`抽象语法树语法，减小二次开发成本，又能为全方案提供文档元数据能力，能够更加灵活的进行定制与扩展，满足既能单独生成文档文件又能配合`markdown`插件使用的需求。

### 同类型比较

|           名称            | `函数`/`类`/`接口`/`类型别名`/`枚举` | `react组件` | 按需分析文件 | 可使用元数据 | 二次开发成本 | markdown模版自定义 |      | 自定义`jsdoc`标签使用 | 说明                                                     |
| :-----------------------: | :----------------------------------: | ----------- | ------------ | ------------ | ------------ | :----------------: | ---- | --------------------- | -------------------------------------------------------- |
|     `ts-extract-doc`      |                  ✅                   | ✅           | ✅            | ✅            | 低           |         ✅          |      | ✅                     | 支持功能覆盖绝大多数场景，使用成本和二次开发陈本都比较比 |
|     `tsdoc`/`typedoc`     |                  ✅                   | ❌           | ✅            | ✅            | 高           |         ❌          |      | ✅                     | 提供功能十分丰富，使用成本低，二次开发成本很高           |
|       `ts-document`       |                  ✅                   | ❌           | ✅            | ❌            | 较高         |         ❌          |      | ❌                     | 也是基于`ts-morph`进行了封装，但是功能和灵活度不够       |
|      `styleguidist`       |                  ❌                   | ✅           | ✅            | ❌            | 高           |         ✅          |      | ❌                     | 仅使用于`react`组件文档生成                              |
| `react-docgen-typescript` |                  ❌                   | ✅           | ✅            | ❌            | 一般         |         ✅          |      | ❌                     | 仅针对`react`组件文档提取                                |
|      `api-extractor`      |                  ❌                   | ✅           | ✅            |              | 一般         |         ✅          |      | ✅                     | 仅针对`react`组件文档提取                                |
|        `storybook`        |                  ❌                   | ✅           | ✅            |              | 高           |         ✅          |      | ❌                     | 仅针对`react`组件文档提取                                |

## 项目架构

### 文档模型

```shell
```







### 渲染模板













## How

使用方法

```md
@import:ts-extract-doc @/components/Button/index.tsx?exportName=Button
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

`@description` 标签修饰的内容会原封不动的作为markdown文档输出

支持的 JSDoc 注解

- `@description`
- `@param`
- `@returns`
- `@example`  最后渲染的代码块会以 `tsx` 进行包裹，因此语法也是支持的，可以有多个 `@example`
- `@doc-output` 输出文档，指定类、接口或者函数等进行文档抽取输出，主要是为了满足不使用 `export`导出的场景

TODO:

## 函数

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

TODO:

- [ ] apparent type 替换
- [ ] 类构造函数处理
- [ ] 解析readonly
- [ ] 处理泛型参数
- [ ] 处理继承
- [ ] 处理组件或者函数的export
- [x] 支持`@reactComponent`标签
- [ ] `@name` 使用注解自定义的名称，可以在这里指定链接跳转
- [ ] 支持`@noOutput`标签
- [ ] 支持使用缓存
- [ ] 处理函数重载
- [ ] 支持href跳转
- [ ] 处理兼容自定义tsconfig.json文件
- [ ] 处理嵌套层级-1
