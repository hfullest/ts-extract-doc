import { Node, Symbol, Type, TypeAliasDeclaration, ts } from 'ts-morph';
import BaseDocField from './BaseDocField';

export type TypeAliasType = 'Basic' | 'Intersection' | 'Union' | 'Array' | 'Tuple' | 'Object' | 'Enum';

export default class DocumentTypeAlias<Kind extends TypeAliasType = 'Basic'> extends BaseDocField {
  kind: 'Object';

  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.#assign(symbol);
  }

  #assign(symbol: Symbol) {
    const node = (symbol?.getValueDeclaration() ?? symbol?.getDeclarations()?.[0]) as TypeAliasDeclaration;
    const type = node?.getType();
    if (
      type?.isNumber() ||
      type?.isNumberLiteral() ||
      type?.isBoolean() ||
      type?.isBooleanLiteral() ||
      type?.isString() ||
      type?.isStringLiteral() ||
      type?.isTemplateLiteral() ||
      type?.isNullable()
    ) {
      this.#handleBasic(type);
    } else if (type?.isEnum() || type?.isEnumLiteral()) {
      this.#handleEnum(type);
    } else if (type?.isIntersection()) {
      this.#handleIntersection(type);
    } else if (type?.isUnion()) {
      this.#handleUnion(type);
    } else if (type?.isArray()) {
      this.#handleArray(type);
    } else if (type?.isTuple()) {
      this.#handleTuple(type);
    } else if (type?.isAny()) {
      this.#handleAny(type);
    } else {
      this.#handleUnknown(type);
    }
  }

  #handleBasic(type: Type) {}

  #handleEnum(type: Type) {}

  #handleIntersection(type: Type<ts.IntersectionType>) {}

  #handleUnion(type: Type<ts.UnionType>) {}

  #handleArray(type: Type) {}

  #handleTuple(type: Type<ts.TupleType>) {}

  #handleAny(type: Type) {}

  #handleUnknown(type: Type) {}

  static isTarget(node: Node): node is TypeAliasDeclaration {
    return Node.isTypeAliasDeclaration(node);
  }
}
