import { JSDocParameterTag, JSDocReturnTag, Node, Type, ts } from 'ts-morph';

export type DocumentTypeKind = 'Basic' | 'Intersection' | 'Union' | 'Array' | 'Tuple' | 'Object' | 'Enum';

export class DocumentType {
  name: never;
  value: any;
  raw?: string;
  /** 类型文本展示 */
  text: string;
  /** 类型原始文本展示 */
  fullText: string;
  /** 类型 */
  kind: DocumentTypeKind;

  constructor(node: Node<ts.TypeNode>, jsDocNode?: JSDocParameterTag | JSDocReturnTag) {
    this.#assign(node, jsDocNode);
  }

  #assign(node: Node<ts.TypeNode>, jsDocNode: JSDocParameterTag | JSDocReturnTag) {
    this.text =
      node?.getText()?.replace(/(\n*\s*\/{2,}.*?\n{1,}\s*)|(\/\*{1,}.*?\*\/)/g, '') ?? // 去除注释
      jsDocNode?.getTypeExpression()?.getText() ??
      jsDocNode?.getType()?.getText();
    this.fullText = node?.getFullText();

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

  #handleBasic(type: Type) {
    this.kind = 'Basic';
    this.value = type?.getText();
  }

  #handleEnum(type: Type) {
    this.kind = 'Enum';
  }

  #handleIntersection(type: Type<ts.IntersectionType>) {
    this.kind = 'Intersection';
  }

  #handleUnion(type: Type<ts.UnionType>) {
    this.kind = 'Union';
  }

  #handleArray(type: Type) {
    this.kind = 'Array';
  }

  #handleTuple(type: Type<ts.TupleType>) {
    this.kind = 'Tuple';
  }

  #handleAny(type: Type) {}

  #handleUnknown(type: Type) {}
}
