import {
  ClassDeclaration,
  JSDocTag,
  Node,
  PropertyDeclaration,
  Symbol,
  Type,
  TypeParameterDeclaration,
  VariableStatement,
  ts,
} from 'ts-morph';
import { JSDocCustomTagEnum, JSDocTagEnum } from '../../utils/jsDocTagDefinition';
import { DocumentJSDocTag, DocumentTag } from './DocumentTag';
import { DocumentParseOptions } from '../../interface';
import { DocumentTypeParameters } from './DocumentTypeParameter';
import { Document } from '../index';
import OutputManager from '../../utils/OutputManager';
import { relative } from 'path';

/** 内部传递属性，不对外公开
 * @inner
 */
export class DocumentCarryInfo {
  /** 父级 symbol */
  $parentSymbol?: Symbol;
  /** 顶级 symbol */
  $rootSymbol?: Symbol;
  /** 是否自动计算合并推导类型 */
  $typeCalculate?: boolean;
  /** 类型参数，用于泛型计算 */
  $TypeParameters?: TypeParameterDeclaration[];
  /** 索引顺序 */
  $index?: number;
  /** 父级文档 */
  $parent?: Document | null;
}

export type SymbolOrOtherType = Symbol | Node | Type;

export interface DocumentOptions extends Partial<DocumentCarryInfo>, DocumentParseOptions {}

