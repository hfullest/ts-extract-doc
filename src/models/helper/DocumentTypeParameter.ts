import { ClassDeclaration, Node, TypeParameterDeclaration } from 'ts-morph';
import { BaseDocField, DocumentOptions } from './BaseDocField';
import { SymbolOrOtherType } from '../index';

export class DocumentTypeParameter {
  displayType!: string;
  current!: TypeParameterDeclaration;
  name!: string;
  /** 类型限制 */
  constraint?: Node;
  /** 默认值 */
  default?: Node;
  /** 类型值，用在获取泛型参数时 */
  value?: string;

  constructor(parameter: TypeParameterDeclaration) {
    this.current = parameter;
    this.displayType = parameter?.getText?.();
    this.name = parameter?.getName?.();
    this.constraint = parameter?.getConstraint?.();
    this.default = parameter?.getDefault?.();
    this.value = parameter?.getDefault?.()?.getText() ?? parameter?.getName?.(); // 设置默认值
  }
}

export class DocumentTypeParameters {
  /** 泛型作用域栈 */
  #scopeGenericStack: DocumentTypeParameter[][] = [];

  /** 铺平作用域链 */
  #scopeMap = new Map<string, DocumentTypeParameter>();

  /** 泛型参数 */
  parameters: DocumentTypeParameter[] = [];

  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    this.#handleDelivery(options);
    this.#assign(symbolOrOther);
  }

  #handleDelivery(options: DocumentOptions) {
    if (!(options?.$TypeParameters instanceof DocumentTypeParameters)) return;
    const typeParameters = options.$TypeParameters;
    this.#scopeGenericStack = Array.from(typeParameters.#scopeGenericStack);
    this.#scopeMap = new Map(typeParameters.#scopeMap.entries());
  }

  #assign(symbolOrOther: SymbolOrOtherType): void {
    const { node } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    const typeParameters = (node as ClassDeclaration)?.getTypeParameters?.();
    this.parameters = typeParameters?.map((it) => new DocumentTypeParameter(it));
    if (!this.#scopeGenericStack.length && this.parameters?.length) this.addStack(this.parameters);
  }

  /** @inner */
  addStack(typeParameters: DocumentTypeParameter[]) {
    this.parameters = typeParameters;
    this.#scopeGenericStack.push(this.parameters);
    this.parameters?.forEach?.((parameters) => {
      if (parameters.name) this.#scopeMap.set(parameters.name, parameters);
    });
  }

  popStack(typeParameters: DocumentTypeParameter[]) {
    const targetIndex = this.#scopeGenericStack.findIndex((it) => it === typeParameters);
    if (targetIndex === -1) return false;
    this.#scopeGenericStack.splice(targetIndex, this.#scopeGenericStack.length);
    this.#scopeMap.clear();
    this.#scopeGenericStack.forEach((stack) => {
      stack.forEach((it) => this.#scopeMap.set(it.name, it));
    });
  }

  /** 获取泛型，下级属性为泛型名称 */
  get generic() {
    return Object.fromEntries(this.#scopeMap.entries());
  }

  /** 输出完整泛型定义文本 */
  public toFullTypeParametersString() {
    const content = this.parameters?.map((it) => it.displayType)?.join(',');
    return content ? `<${content}>` : '';
  }
}
