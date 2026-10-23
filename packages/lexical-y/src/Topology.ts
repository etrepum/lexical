/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {YBinding} from './YBinding';

import invariant from '@lexical/internal/invariant';
import {
  ContentType,
  createID,
  Item,
  Node as YNode,
  type Transaction,
} from '@y/y';

export const TREE_PREFIX = 'tree:';
export const NODE_STORE = 'tree:nodes:';
const PLACEMENT = 'tree:placement';
export interface Placement {
  id: string;
  token: string;
}

const nodeIDs = new WeakMap<YNode, string>();

/** Compact IDs come from the integrating Yjs item, unique without randomness. */
export function getNodeID(node: YNode): string {
  const cached = nodeIDs.get(node);
  if (cached) return cached;
  const item = node._item;
  invariant(item !== null, '@lexical/y: a stored node must be integrated');
  const original = node.getAttr('tree:id');
  const id =
    typeof original === 'string'
      ? original
      : item.id.client.toString(36) + ':' + item.id.clock.toString(36);
  nodeIDs.set(node, id);
  return id;
}

export function getNodeStores(root: YNode): YNode[] {
  return Object.entries(root.getAttrs()).flatMap(([key, value]) =>
    key.startsWith(NODE_STORE) && value instanceof YNode ? [value] : [],
  );
}

/** Test/introspection helper; storage order has no document semantics. */
export function getNodeStore(root: YNode): YNode | null {
  return getNodeStores(root)[0] || null;
}

export function isNodeStore(root: YNode, node: YNode | null): boolean {
  const item = node && node._item;
  return !!(
    node &&
    node.parent === root &&
    item &&
    typeof item.parentSub === 'string' &&
    item.parentSub.startsWith(NODE_STORE) &&
    root.getAttr(item.parentSub) === node
  );
}

interface StoredNodes {
  stores: Set<YNode>;
  nodes: Map<string, Set<YNode>>;
}
const stores = new WeakMap<YNode, StoredNodes>();

/** Refresh only inserted/deleted storage items, including identities revived remotely. */
export function syncNodeStore(root: YNode, transaction?: Transaction): void {
  const current = new Set(getNodeStores(root));
  let index = stores.get(root);
  const replaced =
    index && [...index.stores].some(store => !current.has(store));
  if (
    !index ||
    !transaction ||
    replaced ||
    [...current].some(store => store._renderer !== null)
  ) {
    index = {nodes: new Map(), stores: current};
    for (const store of current)
      for (const node of store.toArray())
        if (node instanceof YNode) {
          const id = getNodeID(node);
          let values = index.nodes.get(id);
          if (!values) index.nodes.set(id, (values = new Set()));
          values.add(node);
        }
    stores.set(root, index);
    return;
  }
  index.stores = current;
  for (const set of [transaction.insertSet, transaction.deleteSet])
    set.forEach((range, client) => {
      for (let clock = range.clock; clock < range.clock + range.len; ) {
        const item = root.doc!.store.getItem(createID(client, clock));
        if (
          item instanceof Item &&
          item.parent instanceof YNode &&
          current.has(item.parent) &&
          item.content instanceof ContentType
        ) {
          const node = item.content.type;
          const id = getNodeID(node);
          let values = index.nodes.get(id);
          if (!item.deleted) {
            if (!values) index.nodes.set(id, (values = new Set()));
            values.add(node);
          } else if (values) {
            values.delete(node);
            if (values.size === 0) index.nodes.delete(id);
          }
        }
        clock = item.id.clock + item.length;
      }
    });
}

/** The original item ID stays the logical identity across transmitted undo/redo. */
export function getNodeByID(root: YNode, id: string): YNode | null {
  if (!stores.has(root)) syncNodeStore(root);
  const index = stores.get(root);
  let winner: YNode | null = null;
  for (const node of (index && index.nodes.get(id)) || []) {
    const item = node._item!;
    const previous = winner && winner._item!;
    if (
      !previous ||
      item.id.client > previous.id.client ||
      (item.id.client === previous.id.client &&
        item.id.clock > previous.id.clock)
    )
      winner = node;
  }
  return winner;
}

