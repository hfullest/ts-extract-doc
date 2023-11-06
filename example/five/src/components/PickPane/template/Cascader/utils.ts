import { TreeProps } from "antd/lib/tree";

import { PickCascaderProps } from ".";
import { computePropName } from "../../utils";

/** 父节点属性 */
export const parentSymbol = Symbol("parent");
/** 选中状态属性 */
export const checkStatSymbol = Symbol("checkStatus");
/** 当前层级 */
export const levelSymbol = Symbol("level");
export const indexSymbol = Symbol("index");
export const positionSymol = Symbol("position");
export const paginationSymbol = Symbol("pagination");
export const activeSymbol = Symbol("active");

export const keySymbol = Symbol("keyPropName");
export const childrenSymbol = Symbol("childrenPropName");
export const isLeafSymbol = Symbol("isLeafPropName");

export type DataNode = Parameters<NonNullable<TreeProps["titleRender"]>>[0];

export type PickTreeNode<T extends Record<any, any> = {}> = Partial<
  Omit<DataNode, "children">
> & {
  children?: PickTreeNode<T>[];
} & T;

export interface DataAux<T extends DataNodeType = DataNodeType> {
  /** 父节点 */
  [parentSymbol]: T | null;
  /** 当前节点选中状态 */
  [checkStatSymbol]: CheckStatus;
  /** 当前节点层级 */
  [levelSymbol]: number;
  /** 节点位置顺序，可用来排序 */
  [indexSymbol]: string;
  /** 保存节点位置路径信息 */
  [positionSymol]: T[];
  /** 保存当前节点子节点分页信息 */
  [paginationSymbol]: {
    current: number;
    pageSize: number;
    total: number;
  } | null;
  /** 当前节点的状态 */
  [activeSymbol]: () => {
    disabled: boolean;
    disableCheckbox: boolean;
    checkable: boolean;
  };
  [keySymbol]: { name: string; value: string };
  [childrenSymbol]: { name: string; value: T[] | null };
  [isLeafSymbol]: { name: string; value: boolean };
}

export interface DataNodeType extends PickTreeNode, DataAux {}

export type CheckStatus = "checked" | "halfChecked" | "nocheck";

export type AuxOptions<T = any> = Pick<
  PickCascaderProps<T>,
  "keyPropName" | "isLeafPropName" | "childrenPropName" | "rules"
>;

const addAuxiliary = <T extends PickTreeNode = PickTreeNode>(
  node: T,
  values: DataAux
) => {
  const key = values[keySymbol].value;
  const children = values[childrenSymbol].value;
  const isLeaf = values[isLeafSymbol].value;
  Object.assign(node ?? {}, values, {
    ...(key !== undefined && { key }),
    ...(children !== undefined && { children }),
    ...(isLeaf !== undefined && { isLeaf }),
  });
};

export const isCheckDisabled = <T extends DataNodeType = DataNodeType>(
  node: T
) => {
  const { disabled, disableCheckbox, checkable } =
    node[activeSymbol]?.() ?? node;
  return !!(disabled || disableCheckbox) || checkable === false;
};

/** 构建层级映射 */
export const buildLevelMap = <T extends DataNodeType = DataNodeType>(
  nodesMap: Map<string, T> | T[]
): [Map<number, Set<T>>, number] => {
  let maxLevel = 0;
  const levelMap = new Map<number, Set<T>>();
  nodesMap.forEach((node: T) => {
    const level = node[levelSymbol];
    let levelSet = levelMap.get(level);
    if (!levelSet) {
      levelSet = new Set<T>();
      levelMap.set(level, levelSet);
    }
    levelSet.add(node);
    maxLevel = Math.max(maxLevel, level);
  });
  return [levelMap, maxLevel];
};

