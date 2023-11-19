import { ClassDeclaration, ClassExpression, Node, Symbol, ts } from 'ts-morph';
import { BaseDocField, DocumentMethod, DocumentOptions, DocumentProp } from '../helper';

// @ts-ignore
export class DocumentClass extends BaseDocField {
  /** 构造函数文档 */
  constructors: DocumentMethod;
  /** 属性 */
  props: Record<string, DocumentProp> = {};
  /** 方法 */
  methods: Record<string, DocumentMethod> = {};
  /** 静态属性 */
  staticProps: Record<string, DocumentProp> = {};
  /** 静态方法 */
  staticMethods: Record<string, DocumentMethod> = {};

  constructor(symbol: Symbol, options: DocumentOptions) {
    options.parentSymbol ??= symbol;
    options.rootSymbol ??= options?.parentSymbol;
    super(symbol, options);
    this.#options = options;

    this.#assign(symbol);
  }

  #options: DocumentOptions;

  #assign(symbol: Symbol): void {
    const node = symbol?.getDeclarations()[0];
    if (!DocumentClass.isTarget(node)) return;
    const properties = node?.getProperties();
    properties.forEach((prop) => {
      const propName = prop?.getName();
      const currentSymbol = prop?.getSymbol();
      if (DocumentMethod.isTarget(prop)) {
        const methodDoc = new DocumentMethod(currentSymbol, { ...this.#options, parentSymbol: symbol });
        if (this.#isIgnoreField(methodDoc)) return;
        if (methodDoc.modifiers & ts.ModifierFlags.Static) {
          this.staticMethods[propName] = methodDoc;
        } else {
          this.methods[propName] = methodDoc;
        }
      } else if (DocumentProp.isTarget(prop)) {
        const propDoc = new DocumentProp(currentSymbol, { ...this.#options, parentSymbol: symbol });
        if (this.#isIgnoreField(propDoc)) return;
        if (propDoc.modifiers & ts.ModifierFlags.Static) {
          this.staticProps[propName] = propDoc;
        } else {
          this.props[propName] = propDoc;
        }
      }
    });
  }

  /** 是否需要忽略该字段 */
  #isIgnoreField(doc: DocumentProp | DocumentMethod): boolean {
    // 跳过私有属性方法
    if (doc.modifiers & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)) return;
    const tagIgnores = [
      'inner', // @inner
      'private', // @private
      'protected', // @protected
    ];
    return tagIgnores.some((tg) => doc.tags?.find((t) => t.name === tg));
  }

  static isTarget(node: Node): node is ClassDeclaration | ClassExpression {
    if (Node.isClassDeclaration(node)) return true;
    const variableDeclaration = node?.asKind(ts.SyntaxKind.VariableDeclaration);
    const initializer = variableDeclaration?.getInitializerIfKind(ts.SyntaxKind.ClassExpression);
    return Node.isClassExpression(initializer);
  }
}
