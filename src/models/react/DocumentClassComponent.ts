import {
  ClassDeclaration,
  InterfaceDeclaration,
  Node,
  PropertyDeclaration,
  Symbol,
  Type,
  TypeNode,
  ts,
} from 'ts-morph';
import { BaseDocField, DocumentOptions, SymbolOrOtherType } from '../helper';
import { DocumentClass, DocumentObject } from '../normal';
import { JSDocCustomTagEnum } from '../../utils/jsDocTagDefinition';
import { DocumentParser } from '../index';

export class DocumentClassComponent extends BaseDocField {
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
    const declarations = symbol?.getDeclarations(); // 可能有interface重载情况
    if (!declarations?.some((it) => DocumentClassComponent.isTarget(it))) return; // 至少有一个为类组件声明则继续，否则跳出
    declarations?.forEach((declaration) => {
      const node = Node.isVariableDeclaration(declaration)
        ? declaration.getFirstAncestorByKind(ts.SyntaxKind.VariableStatement)
        : declaration;
      this.#handleProps(node!);
    });
  }

  #handleProps(node: Node) {
    const classDeclaration =
      node?.asKind(ts.SyntaxKind.ClassDeclaration) ?? node?.asKind(ts.SyntaxKind.ClassExpression);
    let typeOrTypeNode: TypeNode | Type | undefined;

    if (!typeOrTypeNode) {
      // 构造函数提取第一个属性类型
      const constructorDeclaration = (classDeclaration as ClassDeclaration)?.getConstructors?.()[0];
      const propsNode = constructorDeclaration?.getParameters?.()[0];
      typeOrTypeNode = propsNode?.getTypeNode?.();
    }
    if (!typeOrTypeNode) {
      // React.Component<P,S> 泛型第一个参数提取
      const extendsNode = (classDeclaration as ClassDeclaration)?.getExtends();
      typeOrTypeNode = extendsNode?.getTypeArguments?.()[0];
    }
    if (!typeOrTypeNode) {
      // 提取类组件 props 属性类型
      const propsNode = (classDeclaration as ClassDeclaration)?.getProperty('props');
      typeOrTypeNode = propsNode?.getTypeNode();
      if (!typeOrTypeNode) typeOrTypeNode = propsNode?.getInitializer()?.getType();
    }
    if (!typeOrTypeNode) {
      // 提取类组件 static defaultProps 值类型
      const defaultPropsNode = (classDeclaration as ClassDeclaration)
        ?.getStaticProperty('defaultProps')
        ?.asKind(ts.SyntaxKind.PropertyDeclaration);
      typeOrTypeNode = (defaultPropsNode as PropertyDeclaration)?.getInitializer()?.getType();
    }
    if (!typeOrTypeNode) {
      // 提取 interface 重载 props 属性类型
      const interfaceNode = node?.asKind(ts.SyntaxKind.InterfaceDeclaration);
      typeOrTypeNode = (interfaceNode as InterfaceDeclaration)?.getProperty('props')?.getTypeNode(); // 类组件接口重载声明必须为 props 例如： interface Component { props:{a:string} }
    }
    if (!typeOrTypeNode) return;
    const doc = DocumentParser<DocumentObject>(typeOrTypeNode, this.$options);
    this.props = doc?.props;
    this.methods = doc?.methods;
  }

  static isTarget(symbolOrOther: SymbolOrOtherType) {
    const { node: originNode } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    const node = BaseDocField.getCompatAncestorNode(originNode?.getSymbol());
    if (!DocumentClass.isTarget(node!)) return false;
    const jsDocTags = node?.getJsDocs()?.at(-1)?.getTags();
    const isJsxElement = !!jsDocTags?.find((tag) => tag.getTagName() === JSDocCustomTagEnum.reactComponent);
    if (isJsxElement) return true; // 如果手动指定了标签注释，则直接跳过检查，当作组件进行处理
    const extendsNode = node?.getExtends();
    const expressionText = extendsNode?.getExpression?.()?.getText();
    if (!/^(React\.)?(Pure)?Component$/.test(expressionText ?? '')) return false; // 类必须继承自 React.Component、React.PureComponent
    {
      // 校验render函数
      const renderMethods = node?.getMethod?.('render');
      const returnTypeNode = renderMethods?.getReturnTypeNode(); // 如果指定了函数返回类型
      const returnType = returnTypeNode?.getType();
      const returnSubstitionType = renderMethods?.getType()?.getCallSignatures()[0]?.getReturnType();
      const returnSubstitionSymbol = returnSubstitionType?.getSymbol();
      if (
        /^(React\.)?((\w*?)Element|ReactNode)\b/.test(returnType?.getText() ?? '') ||
        returnSubstitionSymbol?.getName() === 'Element'
      ) {
        return true; // 支持 React.(匹配类型)Element、JSX.Element、React.ReactNode
      }
    }
  }
}
