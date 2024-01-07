import { MethodSignature, Node, PropertySignature, Symbol as TsSymbol, TypeAliasDeclaration, TypeLiteralNode, ts } from 'ts-morph';
import { DocumentProp, BaseDocField, DocumentMethod, DocumentOptions, SymbolOrOtherType } from '../helper';



export class DocumentObject extends BaseDocField {
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

  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    options.$parentSymbol ??= symbol;
    options.$rootSymbol ??= options?.$parentSymbol;
    super(symbolOrOther, options);

    this.#assign(symbolOrOther);
  }

  #assign(symbolOrOther: SymbolOrOtherType) {
    const { node: objectDeclaration, symbol } = BaseDocField.splitSymbolNodeOrType<TsSymbol, TypeAliasDeclaration>(
      symbolOrOther,
    );
    // 兼容类型别名类型
    const { node: targetNode } = BaseDocField.splitSymbolNodeOrType<TsSymbol, TypeAliasDeclaration>(
      objectDeclaration?.asKind(ts.SyntaxKind.TypeAliasDeclaration)?.getType()?.getTargetType(),
    );
    const node =
      objectDeclaration?.asKind(ts.SyntaxKind.TypeAliasDeclaration)?.getFirstChildByKind(ts.SyntaxKind.TypeReference) ??
      objectDeclaration?.asKind(ts.SyntaxKind.TypeLiteral) ?? // 兼容
      objectDeclaration?.asKind(ts.SyntaxKind.ObjectLiteralExpression) ??
      objectDeclaration?.getTypeNode?.()?.asKind(ts.SyntaxKind.TypeLiteral) ??
      targetNode?.getTypeNode?.()?.asKind(ts.SyntaxKind.TypeLiteral);

    if (!node) return; // 没有命中节点，表示其他兜底情况，直接返回

    const properties = (node as TypeLiteralNode)?.getProperties?.() ?? [];
    const methods = (node as TypeLiteralNode).getMethods?.() ?? [];
    [...properties, ...methods].filter(Boolean)?.forEach((prop, index) => {
      const propName = prop?.getName();
      const currentSymbol = prop?.getSymbol();
      const options: DocumentOptions & { index: number } = {
        ...this.getComputedOptions(),
        $parentSymbol: symbol,
        index,
      };
      if (DocumentMethod.isTarget(prop)) {
        this.methods = { [propName]: new DocumentMethod(currentSymbol!, { ...options, $parent: this }) };
      } else if (DocumentProp.isTarget(prop)) {
        this.props = { [propName]: new DocumentProp(currentSymbol!, { ...options, $parent: this }) };
      }
    });
    if (Node.isTypeAliasDeclaration(objectDeclaration)) this.displayType = this.toFullNameString(); // 对象字面量别名声明不展开类型
  }

  static [Symbol.hasInstance] = (instance: any) => Object.getPrototypeOf(instance).constructor === this;

  static isTarget(nodeOrOther: SymbolOrOtherType) {
    const { type } = BaseDocField.splitSymbolNodeOrType(nodeOrOther);
    return type?.isObject() && !type?.isArray() && !type?.isTuple() && !type?.isNullable();
  }
}