/** 根据子节点填充父节点 */
const paddingParentByChildNodes = <T extends DataNodeType = DataNodeType>(
  nodes: T[]
): T[] => {
  const paddingNodes = new Map<string, T>();
  const [levelMap, maxLevel] = buildLevelMap<T>(nodes);
  for (let level = maxLevel; level > 0; level--) {
    const nodes = levelMap.get(level) ?? new Set();
    for (let node of nodes) {
      const key = node[keySymbol].value;
      if (paddingNodes.has(key)) continue;
      paddingNodes.set(key, node);
      let parent = node[parentSymbol];
      while (parent) {
        const parentKey = parent[keySymbol].value;
        if (!paddingNodes.has(parentKey)) {
          paddingNodes.set(parentKey, parent as T);
        }
        parent = parent[parentSymbol];
      }
    }
  }

  const [padLevelMap, padMaxLevel] = buildLevelMap(paddingNodes);
  const visitedKeys = new Set<string>();
  for (let level = padMaxLevel; level > 0; level--) {
    const nodes = padLevelMap.get(level) ?? new Set();
    for (let originNode of nodes) {
      const key = originNode[keySymbol].value;
      const node = visitedKeys.has(key) ? originNode : { ...originNode };
      const parentKey = node[parentSymbol]
        ? node[parentSymbol]![keySymbol].value
        : "";
      if (!visitedKeys.has(key)) {
        visitedKeys.add(key);
        paddingNodes.set(key, node);
      }
      if (paddingNodes.has(parentKey)) {
        let parent = Object.assign({}, node[parentSymbol]);
        if (visitedKeys.has(parentKey)) {
          parent = paddingNodes.get(parentKey)!;
          const targetIndex =
            parent[childrenSymbol].value?.findIndex(
              (it) => it[keySymbol].value === key
            ) ?? -1;
          if (targetIndex >= 0) {
            parent[childrenSymbol].value?.splice(targetIndex, 1, node);
          }
          node[parentSymbol] = parent;
        } else {
          const children = parent[childrenSymbol].value
            ?.map((it) => paddingNodes.get(it[keySymbol].value))
            .filter(Boolean);
          (parent as any)[parent[childrenSymbol].name] = children;
          parent[childrenSymbol] = Object.assign({}, parent[childrenSymbol], {
            value: children,
          });
          node[parentSymbol] = parent;
          visitedKeys.add(parentKey);
          paddingNodes.set(parentKey, parent as T);
        }
      }
    }
  }

  return Array.from(paddingNodes.values());
};

/** 将按顺序排列的树重新构建成树结构 */
export function buildTree<T extends DataNodeType = DataNodeType>(
  nodes: T[],
  usingPadding: boolean = false
): T[] {
  if (!Array.isArray(nodes)) return [];
  const paddingNodes = usingPadding
    ? paddingParentByChildNodes<T>(nodes)
    : nodes;
  const sortedNodes = paddingNodes.sort((a, b) => {
    let aStr = a[indexSymbol].split("-").join("");
    let bStr = b[indexSymbol].split("-").join("");
    const maxLen = Math.max(aStr.length, bStr.length);
    aStr = aStr.padEnd(maxLen, "0");
    bStr = bStr.padEnd(maxLen, "0");
    return Number(aStr) - Number(bStr);
  }); // 根据位置进行排序，保证存入的集合都是正确的树结构顺序
  const map = new Map<string | null, T[]>(); // 存父元素key 和节点 map, key为父节点key，value为子节点集合
  for (let node of sortedNodes) {
    const parent = node[parentSymbol];
    const parentKey = parent ? parent[keySymbol].value : null;
    const parentNodes = map.get(parentKey);
    if (!Array.isArray(parentNodes)) map.set(parentKey, [node]);
    else parentNodes.push(node);
  }
  return map.get(null) ?? []; // 返回树的根节点数组
}

/** 拍平树结构，将树结构各个节点放置到`Map`中，并使用symbol记录父节点，方便还原树结构 */
export const flatTree = <
  T extends PickTreeNode & Partial<DataAux> = PickTreeNode
>(
  treeData: T[],
  initParent: T | null = null,
  allTreeMap: Map<string, T & DataNodeType> = new Map(),
  options?: AuxOptions<T>
): Map<string, T & DataNodeType> => {
  const {
    keyPropName = "key",
    childrenPropName = "children",
    isLeafPropName = "isLeaf",
    rules,
  } = options ?? {};
  const map = new Map<string, T & DataNodeType>();
  let level = ((initParent && initParent[levelSymbol]) || 0) + 1;
  const traverse = (
    treeData: T[],
    parent: T | null,
    status: CheckStatus,
    level: number,
    index: number = 1
  ) => {
    const parentIndex = parent ? parent[indexSymbol] + "-" : "";
    const parentPosition = parent ? parent[positionSymol] ?? [] : [];

    for (const node of treeData) {
      let key = computePropName(node, keyPropName) as string;
      const children = computePropName(node, childrenPropName) as any[];
      const isLeaf = computePropName(node, isLeafPropName) as boolean;
      if (allTreeMap.has(key)) continue;
      if (!key) {
        key = Math.random().toString(16).slice(2);
        console.error(
          `数据项中未找到指定的唯一字段\`${keyPropName}\`，请正确指定唯一字段！请注意：这里将暂时使用随机数\`${key}\`作为该数据项的唯一字段.`
        );
      }
      addAuxiliary(node, {
        [parentSymbol]: parent as DataNodeType,
        [checkStatSymbol]: status,
        [levelSymbol]: level,
        [indexSymbol]: parentIndex + index++,
        [positionSymol]: parentPosition.concat(node as DataNodeType),
        [paginationSymbol]: null,
        [keySymbol]: { name: keyPropName as string, value: key },
        [childrenSymbol]: { name: childrenPropName as string, value: children },
        [isLeafSymbol]: { name: isLeafPropName as string, value: isLeaf },
        [activeSymbol]: () => ({
          disabled:
            node["disabled"] ?? rules?.disabled?.(node, new Map(allTreeMap))!,
          disableCheckbox:
            node["disableCheckbox"] ??
            rules?.disabledCheckbox?.(node, new Map(allTreeMap))!,
          checkable:
            node["checkable"] ?? rules?.checkable?.(node, new Map(allTreeMap))!,
        }),
      });
      map.set(key, node as T & DataNodeType);
      if (Array.isArray(children)) {
        traverse(children, node, status, level + 1);
      }
    }
  };
  const initParentChildren = computePropName(initParent!, childrenPropName) as
    | any[]
    | undefined;
  const startIndex: number = (initParentChildren?.length || 0) + 1;
  traverse(treeData, initParent, "nocheck", level, startIndex);

  if (initParent && map.size) {
    const children = treeData
      .map((it) => map.get(computePropName(it, keyPropName) as string)!)
      .filter(Boolean);
    if (!initParentChildren?.length) {
      const parentChildren = children;
      initParent[childrenSymbol] = {
        name: childrenPropName as string,
        value: parentChildren,
      };
      (initParent as any)[childrenPropName] = parentChildren;
    } else {
      const parentChildren: T[] = initParentChildren;
      parentChildren.push(...children);
    }
  }

  return map;
};

