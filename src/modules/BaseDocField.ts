import { ClassDeclaration, Node, Symbol, ts } from 'ts-morph';
import { DocumentKind, DocumentTag, DocumentType } from '../interface';
export default class BaseDocField {
  /** 当前 symbol */
  symbol: Symbol;
  /** 父级 symbol */
  parentSymbol: Symbol;
  /** 顶级 symbol */
  rootSymbol: Symbol;
  /** 文档路径 */
  filePath: string;
  /** 当前文档类型 */
  kind: DocumentKind;
  /** 类型描述 */
  type: DocumentType;
  /** 名称 */
  name: string;
  /** 简单描述，取自注释`tag`标记之前的文本内容 */
  description: string;
  /** 全文本 */
  fullText: string;
  /** 额外补充描述，一般取`@description`修饰内容 */
  extraDescription?: string;
  /** `JSDoc的标签` */
  tags: DocumentTag[];
  /** `JSDoc`注释的例子 */
  example: string;
  /** 版本信息 */
  version: string;
  /** 位置信息 */
  pos: {
    /** 开始位置 [行,列] */
    start: [number, number];
    /** 结束位置 [行,列] */
    end: [number, number];
  };

  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    this.symbol = symbol;
    this.parentSymbol = parentSymbol;
    this.rootSymbol = rootSymbol;
    this.#assign(symbol);
  }

  #assign(symbol: Symbol) {
    const node = symbol?.getDeclarations()[0] as ClassDeclaration; /** 指定任意有jsdoc声明，方便使用api */
    const ancestorNode = Node.isVariableDeclaration(node)
      ? node?.getFirstAncestorByKind?.(ts.SyntaxKind.VariableStatement) // 做兼容修正，VariableDeclaration 节点获取不到文档，需要获取到其祖先级 VariableStatement 才可以获取到
      : node;
    const jsDoc = ancestorNode?.getJsDocs?.()[0];
    this.name = symbol?.getName?.();
    this.fullText = jsDoc?.getFullText?.();
    this.description = jsDoc?.getDescription()?.replace(/(^\n)|(\n$)/g, '');
    const jsDocTags = jsDoc?.getTags();
    this.tags = jsDocTags?.map((tag) => {
      return {
        name: tag.getTagName(),
        text: tag.getCommentText(),
        self: tag,
        parent: tag.getParent(),
      };
    });
    this.extraDescription = this.tags?.find((t) => t.name === 'description')?.text?.replace(/(^\n)|(\n$)/g, '');
    this.example = this.tags?.find((t) => t.name === 'example')?.text;
    this.version = this.tags?.find((t) => t.name === 'version')?.text;
    this.filePath = jsDoc?.getSourceFile().getFilePath();
    this.pos = {
      start: [node?.getStartLineNumber(), node?.getStartLinePos()],
      end: [node?.getEndLineNumber(), node?.getEnd()], // TODO：确认结束位置
    };
  }
}
