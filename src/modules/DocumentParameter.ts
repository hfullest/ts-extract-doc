import { FunctionDeclaration, JSDocParameterTag, Node, ParameterDeclaration, Symbol, ts } from 'ts-morph';
import BaseDocField from './BaseDocField';
import { isFunctionKind } from '../utils/utils';
import { DocumentFunction } from '.';

export default class DocumentParameter extends BaseDocField {
  /** 是否可选  */
  isOptional: boolean;
  /** 默认值 */
  defaultValue: any;

  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.#assign(symbol);
  }

  #assign(symbol: Symbol): void {
    const parameter = symbol?.getDeclarations()[0] as ParameterDeclaration;
    const parentNode = (this.parentSymbol?.getValueDeclaration() ??
      this.parentSymbol?.getDeclarations()[0]) as FunctionDeclaration;
    const ancestorNode = Node.isVariableDeclaration(parentNode)
      ? parentNode.getFirstAncestorByKind(ts.SyntaxKind.VariableStatement) // VariableDeclaration 节点获取不到文档，需要获取到其祖先级 VariableStatement 才可以获取到
      : parentNode;
    const jsDoc = ancestorNode?.getJsDocs?.()[0];
    const jsDocTags = jsDoc?.getTags();
    const paramTypeNode = parameter?.getTypeNode();
    const paramCommentNode = jsDocTags?.find(
      (t) => Node.isJSDocParameterTag(t) && t.getName() === parameter?.getName()
    ) as JSDocParameterTag;

    this.defaultValue = parameter?.getInitializer();
    this.isOptional = !!(parameter?.getInitializer() ?? parameter?.hasQuestionToken());
    // 参数前注释
    const leadingComment = parameter?.getLeadingCommentRanges()?.[0]?.getText();
    // 参数后注释
    const trailingComment = parameter?.getTrailingCommentRanges()?.[0]?.getText();
    this.description =
      (leadingComment ?? trailingComment)?.replace(/(^\/{2,}\s?)|(^\/\*{1,2}\s?)|(\s?\*\/$)/g, '') ??
      paramCommentNode?.getCommentText()?.replace(/(^\n)|(\n$)/g, '');
    this.type = {
      name: paramTypeNode?.getText() ?? paramCommentNode?.getTypeExpression()?.getText(),
      value: parameter?.getType()?.getLiteralValue(),
      raw: parameter?.getText(),
    };
  }
}
