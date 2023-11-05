import { InterfaceDeclaration, Symbol, ts } from 'ts-morph';
import { Document, DocumentProp, InterfaceOrTypeAliasOrModuleDeclaration } from '../interface';

/** 从ts类型中提取文档 */
export const collectDocFromDeclaration = (symbol: Symbol): Document | null => {
  const node = symbol?.getDeclarations()[0] as InterfaceOrTypeAliasOrModuleDeclaration;
  const nodeKind = node?.getKind();
  switch (nodeKind) {
    case ts.SyntaxKind.InterfaceDeclaration:
      const document = {} as Document;
      const jsDoc = node?.getJsDocs()[0];
      document.symbol = symbol;
      document.rootSymbol = symbol;
      document.displayName = symbol?.getName();
      document.fullText = jsDoc?.getFullText();
      document.description = jsDoc?.getDescription();
      document.filePath = jsDoc?.getSourceFile().getFilePath();
      const jsDocTags = jsDoc?.getTags();
      const comments = jsDoc.getComment();
      document.tags = jsDocTags.map((tag) => {
        return {
          name: tag.getTagName(),
          comment: tag.getCommentText(),
          self: tag,
          parent: tag.getParent(),
        };
      });
      const properties = (node as InterfaceDeclaration)?.getProperties();
      document.props = properties.reduce<typeof document.props>((result, prop) => {
        const propName = `${document.displayName}#${prop?.getName()}`;
        const jsDoc = prop?.getJsDocs()[0];
        const jsDocTags = jsDoc?.getTags();
        const type = prop?.getType();
        const defaultTagNode = jsDocTags?.find((t) => /^default(Value)?/.test(t.getTagName()));
        const docProp: DocumentProp = {
          name: prop?.getName(),
          description: jsDoc?.getDescription(),
          defaultValue: defaultTagNode?.getCommentText(),
          type: {
            name: type.getText(),
            value: type.getLiteralValue(),
            raw: prop?.getText(),
          },
          required: !prop?.hasQuestionToken(),
          parent: prop?.getParent(),
          tags: jsDocTags?.map((tag) => ({
            name: tag.getTagName(),
            comment: tag.getCommentText(),
            parent: tag.getParent(),
            self: tag,
          })),
          modifiers: prop.getCombinedModifierFlags() | jsDoc?.getCombinedModifierFlags(),
          // 以下为方法默认需要的属性配置
          isMethod: false,
          parameters: [],
          returns: undefined,
        };
        const isFunctionType = !!(
          prop?.getFirstDescendantByKind(ts.SyntaxKind.FunctionType) ??
          prop?.getFirstDescendantByKind(ts.SyntaxKind.JSDocFunctionType) ??
          prop?.getFirstDescendantByKind(ts.SyntaxKind.MethodSignature)
        );
        if (isFunctionType) {
          console.log('函数', prop.getName()); // TODO: 处理函数需要的属性
        }

        result[propName] = docProp;
        return result;
      }, {});
      console.log({
        document: document.props[`${document.displayName}#bb`],
        jsDocTags: jsDocTags.map((it) => it.print()),
        comments,
        fulltext: jsDoc.getFullText(),
      });
      break;
    case ts.SyntaxKind.TypeAliasDeclaration:
      break;
    case ts.SyntaxKind.ModuleDeclaration:
      break;
    default:
  }

  console.log('collectDocFromDeclaration:', symbol.getName());
  return null;
};
