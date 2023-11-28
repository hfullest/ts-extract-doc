import { JSDocParameterTag, JSDocReturnTag, Node, Type, ts } from 'ts-morph';
import { DocumentInterface, DocumentObject } from '../normal';
import { DocumentProp } from './DocumentProp';
import { DocumentMethod } from './DocumentMethod';
import { BaseDocField, DocumentOptions } from './BaseDocField';
import { Document } from '../Document';
import DocumentParser from '../Document';

export interface TypeValues {
  Basic: string;
  /** 相交类型 */
  Intersection: any[];
  /** 联合类型 */
  Union: any[];
  Array: [string];
  Tuple: string;
  Object: string;
  Enum: string;
}
export namespace DocumentTypeInfo {
  /** 基本类型，比如`string`,`number`,`boolean`,`null`,`undefined`等 */

  export interface Basic {
    kind: 'Basic';
    value: string;
  }

  export interface Object {
    kind: 'Object';
    parsedValue: DocumentObject;
    /** 最终处理的结果 */
    value: DocumentObject;
  }

  export interface Intersection {
    kind: 'Intersection';
    /** 分别解析，未合并的值 */
    parsedValue: Document[];
    /** 最终处理的结果 */
    value: { props: DocumentProp; methods: DocumentMethod };
  }

  export interface Union {
    kind: 'Union';
    /** 分别解析 */
    parsedValue: Document[];
    /** 最终处理的结果 */
    value: Document[];
  }

  export interface Tuple {
    kind: 'Tuple';
    /** 分别解析 */
    parsedValue?: Document[];
    /** 最终处理的结果 */
    value?: Document[];
  }

  export interface Array {
    kind: 'Array';
    /** 分别解析 */
    parsedValue?: Document;
    /** 最终处理的数组元素类型结果 */
    value?: Document;
  }

  export interface Enum {
    kind: 'Enum';
    value: Document; // 暂时不处理解析
  }
}

export type DocumentTypeInfoType =
  | DocumentTypeInfo.Basic
  | DocumentTypeInfo.Object
  | DocumentTypeInfo.Intersection
  | DocumentTypeInfo.Union
  | DocumentTypeInfo.Tuple
  | DocumentTypeInfo.Array
  | DocumentTypeInfo.Enum;

export type DocumentTypeKind = DocumentTypeInfoType['kind'];

export interface DocumentType extends BaseDocField { }

export class DocumentType {
  /** 类型文本展示 */
  text: string = '';
  /** 类型原始文本展示 */
  fullText: string = '';
  /** 类型 */
  kind: DocumentTypeKind | undefined;
  /** 类型值集合，同时只会有一个有值，根据不同类型kind取相应的值即可 */
  value = {} as DocumentTypeInfoType['value'];
  /** 类型相关详细信息 */
  info = {} as DocumentTypeInfoType;
  /** 当前类型节点，方便自行获取并处理类型 */
  typeNode: Node<ts.TypeNode> | null = null;
  /** 当前类型`type`对象 */
  current?: Type;

  constructor(
    node: Type | Node<ts.TypeNode>,
    options: DocumentOptions,
    jsDocNode?: JSDocParameterTag | JSDocReturnTag,
  ) {
    this.#options = options;
    this.#assign(node, jsDocNode);
  }

  #options = {} as DocumentOptions;

  #assign(node: Type | Node<ts.TypeNode>, jsDocNode?: JSDocParameterTag | JSDocReturnTag) {
    this.text =
      node?.getText?.()?.replace(/(\n*\s*\/{2,}[\s\S]*?\n{1,}\s*)|(\/\*{1,}[\s\S]*?\*\/)/g, '') ?? // 去除注释
      jsDocNode?.getTypeExpression?.()?.getText?.() ??
      jsDocNode?.getType?.()?.getText?.();
    if (Node.isNode(node)) {
      this.fullText = node?.getFullText();
      this.typeNode = node;
    }
    const type = Node.isNode(node) ? node?.getType() : node;
    this.current = type;
    if (this.#isBasicType(type)) {
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
    } else if (type?.isObject()) {
      this.#handleObject(type);
    } else if (type?.isAny()) {
      this.#handleAny(type);
    } else {
      this.#handleUnknown(type);
    }

    this.value = this.info.value;
  }

  #isBasicType(type: Type) {
    return (
      type?.isNumber() ||
      type?.isNumberLiteral() ||
      type?.isBoolean() ||
      type?.isBooleanLiteral() ||
      type?.isString() ||
      type?.isStringLiteral() ||
      type?.isTemplateLiteral() ||
      type?.isNullable()
    );
  }

  #handleBasic(type: Type) {
    this.kind = 'Basic';
    this.info.kind = 'Basic';
    this.info.value = type?.getText();
  }

  #handleEnum(type: Type) {
    this.kind = 'Enum';
  }

  #handleIntersection(type: Type<ts.IntersectionType>) {
    this.kind = 'Intersection';
    const intersectionTypes = type?.getIntersectionTypes();
    const docs = intersectionTypes?.map((it) => this.#handleParseType(it)).filter(Boolean) as (
      | DocumentObject
      | DocumentInterface
    )[];
    const combineDoc = docs.reduce<DocumentTypeInfo.Intersection['value']>(
      (pre, cur) => {
        pre.props = { ...pre.props, ...cur?.props } as DocumentProp;
        pre.methods = { ...pre.methods, ...cur?.methods } as DocumentMethod;
        return pre;
      },
      {} as DocumentTypeInfo.Intersection['value'],
    );
    this.info = {
      kind: 'Intersection',
      parsedValue: docs,
      value: combineDoc,
    };
  }

  #handleUnion(type: Type<ts.UnionType>) {
    this.kind = 'Union';
    const unionTypes = type?.getUnionTypes();
    const docs = unionTypes?.map((it) => this.#handleParseType(it)).filter(Boolean) as (
      | DocumentObject
      | DocumentInterface
    )[];
    this.info = {
      kind: 'Union',
      parsedValue: docs,
      value: docs,
    };
  }

  #handleObject(type: Type<ts.ObjectType>) {
    this.kind = 'Object';
    const doc = this.#handleParseType(type);
    this.info = {
      kind: 'Object',
      parsedValue: doc as DocumentObject,
      value: doc as DocumentObject,
    };
  }

  #handleArray(type: Type) {
    this.kind = 'Array';
    const arrayType = type?.getArrayElementType();
    const doc = arrayType ? this.#handleParseType(arrayType) : undefined;
    this.info = {
      kind: 'Array',
      parsedValue: doc,
      value: doc,
    };
  }

  #handleTuple(type: Type<ts.TupleType>) {
    this.kind = 'Tuple';
    const tupleTypes = type?.getTupleElements();
    const docs = (tupleTypes?.map((tuple) => this.#handleParseType(tuple)) ?? []) as Document[];
    this.info = {
      kind: 'Tuple',
      parsedValue: docs,
      value: docs,
    };
  }

  #handleAny(type: Type) { }

  #handleUnknown(type: Type) { }

  #handleParseType(type: Type) {
    if (!((this.#options.nestedLevel ?? 0) < (this.#options.maxNestedLevel ?? 0))) return; // 超过嵌套深度跳出递归
    const symbol = type?.getAliasSymbol?.() ?? type?.getSymbol?.();
    return DocumentParser(symbol ?? type, {
      ...this.#options,
      nestedLevel: (this.#options.nestedLevel ?? 0) + 1,
      maxNestedLevel: this.#options.maxNestedLevel,
    });
  }
}