export class BaseDocField {
  /** 当前 symbol */
  symbol: Symbol;
  /** 父级 symbol */
  parentSymbol: Symbol;
  /** 顶级 symbol */
  rootSymbol: Symbol;
  /** 父级文档 */
  parent: Document | null = null;
  /** 文档路径 */
  filePath: string | undefined;
  /** 名称 */
  name: string | undefined;
  /** 别名 */
  alias?: string;
  /** 简单描述，取自注释`tag`标记之前的文本内容 */
  description?: string;
  /** 全文本 */
  fullText?: string;
  /** 用来展示的类型文本 */
  displayType: string | undefined;
  /** 泛型参数 */
  typeParameters?: DocumentTypeParameters;
  /** 内容摆放顺序 */
  order: number = 0;
  /** 当前文档 id，方便用来定位，比如`<h3 id='someId'></h3>` */
  id?: string;
  /** 路径位置，包含路径和行号 `/path/to/somewhere:18` */
  location: string | undefined;
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
  /** 文档模型链接 */
  href?: string | null;

  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    const { symbol } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    this.symbol = symbol!;
    this.parentSymbol = options?.$parentSymbol ?? symbol!;
    this.rootSymbol = options?.$rootSymbol ?? symbol!;
    this.parent = options?.$parent ?? null;
    this.$options = options;
    this.#assign(symbolOrOther);
  }

  /** 选项配置信息 */
  protected $options = {} as DocumentOptions;

  #assign(symbolOrOther: SymbolOrOtherType) {
    const { symbol, node } = BaseDocField.splitSymbolNodeOrType(symbolOrOther);
    const ancestorNode = BaseDocField.getCompatAncestorNode<ClassDeclaration>(symbol);
    const jsDoc = ancestorNode?.getJsDocs?.()?.at(-1);
    this.name = symbol?.getName?.();
    this.fullText = jsDoc?.getFullText?.();
    this.displayType = (node as PropertyDeclaration)?.getTypeNode?.()?.getText?.() ?? node?.getType?.()?.getText?.();
    this.description = jsDoc?.getDescription();
    const jsDocTags = jsDoc?.getTags() ?? [];
    this.#parseAndAssginTags(jsDocTags);
    this.filePath = jsDoc?.getSourceFile?.().getFilePath?.() ?? node?.getSourceFile?.()?.getFilePath?.();
    this.pos = {
      start: [node?.getStartLineNumber?.()!, node?.getStartLinePos?.()!],
      end: [node?.getEndLineNumber?.()!, node?.getEnd?.()!], // TODO：确认结束位置
    };
    const relativePath = relative(process.cwd(), this.filePath ?? '');
    this.location = [relativePath, node?.getStartLineNumber?.()!].filter(Boolean).join(':');

    this.typeParameters = new DocumentTypeParameters(symbolOrOther, this.$options);

    this.#handleOther();
  }

  #handleOther() {
    const tagsMap = new Map(this.tags.map((tag) => [tag.name, tag]) ?? []);

    // 类型计算处理
    this.$options.$typeCalculate = this.$options.autoCalculate; // 设置默认值
    if (tagsMap.has(JSDocCustomTagEnum.calculate)) {
      const level = Number(tagsMap.get(JSDocCustomTagEnum.calculate)?.text) || -1;
      if (level < 0) {
        this.$options.maxNestedLevel = Number.MAX_VALUE;
      } else {
        this.$options.nestedLevel = (this.$options.nestedLevel ?? 0) + level;
      }
      this.$options.$typeCalculate = true;
    }

    // 禁用类型计算处理
    if (tagsMap.has(JSDocCustomTagEnum.noCalculate)) {
      this.$options.$typeCalculate = false;
      this.$options.maxNestedLevel = Number.MIN_VALUE;
    }

    // 摆放顺序
    this.order = Number(tagsMap.get(JSDocCustomTagEnum.order)?.text) || this.order;

    // id
    this.id = String(
      tagsMap.get(JSDocCustomTagEnum.id)?.text ?? this.$options?.idGenerator?.(this.name!) ?? this.name ?? '',
    );

    // 别名
    this.alias = tagsMap.get(JSDocTagEnum.alias)?.text ?? this.alias;

    this.href = tagsMap
      .get(JSDocCustomTagEnum.href)
      ?.text?.trim()
      ?.match(/^\{#?(.*)\}$/)?.[1];
  }

  /** 解析 JSDoc 相关标签并赋值 */
  #parseAndAssginTags(jsDocTags: JSDocTag<ts.JSDocTag>[]) {
    this.#assginJsDocTags(jsDocTags); // 这里解析供透传使用
    this.tags = jsDocTags?.map((tag) => new DocumentTag(tag));

    this.tags?.forEach((tag) => {
      switch (tag.name) {
        case JSDocTagEnum.description:
          this.extraDescription = tag.text?.replace(/(^\n)|(\n$)/g, '');
          break;
        case JSDocTagEnum.example:
          this.example = tag.text;
          break;
        case JSDocTagEnum.version:
          this.version = tag.text;
          break;
        case JSDocTagEnum.since:
          this.since = tag.text;
          break;
        case JSDocTagEnum.deprecated:
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

  /** 输出当前文档模型的文本表示 */
  public toTypeString(options?: {
    /** 移除注释 */
    removeComment: boolean;
  }) {
    const { removeComment = true } = options ?? {};
    if (removeComment) {
      const pureText = this.displayType?.replace(/(\n*\s*\/{2,}[\s\S]*?\n{1,}\s*)|(\/\*{1,}[\s\S]*?\*\/)/g, ''); // 去除注释
      const text = pureText?.replace(/(\n\s*){2,}/g, '$1'); // 移除连续多余的回车，最多保留一个回车
      return text;
    }
    return this.displayType;
  }

  /** 根据规则生成`id`，可以传入子参数 */
  public getId(rest: string[] = []): string {
    const ids = [this.id!, ...rest];
    let p = this as unknown as Document;
    const set = new WeakSet([p]);
    while (p.parent) {
      if (set.has(p.parent)) break; // 防止循环引用
      set.add(p.parent);
      ids.unshift(p.parent.id!);
      p = p.parent;
    }
    const id = ids.filter(Boolean).join('__');
    if (!OutputManager.hasDocReference(this.filePath!, id!)) {
      OutputManager.setDocReference(this as unknown as Document);
    }
    return id;
  }

  /** 输出名称，处理别名和实际名称 */
  public toNameString() {
    return this.alias ? this.alias : this.name;
  }

  /** 输出完整名称，包括泛型文本 */
  public toFullNameString() {
    const name = this.alias ? this.alias : this.name;
    return [name, this.typeParameters?.toFullTypeParametersString()].filter(Boolean).join('');
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
    const { node: parentNode } = BaseDocField.splitSymbolNodeOrType(symbol);
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
    const targetTag = this.tags?.find((t) => t.name === JSDocCustomTagEnum.calculate);
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
    const { node: parentNode } = BaseDocField.splitSymbolNodeOrType(symbol);
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
