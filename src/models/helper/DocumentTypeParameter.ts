import { ClassDeclaration, TypeParameterDeclaration } from 'ts-morph';
import { BaseDocField, DocumentOptions } from './BaseDocField';
import { SymbolOrOtherType } from '../index';

export interface DocumentTypeParameter {
  displayType: string;
  current: TypeParameterDeclaration;
}

export class DocumentTypeParameters {
  /** 泛型参数 */
  parameters: DocumentTypeParameter[] = [];

  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    this.#assign(symbolOrOther);
  }

  #assign(symbolOrOther: SymbolOrOtherType): void {
    const { node } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    const typeParameters = (node as ClassDeclaration)?.getTypeParameters?.();
    this.parameters = typeParameters?.map<DocumentTypeParameter>((it) => ({
      current: it,
      displayType: it?.getText?.(),
    }));
  }

  /** 输出完整泛型定义文本 */
  public toFullTypeParametersString() {
    const content = this.parameters?.map((it) => it.displayType)?.join(',');
    return content ? `<${content}>` : '';
  }
}
