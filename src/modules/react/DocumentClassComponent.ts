import { Node, Symbol } from 'ts-morph';
import { BaseDocField, DocumentOptions } from '../helper';
import { DocumentClass } from '../normal';
import { JSDocCustomTagEnum } from '../../utils/constants';

export class DocumentClassComponent extends BaseDocField {
  constructor(symbol: Symbol, options: DocumentOptions) {
    options.parentSymbol ??= symbol;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbol, options);
    this.#options = options;

    this.#assign(symbol);
  }

  #options: DocumentOptions;

  #assign(symbol: Symbol) {}

  static isTarget(node: Node) {
    node = BaseDocField.getCompatAncestorNode(node?.getSymbol());
    if (!DocumentClass.isTarget(node)) return false;
    debugger;
    const jsDocTags = node?.getJsDocs()?.at(-1)?.getTags();
    const isJsxElement = !!jsDocTags?.find((tag) => tag.getTagName() === JSDocCustomTagEnum.reactComponent);
    if (isJsxElement) return true; // 如果手动指定了标签注释，则直接跳过检查，当作组件进行处理
    const extendsNode = node?.getExtends();
    const expressionText = extendsNode?.getExpression?.()?.getText();
    if (!/^(React\.)?(Pure)?Component$/.test(expressionText)) return false; // 类必须继承自 React.Component、React.PureComponent
    {
      // 校验render函数
      const renderMethods = node?.getMethod?.('render');
      const returnTypeNode = renderMethods?.getReturnTypeNode(); // 如果指定了函数返回类型
      const returnType = returnTypeNode?.getType();
      const returnSubstitionType = renderMethods?.getType()?.getCallSignatures()[0]?.compilerSignature?.getReturnType();
      const returnSubstitionSymbol = returnSubstitionType?.getSymbol();
      if (
        /^(React\.)?((\w*?)Element|ReactNode)\b/.test(returnType?.getText()) ||
        returnSubstitionSymbol?.getName() === 'Element'
      ) {
        return true; // 支持 React.(匹配类型)Element、JSX.Element、React.ReactNode
      }
    }
  }
}
