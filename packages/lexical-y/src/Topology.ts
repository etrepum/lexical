/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {YBinding} from './YBinding';

import invariant from '@lexical/internal/invariant';
import {Node as YNode} from '@y/y';
import {uuidv4} from 'lib0/random';

export const TREE_PREFIX = 'tree:';
const NODE_PREFIX = 'tree:node:';
const PLACEMENT = 'tree:placement';
export interface Placement {
  id: string;
  token: string;
}

export function getStoredNode(binding: YBinding, value: unknown): YNode | null {
  if (!value || typeof value !== 'object') return null;
  const {id, token} = value as Placement;
  if (typeof id !== 'string' || typeof token !== 'string') return null;
  const node = binding.root.getAttr(NODE_PREFIX + id);
  return node instanceof YNode && node.getAttr(PLACEMENT) === token
    ? node
    : null;
}

export function placeNode(binding: YBinding, node: YNode): Placement {
  binding.topologyChanged = true;
  if (!node.doc) binding.root.setAttr(NODE_PREFIX + uuidv4(), node);
  const key = node._item && node._item.parentSub;
  invariant(
    typeof key === 'string' && key.startsWith(NODE_PREFIX),
    '@lexical/y: document nodes must belong to the node store',
  );
  const token = uuidv4();
  node.setAttr(PLACEMENT, token);
  return {id: key.slice(NODE_PREFIX.length), token};
}

/** Delete locally removed nodes, letting Yjs own undo retention and collection.
 * Only compare the local edit's previous projection: sweeping all unreachable
 * nodes could delete content whose placement is still arriving from a peer.
 */
export function deleteRemovedNodes(
  binding: YBinding,
  previous: ReadonlySet<YNode>,
): void {
  for (const node of previous) {
    if (!binding.parents.has(node)) {
      const key = node._item && node._item.parentSub;
      if (typeof key === 'string' && binding.root.getAttr(key) === node)
        binding.root.deleteAttr(key);
    }
  }
}

/** A single winning placement per node makes concurrent moves deterministic. */
export function getChildren(binding: YBinding, parent: YNode): YNode[] {
  if (parent !== binding.root && parent.name === null) return [];
  const children = parent.toArray().flatMap(value => {
    const node = getStoredNode(binding, value);
    return node && !binding.recovered.has(node) ? [node] : [];
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

/** Build the visible tree before reconciliation, rejecting duplicate/cyclic edges. */
export function readTopology(binding: YBinding): void {
  binding.topologyChanged = false;
  binding.parents.clear();
  binding.recovered.clear();
  const stored = Object.entries(binding.root.getAttrs())
    .filter(
      ([key, value]) => key.startsWith(NODE_PREFIX) && value instanceof YNode,
    )
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([, value]) => value as YNode);
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
    if ((node === binding.root || node.name !== null) && keys.has(null))
      return true;
    for (const key of keys)
      if (key && (key.startsWith(TREE_PREFIX) || key.startsWith('slot:')))
        return true;
  }
  return false;
}
