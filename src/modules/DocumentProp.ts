import { Node, PropertySignature, Symbol, ts } from 'ts-morph';
import BaseDocField from './BaseDocField';

export default class DocumentProp extends BaseDocField {
  /** 是否可选  */
  isOptional: boolean;
  /** 默认值 */
  defaultValue: any;
  /** 属性或方法修饰符，用于类，比如`private` */
  modifiers: ts.ModifierFlags;

  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.#assign(symbol);
  }

  #assign(symbol: Symbol): void {
    const prop = symbol?.getDeclarations()[0];
    if (!DocumentProp.isTarget(prop)) return;
    const jsDoc = prop?.getJsDocs()[0];
    const jsDocTags = jsDoc?.getTags();
    const typeNode = prop?.getTypeNode();
    const defaultTagNode = jsDocTags?.find((t) => /^default(Value)?/.test(t.getTagName()));
    this.defaultValue = defaultTagNode?.getCommentText()?.split('\n\n')?.[0];
    this.isOptional = prop?.hasQuestionToken();
    this.modifiers = prop?.getCombinedModifierFlags() | jsDoc?.getCombinedModifierFlags();
    this.type = {
      name: typeNode?.getText(),
      value: prop?.getType()?.getLiteralValue(),
      raw: prop?.getText(),
    };
  }

  static isTarget(node: Node): node is PropertySignature {
    return Node.isPropertySignature(node);
  }
}
