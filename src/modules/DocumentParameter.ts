import { FunctionDeclaration, Node, ParameterDeclaration, Symbol, ts } from 'ts-morph';
import { BaseDocField } from '.';
import { isFunctionKind } from '../utils/utils';

export default class DocumentParameter extends BaseDocField {
  /** 是否可选  */
  isOptional: boolean;
  /** 默认值 */
  defaultValue: any;

  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.assign(symbol);
  }

  assign(symbol: Symbol): void {
    const parameter = symbol?.getDeclarations()[0] as ParameterDeclaration;
    const parentSymbol = parameter?.getParentIf((parent) => isFunctionKind(parent.getSymbol())) as FunctionDeclaration;
    const jsDocTags = parentSymbol?.getJsDocs();
    const paramTypeNode = parameter?.getTypeNode();
    const paramCommentNode = jsDocTags?.find((t) => Node.isJSDocParameterTag(t));

    this.defaultValue = parameter?.getInitializer();
    this.isOptional = parameter?.hasQuestionToken();
    this.description = paramCommentNode?.getCommentText()?.replace(/(^\n)|(\n$)/g, '');
    this.type = {
      name: paramTypeNode?.getText(),
      value: parameter?.getType()?.getLiteralValue(),
      raw: parameter?.getText(),
    };
  }
}