export function getStoredNode(binding: YBinding, value: unknown): YNode | null {
  if (!value || typeof value !== 'object') return null;
  const {id, token} = value as Placement;
  if (typeof id !== 'string' || typeof token !== 'string') return null;
  const node = getNodeByID(binding.root, id);
  return node && node.getAttr(PLACEMENT) === token ? node : null;
}

export function placeNode(binding: YBinding, node: YNode): Placement {
  binding.topologyChanged = true;
  // A single lazily created store would conflict on independent first edits.
  // Concurrent initializers use distinct keys; later writers reuse a store.
  const storeKey = NODE_STORE + binding.doc.clientID.toString(36);
  let store = getNodeStore(binding.root);
  if (!store) {
    store = new YNode();
    binding.root.setAttr(storeKey, store);
  }
  if (!node.doc) {
    const parent = store;
    // This store is unordered. Independent items have no sequence origins, so
    // accepting a later suggestion does not require accepting earlier nodes.
    // Item/ContentType integration is covered by the exactly pinned Yjs RC.
    binding.doc.transact(transaction => {
      new Item(
        createID(
          binding.doc.clientID,
          binding.doc.store.getClock(binding.doc.clientID),
        ),
        null,
        null,
        null,
        null,
        parent,
        null,
        new ContentType(node),
      ).integrate(transaction, 0);
    });
  }
  invariant(
    isNodeStore(binding.root, node.parent),
    '@lexical/y: document nodes must belong to the node store',
  );
  const id = getNodeID(node);
  if (node.getAttr('tree:id') === undefined) node.setAttr('tree:id', id);
  if (!stores.has(binding.root)) syncNodeStore(binding.root);
  stores.get(binding.root)!.stores.add(store);
  const nodes = stores.get(binding.root)!.nodes;
  let versions = nodes.get(id);
  if (!versions) nodes.set(id, (versions = new Set()));
  versions.add(node);
  const token =
    binding.doc.clientID.toString(36) +
    ':' +
    binding.doc.store.getClock(binding.doc.clientID).toString(36);
  node.setAttr(PLACEMENT, token);
  return {id, token};
}

/** Delete locally removed nodes; Yjs owns undo retention and collection. */
export function deleteRemovedNodes(
  binding: YBinding,
  previous: ReadonlySet<YNode>,
): void {
  // Only structural commits need this walk. Plain text edits never enter it.
  for (const store of getNodeStores(binding.root)) {
    const removed: number[] = [];
    store.toArray().forEach((node, index) => {
      if (
        node instanceof YNode &&
        previous.has(node) &&
        !binding.parents.has(node)
      )
        removed.push(index);
    });
    for (let i = removed.length - 1; i >= 0; i--) store.delete(removed[i], 1);
  }
}

/** A single winning placement per node makes concurrent moves deterministic. */
export function getChildren(binding: YBinding, parent: YNode): YNode[] {
  if (
    parent !== binding.root &&
    (parent.name === null ||
      (isNodeStore(binding.root, parent.parent) &&
        getNodeByID(binding.root, getNodeID(parent)) !== parent))
  )
    return [];
  const seen = new Set<YNode>();
  const children = parent.toArray().flatMap(value => {
    const node = getStoredNode(binding, value);
    if (!node || seen.has(node) || binding.recovered.has(node)) return [];
    seen.add(node);
    return [node];
  });
  if (parent === binding.root) children.push(...binding.recovered);
  return children;
}

export function getChildIndex(
  binding: YBinding,
  parent: YNode,
  child: YNode,
): number {
  return parent
    .toArray()
    .findIndex(value => getStoredNode(binding, value) === child);
}

export function getParent(binding: YBinding, child: YNode): YNode | null {
  return binding.parents.get(child) ?? null;
}

interface TopologyIndex {
  nodes: Map<string, YNode>;
  children: Map<YNode, Set<YNode>>;
  parents: Map<YNode, YNode>;
}
const indexes = new WeakMap<YBinding, TopologyIndex>();

