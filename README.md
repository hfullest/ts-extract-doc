# react-ts-extract-doc

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

同类型文档生成比较

|        名称        | 兼容大多数类型文档生成 | markdown模版自定义 |  |  |
| :----------------: | :--------------------: | :----------------: | - | - |
| `ts-extract-doc` |           ✅           |         ✅         |  |  |
|  `ts-document`  |           ❌           |         ❌         |  |  |
|                    |                        |                    |  |  |
|                    |                        |                    |  |  |

TODO:

- [ ] apparent type 替换
- [ ] 类构造函数处理
- [ ] 解析readonly
- [ ] 处理泛型参数
- [ ] 处理继承
- [ ] 处理组件或者函数的export
- [ ] 支持`@jsx`标签
- [ ] `@name` 使用注解自定义的名称，可以在这里指定链接跳转
