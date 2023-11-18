import { Node, Type, ts } from 'ts-morph';

export type TypeAliasType = 'Basic' | 'Intersection' | 'Union' | 'Array' | 'Tuple' | 'Object' | 'Enum';

export class DocumentType {
  name: never;
  value?: any;
  raw?: string;

  constructor(node: Node<ts.TypeNode>) {
    // DocumentProp
    // name: typeNode?.getText()?.replace(/(\n*\s*\/{2,}.*?\n{1,}\s*)|(\/\*{1,}.*?\*\/)/g, ''),
    // value: prop?.getType()?.getLiteralValue(),
    // raw: prop?.getText(),

    // DocumentReturn
    // {
    //     name: returnTypeNode?.getText() ?? returnCommentNode?.getType()?.getText(),
    //     value: returns?.getType()?.getLiteralValue(),
    //     raw: returns?.getText(),
    //   }

    // DocumentMethod
    //  {
    //     // 去除注释
    //     name: typeNode?.getText()?.replace(/(\n*\s*\/{2,}.*?\n{1,}\s*)|(\/\*{1,}.*?\*\/)/g, ''),
    //     value: node?.getType()?.getLiteralValue(),
    //     raw: node?.getFullText(),
    //   };

    // DocumentParameter

    // {
    //     name: paramTypeNode?.getText() ?? paramCommentNode?.getTypeExpression()?.getText(),
    //     value: parameter?.getType()?.getLiteralValue(),
    //     raw: parameter?.getText(),
    //   };

    this.#assign(node);
  }

  #assign(node: Node<ts.TypeNode>) {
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
}
