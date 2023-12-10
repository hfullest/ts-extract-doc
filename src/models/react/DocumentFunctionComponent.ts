import { FunctionDeclaration, VariableStatement, ts } from 'ts-morph';
import { DocumentFunction } from '../normal/DocumentFunction';
import { JSDocCustomTagEnum } from '../../utils/jsDocTagDefinition';
import { BaseDocField, DocumentOptions, SymbolOrOtherType } from '../helper';
import { DocumentObject } from '../normal';
import { DocumentParser } from '../index';

// @ts-ignore
export class DocumentFunctionComponent extends DocumentFunction {
  props?: DocumentObject['props'];

  methods?: DocumentObject['methods'];

  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    options.$parentSymbol ??= symbol;
    options.$rootSymbol ??= options?.$parentSymbol;
    super(symbolOrOther, options);

    this.#assign(symbolOrOther);
  }

  #assign(symbolOrOther: SymbolOrOtherType) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    const functionTypeNode = DocumentFunction.getFunctionTypeNodeBySymbol(symbol!);
    const propsNode = (functionTypeNode as FunctionDeclaration)?.getParameters()?.[0];
    const typeNode = propsNode?.getTypeNode?.();
    const doc = DocumentParser<DocumentObject>(typeNode!, { ...this.$options, $parent: this });
    this.props = doc?.props;
    this.methods = doc?.methods;
  }

  static [Symbol.hasInstance] = (instance: any) => Object.getPrototypeOf(instance).constructor === this;

  static isTarget(nodeOrOther: SymbolOrOtherType) {
    const { node } = BaseDocField.splitSymbolNodeOrType(nodeOrOther);
    const parentNode = DocumentFunction.getCompatAncestorNode<VariableStatement>(node?.getSymbol());
    {
      // TODO: 支持 React.forwardRef 、React.memo
    }
    const functionTypeNode = DocumentFunction.getFunctionTypeNodeBySymbol(node?.getSymbol()!);
    if (!DocumentFunction.isTarget(functionTypeNode!)) return false;
    {
      // 如果手动指定了标签注释，则直接跳过检查，当作组件进行处理
      const jsDocTags = parentNode?.getJsDocs()?.at(-1)?.getTags();
      const isJsxElement = !!jsDocTags?.find((tag) => tag.getTagName() === JSDocCustomTagEnum.reactComponent);
      if (isJsxElement) return true;
    }
    {
      // 如果指定了字面量函数类型，则优先使用类型进行判断 例如：const Button:React.FC = ()=><div></div>
      const variableDeclaration = node?.asKind(ts.SyntaxKind.VariableDeclaration);
      const identifierType = variableDeclaration?.getType();
      if (/^(React\.)?(FC|(\w*?)Component)\b/.test(identifierType?.getText() ?? '')) {
        return true;
      }
    }
    {
      // 支持 React.(匹配类型)Element、JSX.Element、React.ReactNode
      const returnTypeNode = functionTypeNode?.getReturnTypeNode(); // 如果指定了函数返回类型
      const returnType = returnTypeNode?.getType();
      const returnSubstitionType = functionTypeNode?.getType()?.getCallSignatures()[0]?.getReturnType();
      const returnSubstitionSymbol = returnSubstitionType?.getSymbol();
      if (
        /^(React\.)?((\w*?)Element|ReactNode)\b/.test(returnType?.getText() ?? '') ||
        returnSubstitionSymbol?.getName() === 'Element'
      ) {
        return true;
      }
    }

    return false;
  }
}

export default DocumentFunctionComponent;
