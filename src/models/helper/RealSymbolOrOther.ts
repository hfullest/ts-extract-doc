import {
  InterfaceDeclaration,
  InterfaceDeclarationStructure,
  JSDocTagStructure,
  MethodSignatureStructure,
  Node,
  PropertySignatureStructure,
  StructureKind,
  Symbol,
  Type,
  TypeLiteralNode,
  ts,
} from 'ts-morph';
import { BaseDocField, DocumentOptions, SymbolOrOtherType } from './BaseDocField';

/** 获取真实类型，用于处理ts复杂类型推断与计算 */
export class RealSymbolOrOther {
  #symbolOrOther!: SymbolOrOtherType;

  #parseOptions!: DocumentOptions;

  constructor(symbolOrOther: SymbolOrOtherType, options: DocumentOptions) {
    this.#parseOptions = options;
    this.#symbolOrOther = this.#getActualSymbolOrOther(symbolOrOther);
  }

  public getSymbolOrOther(): SymbolOrOtherType {
    return this.#symbolOrOther;
  }

  #getActualSymbolOrOther<T extends SymbolOrOtherType = SymbolOrOtherType>(symbolOrOther: T): T {
    const handlers: ((symbol: SymbolOrOtherType, options: DocumentOptions) => SymbolOrOtherType)[] = [
      this.#handleAlias,
      this.#handleHerit,
      this.#handlePick,
      this.#handleOmit,
      this.#handleIntersection,
    ];
    for (let handler of handlers) {
      const handled = handler.call(this, symbolOrOther, { ...this.#parseOptions });
      if (handled !== symbolOrOther) return this.#getActualSymbolOrOther(handled) as T; // 递归推导
    }
    return symbolOrOther;
  }

  /** 处理继承 */
  #handleHerit(symbolOrOther: SymbolOrOtherType): SymbolOrOtherType {
    const { symbol, node } = BaseDocField.splitSymbolNodeOrType(symbolOrOther, { useLocal: true });
    const importSpecifier = node?.asKind(ts.SyntaxKind.ImportSpecifier);
    if (!importSpecifier) return symbolOrOther;
    // 处理导入
    const moduleSymbol = importSpecifier
      ?.getImportDeclaration?.()
      ?.getModuleSpecifierSourceFile()
      ?.getLocal?.(symbol?.getName() ?? node?.getText()!);
    return moduleSymbol!;
  }

