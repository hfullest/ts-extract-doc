import { Node, PropertyAssignment, PropertyDeclaration, PropertySignature, Symbol, ts } from 'ts-morph';
import { BaseDocField, DocumentOptions } from './BaseDocField';
import { DocumentParser } from '../index';

export class DocumentProp extends BaseDocField {
  /** 是否可选  */
  isOptional?: boolean;
  /** 默认值 */
  defaultValue: any;
  /** 属性或方法修饰符，用于类，比如`private` */
  modifiers?: ts.ModifierFlags;
  /** 属性方法的索引顺序，可以用来指定文档输出顺序 */
  index: number = 0;

  constructor(symbol: Symbol, options: DocumentOptions & { index?: number }) {
    options.$parentSymbol ??= symbol;
    options.$rootSymbol ??= options?.$parentSymbol;
    super(symbol, options);

    this.index = options?.index ?? 0;
    this.#assign(symbol);
  }

  #assign(symbol: Symbol): void {
    const prop = symbol?.getDeclarations()[0];
    if (!DocumentProp.isTarget(prop)) return;
    const propNode = prop?.asKind(ts.SyntaxKind.PropertySignature) ?? prop.asKind(ts.SyntaxKind.PropertyDeclaration);
    type PropNodeType = PropertySignature | PropertyDeclaration;
    const propAssignNode = prop?.asKind(ts.SyntaxKind.PropertyAssignment);
    const jsDoc = (propNode as PropNodeType)?.getJsDocs()[0];
    const jsDocTags = jsDoc?.getTags();
    const typeOrTypeNode = (propNode as PropNodeType)?.getTypeNode() ?? propAssignNode?.getType();
    const defaultTagNode = jsDocTags?.find((t) => /^default(Value)?/.test(t.getTagName()));
    this.defaultValue = prop?.getInitializer()?.getText() ?? defaultTagNode?.getCommentText()?.split('\n\n')?.[0];
    this.isOptional = prop?.hasQuestionToken();
    this.modifiers = (prop?.getCombinedModifierFlags() ?? 0) | (jsDoc?.getCombinedModifierFlags() ?? 0);
    this.type = DocumentParser(typeOrTypeNode!, this.getComputedOptions());
  }

  static isTarget(node: Node): node is PropertySignature | PropertyDeclaration | PropertyAssignment {
    return Node.isPropertySignature(node) || Node.isPropertyDeclaration(node) || Node.isPropertyAssignment(node);
  }
}