function containerChildren(binding: YBinding, parent: YNode): Set<YNode> {
  const result = new Set<YNode>();
  if (
    parent !== binding.root &&
    (parent.name === null ||
      (isNodeStore(binding.root, parent.parent) &&
        getNodeByID(binding.root, getNodeID(parent)) !== parent))
  )
    return result;
  for (const value of parent.toArray()) {
    const node = getStoredNode(binding, value);
    if (node) result.add(node);
  }
  for (const [key, value] of Object.entries(binding.getAttributes(parent))) {
    if (!key.startsWith('slot:')) continue;
    const node = getStoredNode(binding, value);
    if (node) result.add(node);
  }
  return result;
}

/** Update touched containers; only cycle repair requires a full projection scan. */
export function readTopology(
  binding: YBinding,
  transaction?: Transaction,
  invalidated?: Set<YNode>,
): void {
  syncNodeStore(binding.root, transaction);
  const changed = transaction && transaction.changed;
  const index = indexes.get(binding);
  if (!index || !changed || binding.recovered.size) {
    rebuildTopology(binding);
    if (invalidated) {
      invalidated.add(binding.root);
      for (const node of binding.parents.keys()) invalidated.add(node);
    }
    const stored = getNodeStores(binding.root).flatMap(
      store => store.toArray() as YNode[],
    );
    const children = new Map<YNode, Set<YNode>>();
    const parents = new Map<YNode, YNode>();
    for (const parent of [binding.root, ...stored]) {
      const values = containerChildren(binding, parent);
      children.set(parent, values);
      for (const child of values) parents.set(child, parent);
    }
    indexes.set(binding, {
      children,
      nodes: new Map(
        stored.map(node => [
          getNodeID(node),
          getNodeByID(binding.root, getNodeID(node))!,
        ]),
      ),
      parents,
    });
    return;
  }
  binding.topologyChanged = false;
  const affected = new Set<YNode>();
  const candidates = new Set<YNode>();
  for (const [node, keys] of changed) {
    if (keys.has(null) && (node === binding.root || node.name !== null))
      affected.add(node);
    for (const key of keys) {
      if (key === PLACEMENT) {
        const previous = index.parents.get(node);
        if (previous) affected.add(previous);
        candidates.add(node);
      } else if (key && key.startsWith('slot:')) affected.add(node);
    }
  }
  const discover = (parent: YNode): void => {
    if (index.children.has(parent)) return;
    const children = containerChildren(binding, parent);
    index.children.set(parent, children);
    for (const child of children) {
      index.parents.set(child, parent);
      candidates.add(child);
      discover(child);
    }
  };
  if (transaction) {
    for (const set of [transaction.insertSet, transaction.deleteSet])
      set.forEach((range, client) => {
        for (let clock = range.clock; clock < range.clock + range.len; ) {
          const item = binding.doc.store.getItem(createID(client, clock));
          if (
            item instanceof Item &&
            item.parent instanceof YNode &&
            isNodeStore(binding.root, item.parent) &&
            item.content instanceof ContentType
          ) {
            const node = item.content.type;
            const id = getNodeID(node);
            const previous = index.nodes.get(id);
            if (previous) {
              candidates.add(previous);
              const parent = index.parents.get(previous);
              if (parent) affected.add(parent);
            }
            if (!item.deleted) {
              const winner = getNodeByID(binding.root, id);
              if (winner) {
                index.nodes.set(id, winner);
                affected.add(winner);
                candidates.add(winner);
              }
            }
          }
          clock = item.id.clock + item.length;
        }
      });
  }
  // Remove old edges before adding any new edges: a move may affect both ends.
  for (const parent of affected) {
    for (const child of index.children.get(parent) || []) {
      candidates.add(child);
      if (index.parents.get(child) === parent) index.parents.delete(child);
    }
  }
  for (const parent of affected) {
    const children =
      parent !== binding.root && parent._item && parent._item.deleted
        ? new Set<YNode>()
        : containerChildren(binding, parent);
    index.children.set(parent, children);
    for (const child of children) {
      const other = index.parents.get(child);
      invariant(
        !other || other === parent,
        '@lexical/y: duplicate node placement',
      );
      index.parents.set(child, parent);
      candidates.add(child);
      discover(child);
    }
  }
  if (invalidated)
    for (const parent of affected) {
      let node: YNode | undefined = parent;
      while (node && !invalidated.has(node)) {
        invalidated.add(node);
        node = index.parents.get(node);
      }
    }
  const reachable = (start: YNode): boolean => {
    const seen = new Set<YNode>();
    let node: YNode | undefined = start;
    while (node && node !== binding.root) {
      if (seen.has(node)) return false;
      seen.add(node);
      if (node._item && node._item.deleted) return false;
      node = index.parents.get(node);
    }
    return node === binding.root;
  };
  for (const start of candidates) {
    const seen = new Set<YNode>();
    let node: YNode | undefined = start;
    while (node && node !== binding.root) {
      if (seen.has(node)) {
        readTopology(binding, undefined, invalidated);
        return;
      }
      seen.add(node);
      node = index.parents.get(node);
    }
  }
  const update = (node: YNode) => {
    const parent = reachable(node) ? index.parents.get(node) : undefined;
    if (parent === binding.parents.get(node)) return;
    if (parent) binding.parents.set(node, parent);
    else binding.parents.delete(node);
    for (const child of index.children.get(node) || []) update(child);
  };
  for (const node of candidates) update(node);
}

