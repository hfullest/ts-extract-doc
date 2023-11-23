import { FunctionDeclaration, Node, Symbol, VariableStatement, ts } from 'ts-morph';
import { DocumentFunction } from '../normal/DocumentFunction';
import { JSDocCustomTagEnum } from '../../utils/constants';
import { DocumentOptions, DocumentType } from '../helper';
import { DocumentObject } from '../normal';

// @ts-ignore
export class DocumentFunctionComponent extends DocumentFunction {
  props: DocumentObject['props'] = {};

  methods: DocumentObject['methods'] = {};

  constructor(symbol: Symbol, options: DocumentOptions) {
    options.parentSymbol ??= symbol;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbol, options);
    this.#options = options;

    this.#assign(symbol);
  }

  #options: DocumentOptions;

  #assign(symbol: Symbol) {
    const functionTypeNode = DocumentFunction.getFunctionTypeNodeBySymbol(symbol);
    const propsNode = (functionTypeNode as FunctionDeclaration)?.getParameters()?.[0];
    const typeNode = propsNode?.getTypeNode?.();
    if (!typeNode) return;
    const doc = new DocumentType(typeNode, this.#options);
    const value = doc?.value as DocumentObject;
    this.props = value?.props;
    this.methods = value?.methods;
  }

  static isTarget(node: Node) {
    const parentNode = DocumentFunction.getCompatAncestorNode<VariableStatement>(node?.getSymbol());
    const functionTypeNode = DocumentFunction.getFunctionTypeNodeBySymbol(node?.getSymbol()!);
    if (!DocumentFunction.isTarget(functionTypeNode!)) return false;
    const jsDocTags = parentNode?.getJsDocs()?.at(-1)?.getTags();
    const isJsxElement = !!jsDocTags?.find((tag) => tag.getTagName() === JSDocCustomTagEnum.reactComponent);
    if (isJsxElement) return true; // 如果手动指定了标签注释，则直接跳过检查，当作组件进行处理
    const variableDeclaration = node?.asKind(ts.SyntaxKind.VariableDeclaration);
    const identifierType = variableDeclaration?.getType();
    if (/^(React\.)?(FC|(\w*?)Component)\b/.test(identifierType?.getText() ?? '')) {
      return true; // 如果指定了字面量函数类型，则优先使用类型进行判断 例如：const Button:React.FC = ()=><div></div>
    }
    const returnTypeNode = functionTypeNode?.getReturnTypeNode(); // 如果指定了函数返回类型
    const returnType = returnTypeNode?.getType();
    const returnSubstitionType = functionTypeNode?.getType()?.getCallSignatures()[0]?.getReturnType();
    const returnSubstitionSymbol = returnSubstitionType?.getSymbol();
    if (
      /^(React\.)?((\w*?)Element|ReactNode)\b/.test(returnType?.getText() ?? '') ||
      returnSubstitionSymbol?.getName() === 'Element'
    ) {
      return true; // 支持 React.(匹配类型)Element、JSX.Element、React.ReactNode
    }
    return false;
  }
}

export default DocumentFunctionComponent;
