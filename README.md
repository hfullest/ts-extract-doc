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
- `@example`
