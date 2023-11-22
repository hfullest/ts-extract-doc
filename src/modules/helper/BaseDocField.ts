import { ClassDeclaration, JSDocTag, Node, Symbol, VariableStatement, ts } from 'ts-morph';
import { JSDocCustomTagEnum, JSDocTagEnum } from '../../utils/constants';
import { DocumentType } from './DocumentType';
import { DocumentJSDocTag, DocumentTag } from './DocumentTag';
import { DocumentParseOptions } from '../../interface';

export interface DocumentCarryInfo {
  /** 父级 symbol */
  parentSymbol?: Symbol;
  /** 顶级 symbol */
  rootSymbol?: Symbol;
}

export interface DocumentOptions extends DocumentCarryInfo, DocumentParseOptions {}

export class BaseDocField {
  /** 当前 symbol */
  symbol: Symbol;
  /** 父级 symbol */
  parentSymbol: Symbol;
  /** 顶级 symbol */
  rootSymbol: Symbol;
  /** 文档路径 */
  filePath: string | undefined;
  /** 类型描述 */
  type?: DocumentType;
  /** 名称 */
  name: string | undefined;
  /** 简单描述，取自注释`tag`标记之前的文本内容 */
  description?: string;
  /** 全文本 */
  fullText?: string;
  /** 全部的注释标签，包括`JSDoc标签`和自定义标签
   *
   * 如需仅查看`JSDoc标签`，可以参考`jsDocTags`属性
   */
  tags: DocumentTag[] = [];
  /** 额外补充描述，取`@description`修饰内容 */
  extraDescription?: string;
  /** `JSDoc`注释的例子，取`@example`修饰内容 */
  example?: string;
  /** 版本信息， 取`@version`修饰内容 */
  version?: string;
  /** 标记表示在特定版本中添加了类、方法或其他符号， 取`@since`修饰内容 */
  since?: string;
  /** 是否废弃 `取@deprecated`修饰内容，可以为字符串表示废弃描述 */
  deprecated: boolean | string = false;
  /** 位置信息 */
  pos = {} as {
    /** 开始位置 [行,列] */
    start: [number, number];
    /** 结束位置 [行,列] */
    end: [number, number];
  };
  /** 全部 `JSDoc标签` */
  jsDocTags: {
    /** 标签名称 */
    name: string;
    /** 标签内容 */
    text: string;
    /** 全文本 */
    fullText: string;
  }[] = [];

  constructor(symbol: Symbol, options: DocumentOptions) {
    this.symbol = symbol;
    this.parentSymbol = options?.parentSymbol ?? symbol;
    this.rootSymbol = options?.rootSymbol ?? symbol;
    this.#assign(symbol);
    this.#options = options;
  }

  #options = {} as DocumentOptions;

  #assign(symbol: Symbol) {
    const node = symbol?.getValueDeclaration?.() ?? symbol?.getDeclarations?.()[0];
    const ancestorNode = BaseDocField.getCompatAncestorNode<ClassDeclaration>(symbol);
    const jsDoc = ancestorNode?.getJsDocs?.()?.at(-1);
    this.name = symbol?.getName?.();
    this.fullText = jsDoc?.getFullText?.() ?? '';
    this.description = jsDoc?.getDescription()?.replace(/(^\n)|(\n$)/g, '') ?? '';
    const jsDocTags = jsDoc?.getTags() ?? [];
    this.#parseAndAssginTags(jsDocTags);
    this.filePath = jsDoc?.getSourceFile().getFilePath() ?? node?.getSourceFile()?.getFilePath();
    this.pos = {
      start: [node?.getStartLineNumber(), node?.getStartLinePos()],
      end: [node?.getEndLineNumber(), node?.getEnd()], // TODO：确认结束位置
    };
    // this.type = new DocumentType((node as TypeAliasDeclaration)?.getTypeNode?.() ?? node?.getType()); // 由于递归解析造成不必要性能浪费，需要的位置在自行解析类型
  }

  /** 解析 JSDoc 相关标签并赋值 */
  #parseAndAssginTags(jsDocTags: JSDocTag<ts.JSDocTag>[]) {
    this.#assginJsDocTags(jsDocTags); // 这里解析供透传使用
    this.tags = jsDocTags?.map((tag) => new DocumentTag(tag));

    this.tags?.forEach((tag) => {
      switch (tag.name as keyof typeof JSDocTagEnum | keyof typeof JSDocCustomTagEnum) {
        case 'description':
          this.extraDescription = tag.text?.replace(/(^\n)|(\n$)/g, '');
          break;
        case 'example':
          this.example = tag.text;
          break;
        case 'version':
          this.version = tag.text;
          break;
        case 'since':
          this.since = tag.text;
          break;
        case 'deprecated':
          this.deprecated = !!tag.text ? tag.text : true; // 如果有描述使用描述，无描述则赋值true
          break;
        default:
      }
    });
  }

  /** 无处理的解析 JSDoc 标签 */
  #assginJsDocTags(jsDocTags: JSDocTag<ts.JSDocTag>[]) {
    jsDocTags?.forEach((tag) => {
      this.jsDocTags.push(new DocumentJSDocTag(tag));
    });
  }

  /** 获取兼容的父节点
   *
   * 由于 VariableDeclaration 节点获取不到文档，需要获取到其祖先级 VariableStatement 才可以获取到
   * 这里对此获取父节点进行了兼容
   *
   * 可以指定父级symbol参数，也可以默认使用当前节点的父级symbol
   */
  protected getCompatAncestorNode<T extends Node = Node<ts.Node>>(symbol?: Symbol) {
    symbol ??= this.parentSymbol;
    const parentNode = symbol?.getValueDeclaration() ?? symbol?.getDeclarations()[0];
    const ancestorNode = Node.isVariableDeclaration(parentNode)
      ? parentNode.getFirstAncestorByKind(ts.SyntaxKind.VariableStatement)
      : parentNode;
    return ancestorNode as T | VariableStatement;
  }

  /** 计算并获取当前等级+n的配置 */
  protected getComputedOptions(n: number = 1): DocumentOptions {
    return { ...this.#options, nestedLevel: this.getNestedLevel(n), maxNestedLevel: this.getMaxNestedLevel() };
  }

  /** 计算并获取当前等级`+n`的等级数，默认`+1` */
  protected getNestedLevel(n: number = 1) {
    return Number((this.#options.nestedLevel ?? 0) + n) ?? 1;
  }
  /** 计算并获取最大嵌套等级数 */
  protected getMaxNestedLevel() {
    const targetTag = this.tags?.find((t) => t.name === JSDocCustomTagEnum.expand);
    if (!targetTag) return this.#options.maxNestedLevel;
    const maxNestedLevel = targetTag?.text;
    const value = maxNestedLevel?.toString().trim() === '0' ? 0 : 1;
    return (this.#options.maxNestedLevel ?? 0) + value;
  }

  static getCompatAncestorNode<T extends Node = Node<ts.Node>>(symbol?: Symbol) {
    const parentNode = symbol?.getValueDeclaration() ?? symbol?.getDeclarations()[0];
    const ancestorNode = Node.isVariableDeclaration(parentNode)
      ? parentNode.getFirstAncestorByKind(ts.SyntaxKind.VariableStatement)
      : parentNode;
    return ancestorNode as T | VariableStatement;
  }
}
