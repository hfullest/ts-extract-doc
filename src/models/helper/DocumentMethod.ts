import { Node, PropertyDeclaration, PropertySignature, Symbol, ts } from 'ts-morph';
import { DocumentFunction } from '../normal/DocumentFunction';
import { DocumentDecorator } from './DocumentDecorator';
import { DocumentOptions } from './BaseDocField';
import { DocumentParser } from '../index';

// @ts-ignore 忽略继承导致的静态类型不兼容 https://segmentfault.com/q/1010000023736777
export class DocumentMethod extends DocumentFunction {
  /** 装饰器 */
  decorator?: DocumentDecorator[];
  /** 默认值 */
  defaultValue: any;
  /** 是否可选  */
  isOptional?: boolean;
  /** 修饰符 */
  modifiers?: ts.ModifierFlags;
  /** 属性方法的索引顺序，可以用来指定文档输出顺序 */
  index: number = 0;

  constructor(symbol: Symbol, options: DocumentOptions & { index?: number }) {
    options.parentSymbol ??= symbol;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbol, options);
    this.#options = options;
    this.index = options?.index ?? 0;

    this.#assign(symbol);
  }

  #options: DocumentOptions;

  #assign(symbol: Symbol): void {
    const node = symbol?.getDeclarations()[0];
    if (!DocumentMethod.isTarget(node)) return;
    const jsDoc = node?.getJsDocs()[0];
    const typeNode = node?.getTypeNode();
    this.isOptional = node?.hasQuestionToken();
    this.modifiers = (node?.getCombinedModifierFlags() ?? 0) | (jsDoc?.getCombinedModifierFlags() ?? 0);
    const defaultTagNode = this.tags?.find((t) => /^default(Value)?/.test(t.name))?.node;
    this.defaultValue = node.getInitializer()?.getText() ?? defaultTagNode?.getCommentText()?.split('\n\n')?.[0];
    this.type = DocumentParser(typeNode!, { ...this.#options, nestedLevel: this.#options.nestedLevel! + 1 });
  }

  static isTarget(node: Node): node is PropertySignature | PropertyDeclaration {
    if (Node.isMethodSignature(node)) return true;
    const propertySignature =
      node?.asKind(ts.SyntaxKind.PropertySignature) ?? node?.asKind(ts.SyntaxKind.PropertyDeclaration);
    type PropertyNodeType = PropertySignature | PropertyDeclaration;
    const wrapperDeclaration =
      propertySignature?.getFirstChildByKind(ts.SyntaxKind.ParenthesizedType) ?? propertySignature;
    const functionNode =
      wrapperDeclaration?.getFirstChildByKind(ts.SyntaxKind.FunctionType) ??
      wrapperDeclaration?.getFirstChildByKind(ts.SyntaxKind.JSDocFunctionType);
    const functionInitializer = (propertySignature as PropertyNodeType)?.getInitializerIfKind?.(
      ts.SyntaxKind.FunctionExpression,
    );
    const arrowFunctionInitializer = (propertySignature as PropertyNodeType)?.getInitializerIfKind?.(
      ts.SyntaxKind.ArrowFunction,
    );
    return (
      !!functionNode || Node.isFunctionExpression(functionInitializer) || Node.isArrowFunction(arrowFunctionInitializer)
    );
  }
}
