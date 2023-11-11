import { Symbol, ts } from 'ts-morph';
import DocumentFunction from './DocumentFunction';
import DocumentDecorator from './DocumentDecorator';

export default class DocumentMethod extends DocumentFunction {
  /** 装饰器 */
  decorator?: DocumentDecorator[];
  /** 是否可选  */
  isOptional: boolean;
  /** 修饰符 */
  modifiers: ts.ModifierFlags;

  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.assign(symbol);
  }

  assign(symbol: Symbol): void {
      
  }
}
