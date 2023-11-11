import { FunctionDeclaration, Node, ReturnStatement, Symbol } from 'ts-morph';
import BaseDocField from './BaseDocField';
import { isFunctionKind } from '../utils/utils';

export default class DocumentReturn extends BaseDocField {
  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.assign(symbol);
  }

  assign(symbol: Symbol): void {
    const returns = symbol?.getDeclarations()[0] as ReturnStatement;
    const parentSymbol = returns?.getParentIf((parent) => isFunctionKind(parent.getSymbol())) as FunctionDeclaration;
    const jsDocTags = parentSymbol?.getJsDocs();
    const returnTypeNode = returns?.getType();
    const returnCommentNode = jsDocTags?.find((t) => Node.isJSDocReturnTag(t));

    this.type = {
      name: returnTypeNode?.getText() ?? returnCommentNode?.getType()?.getText(),
      value: returns?.getType()?.getLiteralValue(),
      raw: returns?.getText(),
    };
    this.description = returnCommentNode?.getCommentText()?.replace(/(^\n)|(\n$)/g, '');
  }
}
