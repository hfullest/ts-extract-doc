import { ClassDeclaration, ClassExpression, Node, Symbol, VariableDeclaration, ts } from 'ts-morph';
import { BaseDocField, DocumentMethod, DocumentOptions, DocumentProp, SymbolOrOtherType } from '../helper';
import { JSDocTagEnum } from '../../utils/constants';

// @ts-ignore
export class DocumentClass extends BaseDocField {
  /** 构造函数文档 */
  constructors?: DocumentMethod;
  /** 属性 */
  props: Record<string, DocumentProp> = {};
  /** 方法 */
  methods: Record<string, DocumentMethod> = {};
  /** 静态属性 */
  staticProps: Record<string, DocumentProp> = {};
  /** 静态方法 */
  staticMethods: Record<string, DocumentMethod> = {};

  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    options.$parentSymbol ??= symbol;
    options.$rootSymbol ??= options?.$parentSymbol;
    super(symbolOrOther, options);

    this.#assign(symbolOrOther);
  }

  #assign(symbolOrOther: SymbolOrOtherType): void {
    const { symbol, node } = BaseDocField.splitSymbolNodeOrType<Symbol, ClassDeclaration>(symbolOrOther);
    if (!DocumentClass.isTarget(symbolOrOther)) return;
    const constructorDeclaration = node?.getConstructors?.()[0];
    if (Node.isConstructorDeclaration(constructorDeclaration)) {
      this.constructors = new DocumentMethod(constructorDeclaration?.getSymbol()!, this.$options);
    }
    const properties = node?.getProperties();
    properties?.forEach((prop, index) => {
      const propName = prop?.getName();
      const currentSymbol = prop?.getSymbol();
      const options: DocumentOptions = {
        ...this.$options,
        $parentSymbol: symbol,
        nestedLevel: this.getNestedLevel(),
        maxNestedLevel: this.getMaxNestedLevel(),
      };
      if (!currentSymbol) return;
      if (DocumentMethod.isTarget(prop)) {
        const methodDoc = new DocumentMethod(currentSymbol, { ...options, index });
        if (this.#isIgnoreField(methodDoc)) return;
        if ((methodDoc.modifiers ?? 0) & ts.ModifierFlags.Static) {
          this.staticMethods[propName] = methodDoc;
        } else {
          this.methods[propName] = methodDoc;
        }
      } else if (DocumentProp.isTarget(prop)) {
        const propDoc = new DocumentProp(currentSymbol, { ...options, index });
        if (this.#isIgnoreField(propDoc)) return;
        if ((propDoc.modifiers ?? 0) & ts.ModifierFlags.Static) {
          this.staticProps[propName] = propDoc;
        } else {
          this.props[propName] = propDoc;
        }
      }
    });
  }

  /** 是否需要忽略该字段 */
  #isIgnoreField(doc: DocumentProp | DocumentMethod): boolean {
    if (!!doc.tags?.find((tg) => tg.name === JSDocTagEnum.public)) return false; // 手动指定 @public 直接跳过
    // 跳过私有属性方法
    if ((doc.modifiers ?? 0) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)) return true;
    const tagIgnores = [
      JSDocTagEnum.inner, // @inner
      JSDocTagEnum.private, // @private
      JSDocTagEnum.protected, // @protected
    ];
    return tagIgnores.some((tg) => doc.tags?.find((t) => t.name === tg));
  }

  static isTarget(nodeOrOther: SymbolOrOtherType): nodeOrOther is ClassDeclaration | ClassExpression {
    const { node } = BaseDocField.splitSymbolNodeOrType(nodeOrOther);
    if (Node.isClassDeclaration(node)) return true;
    const variableDeclaration = node?.asKind(ts.SyntaxKind.VariableDeclaration);
    const initializer = (variableDeclaration as VariableDeclaration)?.getInitializerIfKind(
      ts.SyntaxKind.ClassExpression,
    );
    return Node.isClassExpression(initializer);
  }
}
