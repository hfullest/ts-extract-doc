import { ClassDeclaration, ClassExpression, Node, Symbol as TsSymbol, VariableDeclaration, ts } from 'ts-morph';
import { BaseDocField, DocumentMethod, DocumentOptions, DocumentProp, SymbolOrOtherType } from '../helper';
import { JSDocTagEnum } from '../../utils/jsDocTagDefinition';

// @ts-ignore
export class DocumentClass extends BaseDocField {
  /** 构造函数文档 */
  constructors?: DocumentMethod;

  #membersMap = new Map<string, DocumentProp | DocumentMethod>();

  set props(record) {
    Object.entries(record ?? {}).forEach(([key, value]) => {
      this.#membersMap.set(key, value);
    })
  }
  /** 属性 */
  get props(): Record<string, DocumentProp> {
    const properties = Array.from(this.#membersMap.entries()).filter(([, doc]) => doc instanceof DocumentProp) as [string, DocumentProp][];
    return Object.fromEntries(properties);
  }
  set methods(record) {
    Object.entries(record ?? {}).forEach(([key, value]) => {
      this.#membersMap.set(key, value);
    })
  }
  /** 方法 */
  get methods(): Record<string, DocumentMethod> {
    const methods = Array.from(this.#membersMap.entries()).filter(([, doc]) => doc instanceof DocumentMethod) as [string, DocumentMethod][];
    return Object.fromEntries(methods);
  }

  #staticMembersMap = new Map<string, DocumentProp | DocumentMethod>();

  set staticProps(record) {
    Object.entries(record ?? {}).forEach(([key, value]) => {
      this.#staticMembersMap.set(key, value);
    })
  }
  /** 静态属性 */
  get staticProps(): Record<string, DocumentProp> {
    const properties = Array.from(this.#staticMembersMap.entries()).filter(([, doc]) => doc instanceof DocumentProp) as [string, DocumentProp][];
    return Object.fromEntries(properties);
  }
  set staticMethods(record) {
    Object.entries(record ?? {}).forEach(([key, value]) => {
      this.#staticMembersMap.set(key, value);
    })
  }
  /** 静态方法 */
  get staticMethods(): Record<string, DocumentMethod> {
    const methods = Array.from(this.#staticMembersMap.entries()).filter(([, doc]) => doc instanceof DocumentMethod) as [string, DocumentMethod][];
    return Object.fromEntries(methods);
  }

  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    options.$parentSymbol ??= symbol;
    options.$rootSymbol ??= options?.$parentSymbol;
    super(symbolOrOther, options);

    this.#assign(symbolOrOther);
  }

  #assign(symbolOrOther: SymbolOrOtherType): void {
    const { symbol, node } = BaseDocField.splitSymbolNodeOrType<TsSymbol, ClassDeclaration>(symbolOrOther);
    if (!DocumentClass.isTarget(symbolOrOther)) return;
    const constructorDeclaration = node?.getConstructors?.()[0];
    if (Node.isConstructorDeclaration(constructorDeclaration)) {
      this.constructors = new DocumentMethod(constructorDeclaration?.getSymbol()!, this.$options);
    }
    const properties = node?.getProperties?.() ?? [];
    const methods = node?.getMethods?.() ?? [];
    [...properties, ...methods].filter(Boolean)?.forEach((prop, index) => {
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
        const methodDoc = new DocumentMethod(currentSymbol, { ...options, $index: index, $parent: this });
        if (this.#isIgnoreField(methodDoc)) return;
        if ((methodDoc.modifiers ?? 0) & ts.ModifierFlags.Static) {
          this.staticMethods = { [propName]: methodDoc };
        } else {
          this.methods = { [propName]: methodDoc };
        }
      } else if (DocumentProp.isTarget(prop)) {
        const propDoc = new DocumentProp(currentSymbol, { ...options, $index: index, $parent: this });
        if (this.#isIgnoreField(propDoc)) return;
        if ((propDoc.modifiers ?? 0) & ts.ModifierFlags.Static) {
          this.staticProps = { [propName]: propDoc };
        } else {
          this.props = { [propName]: propDoc };
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

  static [Symbol.hasInstance] = (instance: any) => Object.getPrototypeOf(instance).constructor === this;

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
