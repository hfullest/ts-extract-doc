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
      const struct = this.#$extractStructure(sourceNode!);
      struct?.properties?.forEach((it) => propertiesMap.set(it.name, it));
      struct?.methods?.forEach((it) => methodsMap.set(it.name, it));
      if (sourceNode?.getStructure?.()) tempNode.current = sourceNode;
      structure.properties = Array.from(propertiesMap.values());
      structure.methods = Array.from(methodsMap.values());
    });
    const originStructure = (tempNode.current as InterfaceDeclaration)?.getStructure();
    (tempNode.current as InterfaceDeclaration)?.set?.(structure);
    const roughText = tempNode.current?.getFullText() ?? node?.getFullText()!;
    (tempNode.current as InterfaceDeclaration)?.set?.(originStructure);
    return this.#$getLastestSymbolOrOther(node, roughText, symbolOrOther, ts.SyntaxKind.TypeLiteral);
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
    return this.#$commonEntity(symbolOrOther, 'Omit', {
      getTargetType: (typeArgumentsTypes) => typeArgumentsTypes[0],
      handleTargetNode: (targetNode, typeArgumentsTypes) => {
        const unionTypes = typeArgumentsTypes?.[1];
        const omitKeys = unionTypes?.isLiteral?.()
          ? [unionTypes?.getLiteralValue?.()]
          : unionTypes.getUnionTypes?.()?.map((it) => it?.getLiteralValue?.());
        const node = targetNode as InterfaceDeclaration;
        [...(node?.getProperties?.() ?? []), ...(node?.getMethods?.() ?? [])].forEach((it) => {
          const name = it?.getName?.();
          if (omitKeys.includes(name)) {
            it.remove();
          }
        });
      },
    });
  }

  #$getLastestSymbolOrOther(
    node: Node,
    replaceText: string | null,
    symbolOrOther: SymbolOrOtherType,
    newNodeKind: ts.SyntaxKind = node?.getKind(),
  ) {
    const pos = node?.getPos();
    const sourceFile = node?.getSourceFile();
    const range = [node?.getStartLineNumber?.(), node?.getEndLineNumber?.()];
    if (typeof replaceText === 'string') {
      const placeholderText = Array(range[1] - range[0])
        .fill('\n')
        .join('');
      const withoutSpaceText = replaceText.replace(/\n+/g, '\t');
      const targetText = withoutSpaceText.replace(/\t/, placeholderText); // 只替换第一个
      node.replaceWithText(targetText); // 替换文本但保持起始结束占行相同，便于后续解析
    }
    const newNode = sourceFile.getDescendantAtPos(pos)?.getParentWhileKind(newNodeKind);
    const { symbol: newSymbol, type: newType } = BaseDocField.splitSymbolNodeOrType(newNode);
    if (symbolOrOther instanceof Node) return newNode!;
    if (symbolOrOther instanceof Symbol) return newSymbol!;
    if (symbolOrOther instanceof Type) return newType!;
    return symbolOrOther;
  }
  #$extractStructure(node: Node) {
    if (Node.isTypeAliasDeclaration(node)) {
      const typeLiteralNode = node.getFirstChildByKind(ts.SyntaxKind.TypeLiteral);
      const properties = typeLiteralNode?.getProperties();
      const methods = typeLiteralNode?.getMethods();

      const structProperties = properties?.map((it) => {
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
        return struct;
      });
      const structMethods = methods?.map((it) => {
        const struct: MethodSignatureStructure = {
          kind: StructureKind.MethodSignature,
          name: it?.getName(),
          hasQuestionToken: it?.hasQuestionToken(),
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
        return struct;
      });
      return {
        kind: StructureKind.Interface,
        properties: structProperties,
        methods: structMethods,
        docs: node?.getJsDocs()?.map((doc) => ({
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
      } as InterfaceDeclarationStructure;
    } else {
      return (node as InterfaceDeclaration)?.getStructure?.();
    }
  }
  /** 处理公共类型工具逻辑，如Pick、Omit等 */
  #$commonEntity(
    symbolOrOther: SymbolOrOtherType,
    name: string,
    config: {
      getTargetType: (typeArgumentsTypes: Type[]) => Type;
      handleTargetNode: (targetNode: Node, typeArgumentsTypes: Type[]) => void;
    },
  ) {
    const { symbol, node, type } = BaseDocField.splitSymbolNodeOrType(symbolOrOther, { useLocal: true });
    const ifs = { isTarget: false, isTypeAlias: false, isType: false, isReference: false };
    const typeNode =
      node?.asKind(ts.SyntaxKind.TypeReference) ??
      node?.asKind(ts.SyntaxKind.TypeAliasDeclaration)?.getTypeNode?.()?.asKind(ts.SyntaxKind.TypeReference);
    // symbolOrOther 类型别名
    if (symbolOrOther instanceof Symbol && typeNode?.getTypeName()?.getText?.() === name) {
      ifs.isTarget = true;
      ifs.isTypeAlias = true;
    }
    // symbolOrOther 为其他类型引用
    if (
      symbolOrOther instanceof Node &&
      Node.isTypeReference(symbolOrOther) &&
      typeNode?.getTypeName()?.getText?.() === name
    ) {
      ifs.isTarget = true;
      ifs.isReference = true;
    }
    // symbolOrOther 类型
    if (symbolOrOther instanceof Type && symbol?.getName?.() === name) {
      ifs.isTarget = true;
      ifs.isType = true;
    }

    if (ifs.isTarget) {
      debugger;
      const typeArgumentsTypes =
        (ifs.isTypeAlias || ifs.isReference
          ? typeNode
              ?.getTypeArguments()
              ?.map((it) => this.#getActualSymbolOrOther(it))
              ?.map((it) => it.getType())
          : type?.getAliasTypeArguments?.()) ?? [];
      const targetType = config?.getTargetType?.(typeArgumentsTypes);
      const { node: plainNode } = BaseDocField.splitSymbolNodeOrType<Symbol, InterfaceDeclaration>(
        this.#getActualSymbolOrOther(targetType?.getAliasSymbol?.() ?? targetType?.getSymbol?.()!),
        { useLocal: true },
      );
      const targetNode = { current: plainNode } as { current: InterfaceDeclaration | TypeLiteralNode };
      if (ifs.isTypeAlias && Node.isTypeAliasDeclaration(targetNode.current)) {
        targetNode.current = targetNode.current.getLastChildByKind(ts.SyntaxKind.TypeLiteral) ?? targetNode.current;
      }
      config?.handleTargetNode?.(targetNode.current, typeArgumentsTypes);
      const resultNode = { current: node };
      if (ifs.isTypeAlias) {
        const typeAliaNode = node?.asKind(ts.SyntaxKind.TypeAliasDeclaration);
        const parentNodeStructure = typeAliaNode?.getStructure();
        if (parentNodeStructure) {
          parentNodeStructure.type = targetNode.current?.getText()!;
          typeAliaNode?.set(parentNodeStructure);
        }
        resultNode.current = node;
      } else if (ifs.isType || ifs.isReference) {
        resultNode.current = targetNode.current;
      }
      return this.#$getLastestSymbolOrOther(resultNode.current!, null, symbolOrOther);
    }
    return symbolOrOther;
  }
}
