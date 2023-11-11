import { InterfaceDeclaration, Symbol } from 'ts-morph';
import BaseDocField from './BaseDocField';
import DocumentFunction from './DocumentFunction';
import DocumentProp from './DocumentProp';
import { isFunctionKind } from '../utils/utils';
import DocumentMethod from './DocumentMethod';

export default class DocumentInterface extends BaseDocField {
  /** 属性 */
  props: Record<string, DocumentProp>;
  /** 方法 */
  methods: Record<string, DocumentFunction>;

  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.assign(symbol);
  }

  assign(symbol: Symbol) {
    const node = symbol?.getDeclarations()[0] as InterfaceDeclaration;
    const properties = (node as InterfaceDeclaration)?.getProperties();
    properties.forEach((prop) => {
      const propName = prop?.getName();
      const currentSymbol = prop?.getSymbol();
      if (isFunctionKind(currentSymbol)) {
        this.methods[propName] = new DocumentMethod(currentSymbol, symbol);
      } else {
        this.props[propName] = new DocumentProp(currentSymbol, symbol);
      }
    });
  }
}
