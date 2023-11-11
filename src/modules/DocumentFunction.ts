import { PropertySignature, Symbol, ts, Node } from 'ts-morph';
import BaseDocField from './BaseDocField';
import DocumentReturn from './DocumentReturn';
import DocumentParameter from './DocumentParameter';

export default class DocumentFunction extends BaseDocField {
  /** 参数 */
  parameters: DocumentParameter[];
  /** 方法返回 */
  returns: DocumentReturn;

  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.assign(symbol);
  }

  assign(symbol: Symbol) {
    const prop = symbol?.getDeclarations()[0] as PropertySignature;
    const functionTypeNode =
      prop?.getFirstDescendantByKind(ts.SyntaxKind.FunctionType) ??
      prop?.getFirstDescendantByKind(ts.SyntaxKind.JSDocFunctionType) ??
      prop?.getFirstDescendantByKind(ts.SyntaxKind.MethodSignature);
    const parametersNode = functionTypeNode?.getParameters();
    this.parameters = parametersNode?.map(
      (parameter) => new DocumentParameter(parameter.getSymbol(), symbol, this.rootSymbol)
    );
    const returnTypeNode = functionTypeNode.getReturnTypeNode();
    this.returns = new DocumentReturn(returnTypeNode?.getSymbol(), symbol, this.rootSymbol);
  }
}