const fillConductCheck = <T extends DataNodeType = DataNodeType>(
  nodesMap: Map<string, T>,
  levelMap: Map<number, Set<T>>,
  maxLevel: number
): { checkedNodes: Map<string, T>; halfCheckedNodes: Map<string, T> } => {
  const checkedNodes = new Map<string, T>(nodesMap);
  const halfCheckedNodes = new Map<string, T>();
  // 自上而下遍历
  for (let level = 1; level <= maxLevel; level++) {
    const nodes = levelMap.get(level) ?? new Set();
    for (let node of nodes) {
      if (checkedNodes.has(node[keySymbol].value) && !isCheckDisabled(node)) {
        node[childrenSymbol].value?.forEach((it) => {
          if (isCheckDisabled(it)) return;
          checkedNodes.set(it[keySymbol].value, it as T);
        });
      }
    }
  }
  //自下而上遍历
  const visitedKeys = new Set<string>();
  for (let level = maxLevel; level > 0; level--) {
    const nodes = levelMap.get(level) ?? new Set();
    for (let node of nodes) {
      const parent = node[parentSymbol];
      let allChecked = true;
      let partialChecked = false;
      if (
        isCheckDisabled(node) ||
        !parent ||
        visitedKeys.has(parent[keySymbol].value)
      )
        continue;
      const parentKey = parent[keySymbol].value;
      if (isCheckDisabled(parent)) {
        visitedKeys.add(parentKey);
        continue;
      }

      parent[childrenSymbol].value?.forEach((it) => {
        if (isCheckDisabled(it)) return;
        const key = it[keySymbol].value;
        const checked = checkedNodes.has(key);
        if (allChecked && !checked) allChecked = false;
        if (!partialChecked && (checked || halfCheckedNodes.has(key)))
          partialChecked = true;
      });
      if (allChecked) checkedNodes.set(parentKey, parent as T);
      if (partialChecked) halfCheckedNodes.set(parentKey, parent as T);
      visitedKeys.add(parentKey);
    }
  }
  Array.from(halfCheckedNodes.entries()).forEach(([key, node]) => {
    if (checkedNodes.has(key)) {
      halfCheckedNodes.delete(key);
    } else {
      node[checkStatSymbol] = "halfChecked";
    }
  });
  Array.from(checkedNodes.values()).forEach(
    (it) => (it[checkStatSymbol] = "checked")
  );

  return { checkedNodes, halfCheckedNodes };
};

