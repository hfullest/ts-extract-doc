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
      document.description = jsDoc?.getDescription()?.replace(/(^\n)|(\n$)/g, '');
      const jsDocTags = jsDoc?.getTags();
      document.tags = jsDocTags.map((tag) => {
        return {
          name: tag.getTagName(),
          text: tag.getCommentText(),
          self: tag,
          parent: tag.getParent(),
        };
      });
      document.extraDescription = document.tags?.find((t) => t.name === 'description')?.text?.replace(/(^\n)|(\n$)/g, '');
      document.example = document.tags?.find((t) => t.name === 'example')?.text;
      document.version = document.tags?.find((t) => t.name === 'version')?.text;
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
          description: jsDoc?.getDescription()?.replace(/(^\n)|(\n$)/g, ''),
          fullText: jsDoc?.getFullText(),
          extraDescription: jsDocTags?.find((t) => t.getTagName() === 'description')?.getCommentText()?.replace(/(^\n)|(\n$)/g, ''),
          defaultValue: defaultTagNode?.getCommentText()?.split('\n\n')?.[0],
          type: {
            name: typeNode?.getText(),
            value: prop?.getType()?.getLiteralValue(),
            raw: prop?.getText(),
          },
          isOptional: prop?.hasQuestionToken(),
          parent: prop?.getParent(),
          tags: jsDocTags?.map((tag) => ({
            name: tag.getTagName(),
            text: tag.getCommentText(),
            parent: tag.getParent(),
            self: tag,
          })),
          example: jsDocTags
            ?.find((t) => t.getTagName() === 'example')
            ?.getCommentText()
            ?.split('\n\n')?.[0],
          version: jsDocTags
            ?.find((t) => t.getTagName() === 'version')
            ?.getCommentText()
            ?.split('\n\n')?.[0],
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
              isOptional: parameter?.hasQuestionToken(),
              description: paramCommentNode?.getCommentText()?.replace(/(^\n)|(\n$)/g, ''),
              fullText: parameter?.getFullText(),
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
            description: returnCommentNode?.getCommentText()?.replace(/(^\n)|(\n$)/g, ''),
          };
        }

        result[propName] = docProp;
        return result;
      }, {});
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
