import { ClassDeclaration, JSDocTag, Node, PropertyDeclaration, Symbol, Type, VariableStatement, ts } from 'ts-morph';
import { JSDocCustomTagEnum, JSDocTagEnum } from '../../utils/constants';
import { DocumentJSDocTag, DocumentTag } from './DocumentTag';
import { DocumentParseOptions } from '../../interface';
import { Document } from '../index';

/** 内部传递属性，不对外公开
 * @inner
 */
export class DocumentCarryInfo {
  /** 父级 symbol */
  $parentSymbol?: Symbol;
  /** 顶级 symbol */
  $rootSymbol?: Symbol;
  /** 是否计算类型 */
  $typeCalculate?: boolean;
}

export type SymbolOrOtherType = Symbol | Node | Type;

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
  type?: Document | null;
  /** 名称 */
  name: string | undefined;
  /** 简单描述，取自注释`tag`标记之前的文本内容 */
  description?: string;
  /** 全文本 */
  fullText?: string;
  /** 用来展示的类型文本 */
  displayType: string | undefined;
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
  jsDocTags: DocumentJSDocTag[] = [];

  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    this.symbol = symbol!;
    this.parentSymbol = options?.$parentSymbol ?? symbol!;
    this.rootSymbol = options?.$rootSymbol ?? symbol!;
    this.#assign(symbolOrOther);
    this.$options = options;
  }

  /** 选项配置信息 */
  protected $options = {} as DocumentOptions;

  #assign(symbolOrOther: SymbolOrOtherType) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    const node = symbol?.getValueDeclaration?.() ?? symbol?.getDeclarations?.()[0];
    const ancestorNode = BaseDocField.getCompatAncestorNode<ClassDeclaration>(symbol);
    const jsDoc = ancestorNode?.getJsDocs?.()?.at(-1);
    this.name = symbol?.getName?.();
    this.fullText = jsDoc?.getFullText?.();
    this.displayType = (node as PropertyDeclaration)
      ?.getTypeNode?.()
      ?.getText?.()
      ?.replace(/(\n*\s*\/{2,}[\s\S]*?\n{1,}\s*)|(\/\*{1,}[\s\S]*?\*\/)/g, ''); // 去除注释
    this.description = jsDoc?.getDescription()?.replace(/(^\n)|(\n$)/g, '');
    const jsDocTags = jsDoc?.getTags() ?? [];
    this.#parseAndAssginTags(jsDocTags);
    this.filePath = jsDoc?.getSourceFile?.().getFilePath?.() ?? node?.getSourceFile?.()?.getFilePath?.();
    this.pos = {
      start: [node?.getStartLineNumber?.()!, node?.getStartLinePos?.()!],
      end: [node?.getEndLineNumber?.()!, node?.getEnd?.()!], // TODO：确认结束位置
    };
    this.#handleOther();
  }

  #handleOther() {
    const calculateTag = this.tags?.find((tag) => tag.name === JSDocCustomTagEnum.calculate);
    if (calculateTag) {
      const level = Number(calculateTag.text) ?? -1;
      if (level < 0) {
        this.$options.maxNestedLevel = Number.MAX_VALUE;
      } else {
        this.$options.nestedLevel = (this.$options.nestedLevel ?? 0) + level;
      }
      this.$options.$typeCalculate = true;
    }
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
    const parentNode = symbol?.getValueDeclaration?.() ?? symbol?.getDeclarations()[0];
    try {
      const ancestorNode = Node.isVariableDeclaration(parentNode)
        ? parentNode.getFirstAncestorByKind(ts.SyntaxKind.VariableStatement)
        : parentNode;
      return ancestorNode as T | VariableStatement;
    } catch (e) {}
    return parentNode as T;
  }

  /** 计算并获取当前等级+n的配置 */
  protected getComputedOptions(n: number = 1): DocumentOptions {
    return { ...this.$options, nestedLevel: this.getNestedLevel(n), maxNestedLevel: this.getMaxNestedLevel() };
  }

  /** 计算并获取当前等级`+n`的等级数，默认`+1` */
  protected getNestedLevel(n: number = 1) {
    return Number((this.$options.nestedLevel ?? 0) + n) ?? 1;
  }
  /** 计算并获取最大嵌套等级数 */
  protected getMaxNestedLevel() {
    const targetTag = this.tags?.find((t) => t.name === JSDocCustomTagEnum.expand);
    if (!targetTag) return this.$options.maxNestedLevel;
    const maxNestedLevel = targetTag?.text;
    const value = maxNestedLevel?.toString().trim() === '0' ? 0 : 1;
    return (this.$options.maxNestedLevel ?? 0) + value;
  }

  /** 获取兼容的父节点
   *
   * 由于 VariableDeclaration 节点获取不到文档，需要获取到其祖先级 VariableStatement 才可以获取到
   * 这里对此获取父节点进行了兼容
   *
   * 可以指定父级symbol参数，也可以默认使用当前节点的父级symbol
   */
  static getCompatAncestorNode<T extends Node = Node<ts.Node>>(symbol?: Symbol) {
    const parentNode = symbol?.getValueDeclaration?.() ?? symbol?.getDeclarations?.()[0];
    try {
      const ancestorNode = Node.isVariableDeclaration(parentNode)
        ? parentNode.getFirstAncestorByKind(ts.SyntaxKind.VariableStatement)
        : parentNode;
      return ancestorNode as T | VariableStatement;
    } catch (e) {}
    return parentNode as T;
  }

  /** 分离节点，尽可能获取节点，如果`symbol`和`node`不存在，则或尝试从`type`获取`symbol`和`node` */
  static splitSymbolNodeOrType<
    S extends Symbol = Symbol,
    N extends Node = Node<ts.Node>,
    T extends Type = Type<ts.Type>,
  >(symbolOrNodeOrType: SymbolOrOtherType | undefined | null): { symbol?: S; node?: N; type?: T } {
    if (!symbolOrNodeOrType) return {};
    const originType = symbolOrNodeOrType instanceof Type ? symbolOrNodeOrType : null;
    const typeSymbol = originType?.getAliasSymbol?.() ?? originType?.getSymbol?.();
    const symbol = (symbolOrNodeOrType instanceof Symbol ? symbolOrNodeOrType : typeSymbol)!;
    const originNode = symbolOrNodeOrType instanceof Node ? symbolOrNodeOrType : null;
    const calNode = symbol?.getValueDeclaration?.() ?? symbol?.getDeclarations?.()[0];
    const node = originNode ?? calNode;
    const calType = node?.getType?.();
    const type = originType ?? calType;
    return { symbol, node, type } as { symbol: S; node: N; type: T };
  }
}