const cleanConductCheck = <T extends DataNodeType = DataNodeType>(
  nodesMap: Map<string, T>,
  halfNodesMap: Map<string, T>,
  levelMap: Map<number, Set<T>>,
  maxLevel: number
): { checkedNodes: Map<string, T>; halfCheckedNodes: Map<string, T> } => {
  const checkedNodes = new Map<string, T>(nodesMap);
  const halfCheckedNodes = new Map<string, T>(halfNodesMap);
  // 自上而下遍历
  for (let level = 1; level <= maxLevel; level++) {
    const nodes = levelMap.get(level) ?? new Set();
    for (let node of nodes) {
      const key = node[keySymbol].value;
      if (
        !checkedNodes.has(key) &&
        !halfCheckedNodes.has(key) &&
        !isCheckDisabled(node)
      ) {
        node[childrenSymbol].value?.forEach((it) => {
          if (isCheckDisabled(it)) return;
          checkedNodes.delete(it[keySymbol].value);
        });
      }
    }
  }
  //自下而上遍历
  halfCheckedNodes.clear();
  const visitedKeys = new Set<string>();
  for (let level = maxLevel; level > 0; level--) {
    const nodes = levelMap.get(level) ?? new Set();
    for (let node of nodes) {
      const parent = node[parentSymbol];
      let allChecked = true;
      let partialChecked = false;
      if (
        isCheckDisabled(node) ||
        !parent ||
        visitedKeys.has(parent[keySymbol].value)
      )
        continue;
      const parentKey = parent[keySymbol].value;
      if (isCheckDisabled(parent)) {
        visitedKeys.add(parentKey);
        continue;
      }
      parent[childrenSymbol].value?.forEach((it) => {
        if (isCheckDisabled(it)) return;
        const key = it[keySymbol].value;
        const checked = checkedNodes.has(key);
        if (allChecked && !checked) allChecked = false;
        if (!partialChecked && (checked || halfCheckedNodes.has(key)))
          partialChecked = true;
      });
      if (!allChecked) checkedNodes.delete(parentKey);
      if (partialChecked) halfCheckedNodes.set(parentKey, parent as T);
      visitedKeys.add(parentKey);
    }
  }
  Array.from(halfCheckedNodes.entries()).forEach(([key, node]) => {
    if (checkedNodes.has(key)) {
      halfCheckedNodes.delete(key);
    } else {
      node[checkStatSymbol] = "halfChecked";
    }
  });
  Array.from(checkedNodes.values()).forEach(
    (it) => (it[checkStatSymbol] = "checked")
  );

  return { checkedNodes, halfCheckedNodes };
};

/** 根据传入选中的节点集合与整棵树的对比，自动计算出当前应该的全选节点和半选状态
 *
 * @param nodes 整棵树当前需要的全选的节点集合
 * @param checked 触发计算的操作类型方式
 *              - `true`, 表示选中某个节点导致的重新计算
 *              - `false`, 表示反选某个节点或多个节点导致的重新计算
 * @param allTreeMap 整棵树的Map集合
 * @returns 返回全选和半选的Map集合
 *
 * check 处理逻辑借鉴于：https://github.com/react-component/tree/blob/master/src/utils/conductUtil.ts
 */
export const conductCheck = <T extends DataNodeType = DataNodeType>(
  nodes: T[],
  checked: boolean,
  allTreeMap: Map<string, T>
): Map<string, T> => {
  if (!Array.isArray(nodes)) return new Map();
  const nodesMap = new Map<string, T>(
    nodes.map((it) => [it[keySymbol].value, it])
  );

  allTreeMap.forEach(
    (node) => (node[checkStatSymbol] = "nocheck") // 初始化选中状态
  );
  const [levelMap, maxLevel] = buildLevelMap(allTreeMap);

  let checksNodes = fillConductCheck<T>(nodesMap, levelMap, maxLevel);

  if (!checked) {
    checksNodes = cleanConductCheck<T>(
      nodesMap,
      checksNodes.halfCheckedNodes,
      levelMap,
      maxLevel
    );
  }
  const checkesEntities: [string, T][] = Array.from(
    checksNodes.checkedNodes.values()
  )
    .concat(Array.from(checksNodes.halfCheckedNodes.values()))
    .map((it) => [it[keySymbol].value, it]);
  const map = new Map(checkesEntities);

  return map;
};

/** 清理辅助属性，保持数据干净性 */
export const wipeAuxiliary = <T extends DataNodeType = DataNodeType>(
  nodes: T[]
): Exclude<T, DataAux>[] => {
  if (!Array.isArray(nodes)) return [];
  const newNodes = nodes.map((node) => {
    const {
      [parentSymbol]: parent,
      [checkStatSymbol]: checkStatus,
      [levelSymbol]: level,
      [indexSymbol]: order,
      [positionSymol]: position,
      [paginationSymbol]: pagination,
      [keySymbol]: keyPropName,
      [childrenSymbol]: childrenPropName,
      [isLeafSymbol]: isLeafPropName,
      [activeSymbol]: active,
      ...rest
    } = node;
    const childrenName = node[childrenSymbol].name;
    const children = (rest as any)[childrenName];
    if (Array.isArray(children)) {
      (rest as any)[childrenName] = wipeAuxiliary(children);
    }
    if (keyPropName.name !== "key") delete (rest as any)["key"];
    if (childrenPropName.name !== "children") delete (rest as any)["children"];
    if (isLeafPropName.name !== "isLeaf") delete (rest as any)["isLeaf"];
    return rest as Exclude<T, DataAux>;
  });
  return newNodes;
};