  #handleAlias(symbolOrOther: SymbolOrOtherType): SymbolOrOtherType {
    const { node } = BaseDocField.splitSymbolNodeOrType(symbolOrOther, { useLocal: true });
    if (!Node.isTypeReference(node)) return symbolOrOther;
    return symbolOrOther;
  }

  #handleIntersection(symbolOrOther: SymbolOrOtherType): SymbolOrOtherType {
    const { node } = BaseDocField.splitSymbolNodeOrType(symbolOrOther, { useLocal: true });
    if (!Node.isIntersectionTypeNode(node)) return symbolOrOther;
    const structure: InterfaceDeclarationStructure = { name: '', kind: StructureKind.Interface };
    const propertiesMap = new Map();
    const methodsMap = new Map();
    const intersectionNodes = node?.getTypeNodes();
    const tempNode = { current: undefined as Node | undefined };
    intersectionNodes.forEach((insecNode) => {
      const type = insecNode?.getType();
      const symbol = type?.getAliasSymbol?.() ?? type?.getSymbol?.();
      const insecSymbol = this.#getActualSymbolOrOther(symbol!);
      const { node: sourceNode } = BaseDocField.splitSymbolNodeOrType<Symbol, InterfaceDeclaration>(insecSymbol, {
        useLocal: true,
      });
      if (Node.isTypeAliasDeclaration(sourceNode)) {
        const typeLiteralNode = sourceNode.getFirstChildByKind(ts.SyntaxKind.TypeLiteral);
        const properties = typeLiteralNode?.getProperties();
        const methods = typeLiteralNode?.getMethods();

        properties?.forEach((it) => {
          const struct: PropertySignatureStructure = {
            kind: StructureKind.PropertySignature,
            name: it?.getName(),
            type: it?.getType()?.getText(),
            hasQuestionToken: it?.hasQuestionToken(),
            initializer: it.getInitializer()?.getText(),
            isReadonly: it.isReadonly(),
            docs: it?.getJsDocs()?.map((doc) => ({
              kind: StructureKind.JSDoc,
              description: doc.getDescription(),
              tags: doc.getTags()?.map(
                (tag) =>
                  ({
                    kind: StructureKind.JSDocTag,
                    tagName: tag.getTagName(),
                    text: tag.getText(),
                  }) as JSDocTagStructure,
              ),
            })),
          };
          propertiesMap.set(struct.name, struct);
        });
        methods?.forEach((it) => {
          const struct: MethodSignatureStructure = {
            kind: StructureKind.MethodSignature,
            name: it?.getName(),
            hasQuestionToken: it?.hasQuestionToken(),
            typeParameters: it?.getTypeParameters()?.map((p) => ({
              kind: StructureKind.TypeParameter,
              name: p.getName(),
              constraint: p.getConstraint()?.getText(),
              default: p.getDefault()?.getText(),
            })),
            parameters: it?.getParameters().map((p) => ({
              kind: StructureKind.Parameter,
              name: p.getName(),
              hasQuestionToken: p.hasQuestionToken(),
              initializer: p.getInitializer()?.getText(),
              isReadonly: p.isReadonly(),
              isRestParameter: p.isRestParameter(),
              scope: p.getScope(),
              type: p.getType().getText(),
            })),
            returnType: it?.getReturnType()?.getText(),
          };
          methodsMap.set(struct.name, struct);
        });
      } else {
        const struct = sourceNode?.getStructure?.();
        struct?.properties?.forEach((it) => propertiesMap.set(it.name, it));
        struct?.methods?.forEach((it) => methodsMap.set(it.name, it));
      }
      if (sourceNode?.getStructure?.()) tempNode.current = sourceNode;
      structure.properties = Array.from(propertiesMap.values());
      structure.methods = Array.from(methodsMap.values());
    });
    const originStructure = (tempNode.current as InterfaceDeclaration)?.getStructure();
    (tempNode.current as InterfaceDeclaration)?.set?.(structure);
    const targetText = tempNode.current?.getFullText() ?? node?.getFullText()!;
    (tempNode.current as InterfaceDeclaration)?.set?.(originStructure);
    const pos = node?.getPos();
    const sourceFile = node?.getSourceFile();
    node.replaceWithText(targetText);
    const newNode = sourceFile.getDescendantAtPos(pos)?.getParentWhileKind(ts.SyntaxKind.TypeLiteral);
    const { symbol: newSymbol, type: newType } = BaseDocField.splitSymbolNodeOrType(newNode);
    if (symbolOrOther instanceof Node) return newNode!;
    if (symbolOrOther instanceof Symbol) return newSymbol!;
    if (symbolOrOther instanceof Type) return newType!;
    return symbolOrOther;
  }

  #handlePick(symbolOrOther: SymbolOrOtherType, options: DocumentOptions): SymbolOrOtherType {
    const { symbol, node, type } = BaseDocField.splitSymbolNodeOrType(symbolOrOther, { useLocal: true });
    const pickIf = { isTarget: false, isTypeAlias: false, isType: false };
    const typeNode =
      node?.asKind?.(ts.SyntaxKind.TypeReference) ??
      node?.asKind?.(ts.SyntaxKind.TypeAliasDeclaration)?.getTypeNode?.()?.asKind(ts.SyntaxKind.TypeReference);
    // symbolOrOther 类型别名
    if (symbolOrOther instanceof Symbol && typeNode?.getTypeName()?.getText?.() === 'Pick') {
      pickIf.isTarget = true;
      pickIf.isTypeAlias = true;
    }
    // symbolOrOther 类型
    if (symbolOrOther instanceof Type && symbol?.getName?.() === 'Pick') {
      pickIf.isTarget = true;
      pickIf.isType = true;
    }

    if (pickIf.isTarget) {
      debugger;
      const [sourceTypeNode, unionTypeNode] = (typeNode?.getTypeArguments?.() ?? []).map((it) =>
        this.#getActualSymbolOrOther(it),
      );
      const targetTypeNode = { current: sourceTypeNode };
      const unionTypes = Node.isLiteralTypeNode(unionTypeNode)
        ? [unionTypeNode.getType()?.getLiteralValue?.()]
        : unionTypeNode
            ?.asKind(ts.SyntaxKind.UnionType)
            ?.getType()
            ?.getUnionTypes()
            .map((it) => it?.getLiteralValue?.()) ?? [];
      if (Node.isTypeReference(targetTypeNode.current)) {
        const targetSymbol = targetTypeNode.current.getType().getAliasSymbol();
        const { node } = BaseDocField.splitSymbolNodeOrType(targetSymbol);
        targetTypeNode.current =
          node?.asKind(ts.SyntaxKind.TypeAliasDeclaration)?.getFirstChildByKind(ts.SyntaxKind.TypeLiteral) ??
          targetTypeNode.current;
      }
    }
    return symbolOrOther;
  }
  #handleOmit(symbolOrOther: SymbolOrOtherType, options: DocumentOptions): SymbolOrOtherType {
    const { symbol, node, type } = BaseDocField.splitSymbolNodeOrType(symbolOrOther, { useLocal: true });
    const omitIf = { isTarget: false, isTypeAlias: false, isType: false, isReference: false };
    const typeNode =
      node?.asKind(ts.SyntaxKind.TypeReference) ??
      node?.asKind(ts.SyntaxKind.TypeAliasDeclaration)?.getTypeNode?.()?.asKind(ts.SyntaxKind.TypeReference);
    // symbolOrOther 类型别名
    if (symbolOrOther instanceof Symbol && typeNode?.getTypeName()?.getText?.() === 'Omit') {
      omitIf.isTarget = true;
      omitIf.isTypeAlias = true;
    }
    // symbolOrOther 为其他类型引用
    if (
      symbolOrOther instanceof Node &&
      Node.isTypeReference(symbolOrOther) &&
      typeNode?.getTypeName()?.getText?.() === 'Omit'
    ) {
      omitIf.isTarget = true;
      omitIf.isReference = true;
    }
    // symbolOrOther 类型
    if (symbolOrOther instanceof Type && symbol?.getName?.() === 'Omit') {
      omitIf.isTarget = true;
      omitIf.isType = true;
    }

    if (omitIf.isTarget) {
      debugger;
      const typeArgumentsTypes =
        (omitIf.isTypeAlias || omitIf.isReference
          ? typeNode
              ?.getTypeArguments()
              ?.map((it) => this.#getActualSymbolOrOther(it))
              ?.map((it) => it.getType())
          : type?.getAliasTypeArguments?.()) ?? [];
      const [targetType, propsUnionType] = typeArgumentsTypes;
      const unionTypes = propsUnionType.isLiteral()
        ? [propsUnionType?.getLiteralValue?.()]
        : propsUnionType.getUnionTypes?.()?.map((it) => it?.getLiteralValue?.());
      const omitKeys = new Set(unionTypes);
      const { node: plainNode } = BaseDocField.splitSymbolNodeOrType<Symbol, InterfaceDeclaration>(
        this.#getActualSymbolOrOther(targetType?.getAliasSymbol?.() ?? targetType?.getSymbol?.()!),
        { useLocal: true },
      );
      const targetNode = { current: plainNode } as { current: InterfaceDeclaration | TypeLiteralNode };
      if (omitIf.isTypeAlias && Node.isTypeAliasDeclaration(targetNode.current)) {
        targetNode.current = targetNode.current.getLastChildByKind(ts.SyntaxKind.TypeLiteral) ?? targetNode.current;
      }
      [...(targetNode.current?.getProperties?.() ?? []), ...(targetNode.current?.getMethods?.() ?? [])].forEach(
        (it) => {
          const name = it?.getName?.();
          if (omitKeys.has(name)) {
            it.remove();
          }
        },
      );

      if (omitIf.isTypeAlias) {
        const typeAliaNode = node?.asKind(ts.SyntaxKind.TypeAliasDeclaration);
        const parentNodeStructure = typeAliaNode?.getStructure();
        if (parentNodeStructure) {
          parentNodeStructure.type = targetNode.current?.getText()!;
          typeAliaNode?.set(parentNodeStructure);
        }
        return symbolOrOther;
      } else if (omitIf.isType) {
        return targetNode.current!;
      } else if (omitIf.isReference) {
        return targetNode.current!;
      }
    }
    return symbolOrOther;
  }
}
