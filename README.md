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

TODO:

- `@name` 使用注解自定义的名称，可以在这里指定链接跳转

## 函数

函数参数支持参数前注释和后注释， `函数jsdoc @param注释`>`前置注释`>`后置注释`，一般建议优先使用`jsdoc注释`，便于兼容大多数文档生成规则

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
