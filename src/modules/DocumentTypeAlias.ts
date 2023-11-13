import { Node, Symbol, TypeAliasDeclaration, TypeChecker, ts } from 'ts-morph';
import BaseDocField from './BaseDocField';
import { basename, dirname, resolve } from 'path';

export default class DocumentTypeAlias extends BaseDocField {
  constructor(symbol: Symbol, parentSymbol: Symbol = symbol, rootSymbol: Symbol = parentSymbol) {
    super(symbol, parentSymbol, rootSymbol);

    this.#assign(symbol);
  }

  #assign(symbol: Symbol) {
    const node = (symbol?.getValueDeclaration() ?? symbol?.getDeclarations()?.[0]) as TypeAliasDeclaration;
    debugger;
    const name = symbol?.getName();
    const path = node?.getSourceFile()?.getImportDeclarations()[1].getModuleSpecifierValue();
    const absolutePath = resolve(dirname(node?.getSourceFile()?.getFilePath()), path,'index.tsx');
    const file = node?.getProject().addSourceFileAtPathIfExists(absolutePath);
    const type = node?.getType();
    const IntersectionType = type.getIntersectionTypes();
    const result = (type: any) => [
      type?.isAnonymous(),
      type?.isAny(),
      type?.isArray(),
      type?.isBoolean(),
      type?.isBooleanLiteral(),
      type?.isClass(),//5
      type?.isClassOrInterface(),
      type?.isEnum(),
      type?.isEnumLiteral(),
      type?.isInterface(),
      type?.isIntersection(), // 10
      type?.isLiteral(),
      type?.isNull(),
      type?.isNumber(),
      type?.isNumberLiteral(),
      type?.isObject(), //15
      type?.isString(),
      type?.isStringLiteral(),
      type?.isTemplateLiteral(),
      type?.isTuple(),
      type?.isUndefined(), //20
      type?.isUnion(),
      type?.isUnionOrIntersection(),
      type?.isUnknown(),
    ];
    const typeAliasDeclaration = node.asKind(ts.SyntaxKind.TypeAliasDeclaration);
    const typeNode = typeAliasDeclaration?.getTypeNode().asKind(ts.SyntaxKind.IntersectionType);
    const typnoe2 = typeAliasDeclaration?.getFirstDescendantByKind(ts.SyntaxKind.IntersectionType);
    const typenode3 = typeAliasDeclaration?.getTypeNode();
    const testResult = result(typeAliasDeclaration?.getTypeNode()?.getType());
    const typeText = typeAliasDeclaration
      ?.getTypeNode()
      ?.getChildren()
      ?.map((it) => it.getText());
    const nodesss = node.forEachChildAsArray();
    console.log('tey');
  }

  static isTarget(node: Node): node is TypeAliasDeclaration {
    return Node.isTypeAliasDeclaration(node);
  }
}