/** Build the visible tree before reconciliation, rejecting duplicate/cyclic edges. */
function rebuildTopology(binding: YBinding): void {
  binding.topologyChanged = false;
  binding.parents.clear();
  binding.recovered.clear();
  const stored = getNodeStores(binding.root)
    .flatMap(store => store.toArray() as YNode[])
    .filter(node => node instanceof YNode)
    .sort((a, b) =>
      getNodeID(a) < getNodeID(b) ? -1 : getNodeID(a) > getNodeID(b) ? 1 : 0,
    );
  const edges = new Map<YNode, YNode>();
  for (const parent of [binding.root, ...stored]) {
    for (const child of getChildren(binding, parent)) edges.set(child, parent);
    for (const [key, value] of Object.entries(parent.getAttrs())) {
      const child = key.startsWith('slot:') && getStoredNode(binding, value);
      if (child) edges.set(child, parent);
    }
  }
  // Concurrent reparenting can create a cycle although each local tree was valid.
  // Lift the lexicographically first member of each cycle to the root, without
  // writing repair operations or throwing away the stored content.
  const checked = new Set<YNode>();
  for (const start of stored) {
    const path: YNode[] = [];
    let node: YNode | undefined = start;
    while (node && node !== binding.root && !checked.has(node)) {
      const cycleStart = path.indexOf(node);
      if (cycleStart >= 0) {
        const members = new Set(path.slice(cycleStart));
        const recovered = stored.find(candidate => members.has(candidate))!;
        binding.recovered.add(recovered);
        edges.delete(recovered);
        break;
      }
      path.push(node);
      node = edges.get(node);
    }
    path.forEach(item => checked.add(item));
  }
  const visit = (parent: YNode) => {
    const children = getChildren(binding, parent);
    for (const [key, value] of Object.entries(parent.getAttrs()))
      if (key.startsWith('slot:')) {
        const node = getStoredNode(binding, value);
        if (node && !binding.recovered.has(node)) children.push(node);
      }
    for (const child of children) {
      invariant(
        child !== binding.root && !binding.parents.has(child),
        '@lexical/y: duplicate node placement',
      );
      binding.parents.set(child, parent);
      visit(child);
    }
  };
  visit(binding.root);
}

export function changesTopology(
  binding: YBinding,
  changed: Map<YNode, Set<string | null>>,
): boolean {
  for (const [node, keys] of changed) {
    if (
      (node === binding.root ||
        isNodeStore(binding.root, node) ||
        node.name !== null) &&
      keys.has(null)
    )
      return true;
    for (const key of keys)
      if (key && (key.startsWith(TREE_PREFIX) || key.startsWith('slot:')))
        return true;
  }
  return false;
}
