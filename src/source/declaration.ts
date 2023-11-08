import { InterfaceDeclaration, Node, Symbol, ts } from 'ts-morph';
import { Document, DocumentProp, InterfaceOrTypeAliasOrModuleDeclaration } from '../interface';

/** 从ts类型中提取文档 */
export const collectDocFromDeclaration = (symbol: Symbol): Document | null => {
  const node = symbol?.getDeclarations()[0] as InterfaceOrTypeAliasOrModuleDeclaration;
  const nodeKind = node?.getKind();
  let outputDocument = {} as Document;
  switch (nodeKind) {
    case ts.SyntaxKind.InterfaceDeclaration:
      const document = outputDocument;
      const jsDoc = node?.getJsDocs()[0];
      document.symbol = symbol;
      document.rootSymbol = symbol;
      document.name = symbol?.getName();
      document.fullText = jsDoc?.getFullText();
      document.description = jsDoc?.getDescription();
      const jsDocTags = jsDoc?.getTags();
      document.tags = jsDocTags.map((tag) => {
        return {
          name: tag.getTagName(),
          text: tag.getCommentText(),
          self: tag,
          parent: tag.getParent(),
        };
      });
      document.extraDescription = jsDoc?.getFirstDescendantByKind(ts.SyntaxKind.JSDocTag)?.getCommentText();
      document.example = document.tags?.find((t) => t.name === 'example')?.text;
      document.filePath = jsDoc?.getSourceFile().getFilePath();

      const properties = (node as InterfaceDeclaration)?.getProperties();
      document.props = properties.reduce<typeof document.props>((result, prop) => {
        const propName = `${prop?.getName()}`;
        const jsDoc = prop?.getJsDocs()[0];
        const jsDocTags = jsDoc?.getTags();
        const typeNode = prop?.getTypeNode();
        const defaultTagNode = jsDocTags?.find((t) => /^default(Value)?/.test(t.getTagName()));
        const docProp: DocumentProp = {
          name: prop?.getName(),
          description: jsDoc?.getDescription(),
          fullText: jsDoc?.getFullText(),
          extraDescription: jsDoc?.getFirstDescendantByKind(ts.SyntaxKind.JSDocTag)?.getCommentText(),
          defaultValue: defaultTagNode?.getCommentText(),
          type: {
            name: typeNode?.getText(),
            value: prop?.getType()?.getLiteralValue(),
            raw: prop?.getText(),
          },
          required: !prop?.hasQuestionToken(),
          parent: prop?.getParent(),
          tags: jsDocTags?.map((tag) => ({
            name: tag.getTagName(),
            text: tag.getCommentText(),
            parent: tag.getParent(),
            self: tag,
          })),
          modifiers: prop.getCombinedModifierFlags() | jsDoc?.getCombinedModifierFlags(),
          // 以下为方法默认需要的属性配置
          isMethod: false,
          parameters: [],
          returns: undefined,
        };
        const functionTypeNode =
          prop?.getFirstDescendantByKind(ts.SyntaxKind.FunctionType) ??
          prop?.getFirstDescendantByKind(ts.SyntaxKind.JSDocFunctionType) ??
          prop?.getFirstDescendantByKind(ts.SyntaxKind.MethodSignature);
        if (!!functionTypeNode) {
          docProp.isMethod = true;
          const parametersNode = functionTypeNode?.getParameters();
          docProp.parameters = parametersNode?.map((parameter) => {
            const paramTypeNode = parameter?.getTypeNode();
            const paramCommentNode = jsDocTags?.find((t) => Node.isJSDocParameterTag(t));
            return {
              name: parameter?.getName(),
              type: {
                name: paramTypeNode?.getText(),
                value: parameter?.getType()?.getLiteralValue(),
                raw: parameter?.getText(),
              },
              defaultValue: parameter?.getInitializer(),
              required: !parameter?.hasQuestionToken(),
              description: paramCommentNode?.getCommentText(),
            };
          });
          const returnTypeNode = functionTypeNode.getReturnTypeNode();
          const returnCommentNode = jsDocTags?.find((t) => Node.isJSDocReturnTag(t));
          docProp.returns = {
            type: {
              name: returnTypeNode?.getText() ?? returnCommentNode?.getType()?.getText(),
              value: functionTypeNode?.getType()?.getLiteralValue(),
              raw: functionTypeNode?.getText(),
            },
            description: returnCommentNode?.getCommentText(),
          };
        }

        result[propName] = docProp;
        return result;
      }, {});
      console.log({
        document: document.props[`${document.name}#bb`],
        jsDocTags: jsDocTags.map((it) => it.print()),
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
  return outputDocument;
};
