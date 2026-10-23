/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type {YBinding} from './YBinding';

import {
  ContentFormat,
  ContentString,
  ContentType,
  createID,
  createIdSet,
  createIdSetFromIdMap,
  type DiffRenderer,
  type ID,
  type IdSet,
  Item,
  mergeIdSets,
  Node as YNode,
} from '@y/y';

import {equalValue} from './Schema';
import {getNodeID, isNodeStore} from './Topology';

/** @experimental Integration-specific dependencies between pending review changes. */
export type YSuggestionGrouping = (context: {
  binding: YBinding;
  base: YBinding;
  changes: readonly {
    attribute: string | null;
    created: YNode | null;
    parent: YNode;
    parentIsNew: boolean;
    format: boolean;
  }[];
}) => readonly (readonly number[])[];

export interface YSuggestion {
  /** Stable identity of a connected set of pending CRDT operations. */
  id: string;
  kind: 'text' | 'format' | 'property' | 'structure';
  insertedText: string;
  deletedText: string;
}
export interface SuggestionGroup {
  suggestion: YSuggestion;
  inserts: IdSet;
  deletes: IdSet;
}
interface Part {
  item: Item;
  client: number;
  clock: number;
  length: number;
  insert: boolean;
  remove: boolean;
  parent: YNode;
}

/** Group pending changes with their causal and schema-structural dependencies. */
export function getSuggestionGroups(
  binding: YBinding,
  base: YBinding,
  renderer: DiffRenderer,
): SuggestionGroup[] {
  const inserts = createIdSetFromIdMap(renderer.inserts);
  const deletes = createIdSetFromIdMap(renderer.deletes);
  const parts: Part[] = [];
  const ownedRoots = new Set([binding.root]);
  binding.registerSharedTypeListener(type => ownedRoots.add(type))();
  const owned = (type: YNode): boolean => {
    for (let node: YNode | null = type; node; node = node.parent)
      if (ownedRoots.has(node)) return true;
    return false;
  };
  mergeIdSets([inserts, deletes]).forEach((range, client) => {
    for (let clock = range.clock; clock < range.clock + range.len; ) {
      const item = binding.doc.store.getItem(createID(client, clock));
      const length =
        Math.min(item.id.clock + item.length, range.clock + range.len) - clock;
      if (
        item instanceof Item &&
        item.parent instanceof YNode &&
        owned(item.parent)
      ) {
        parts.push({
          client,
          clock,
          insert: inserts.has(client, clock),
          item,
          length,
          parent: item.parent,
          remove: deletes.has(client, clock),
        });
      }
      clock += length;
    }
  });
  const parents = parts.map((_, i) => i);
  const find = (index: number): number => {
    let root = index;
    while (parents[root] !== root) root = parents[root];
    while (parents[index] !== index) {
      const next = parents[index];
      parents[index] = root;
      index = next;
    }
    return root;
  };
  const join = (a: number, b: number) => {
    parents[find(b)] = find(a);
  };
  const clients = new Map<number, number[]>();
  parts.forEach((part, index) => {
    const indices = clients.get(part.client) || [];
    indices.push(index);
    clients.set(part.client, indices);
  });
  const byID = (id: ID): number => {
    const indices = clients.get(id.client) || [];
    let low = 0;
    let high = indices.length - 1;
    while (low <= high) {
      const middle = (low + high) >>> 1;
      const part = parts[indices[middle]];
      if (id.clock < part.clock) high = middle - 1;
      else if (id.clock >= part.clock + part.length) low = middle + 1;
      else return indices[middle];
    }
    return -1;
  };
  const tags = new Map<string, number>();
  const tag = (i: number, key: string) => {
    const previous = tags.get(key);
    if (previous !== undefined) join(i, previous);
    else tags.set(key, i);
  };
  const typeIDs = new Map<YNode, number>();
  const typeID = (type: YNode): number => {
    let id = typeIDs.get(type);
    if (id === undefined) {
      id = typeIDs.size;
      typeIDs.set(type, id);
    }
    return id;
  };
  const structural = (p: Part) =>
    p.item.content instanceof ContentType ||
    (!!p.item.parentSub && /^(tree:|slot:|shared:)/.test(p.item.parentSub)) ||
    (p.item.parentSub === null &&
      p.parent.name !== null &&
      !(p.item.content instanceof ContentFormat));
  const changes = parts.map(p => ({
    attribute: p.item.parentSub,
    created: p.item.content instanceof ContentType ? p.item.content.type : null,
    format: p.item.content instanceof ContentFormat,
    parent: p.parent,
    parentIsNew:
      !!p.parent._item &&
      (inserts.hasId(p.parent._item.id) || deletes.hasId(p.parent._item.id)),
  }));
  for (const hook of binding.suggestionGroupers) {
    for (const group of hook({base, binding, changes})) {
      const indices = group.filter(
        i => Number.isInteger(i) && i >= 0 && i < parts.length,
      );
      for (const index of indices.slice(1)) join(indices[0], index);
    }
  }
  parts.forEach((p, i) => {
    const {item, parent} = p;
    // A missing parent or sequence origin must be reviewed with its dependent operation.
    for (const id of [
      isNodeStore(binding.root, parent) ? null : item.origin,
      isNodeStore(binding.root, parent) ? null : item.rightOrigin,
      parent._item && parent._item.id,
    ]) {
      if (!id) continue;
      const other = byID(id);
      if (other >= 0) join(i, other);
    }
    if (
      item.content instanceof ContentType &&
      isNodeStore(binding.root, parent)
    )
      tag(i, `storage:node:${getNodeID(item.content.type)}`);
    if (item.parentSub !== null) {
      tag(i, `attribute:${typeID(parent)}:${item.parentSub}`);
      if (/^shared:/.test(item.parentSub)) tag(i, `storage:${item.parentSub}`);
      if (
        item.parentSub === 'tree:placement' &&
        parent._item &&
        isNodeStore(binding.root, parent.parent)
      )
        tag(i, `storage:node:${getNodeID(parent)}`);
    }

    const references = (value: unknown): void => {
      if (!value || typeof value !== 'object' || value instanceof YNode) return;
      if (Array.isArray(value)) {
        value.forEach(references);
        return;
      }
      const record = value as Record<string, unknown>;
      if (typeof record.id === 'string' && typeof record.token === 'string')
        tag(i, `storage:node:${record.id}`);
      if (typeof record.key === 'string' && record.key.startsWith('shared:'))
        tag(i, `storage:${record.key}`);
      if (
        typeof record.client === 'number' &&
        typeof record.clock === 'number'
      ) {
        const dependency = byID(createID(record.client, record.clock));
        if (dependency >= 0 && inserts.has(record.client, record.clock))
          join(i, dependency);
      }
      Object.values(record).forEach(references);
    };
    if (item.content instanceof ContentFormat) references(item.content.value);
    else item.content.getContent().forEach(references);
  });
  // Follow the base and proposed formats in document order. A review run ends
  // when they agree again, even when restoring a non-default base format.
  for (const type of new Set(
    parts
      .filter(p => p.item.content instanceof ContentFormat)
      .map(p => p.parent),
  )) {
    const formats = new Map<
      string,
      {base: unknown; proposed: unknown; open: number}
    >();
    for (let item = type._start; item; item = item.right) {
      if (!(item.content instanceof ContentFormat)) continue;
      const {key, value} = item.content;
      // Boundaries distinguish adjacent Lexical nodes; they are not style runs.
      if (
        key === 'boundary' &&
        type.name === null &&
        type._item &&
        isNodeStore(binding.root, type.parent)
      )
        continue;
      const state = formats.get(key) || {base: null, open: -1, proposed: null};
      const differed = !equalValue(state.base, state.proposed);
      if (!inserts.hasId(item.id) && (!item.deleted || deletes.hasId(item.id)))
        state.base = value;
      if (!item.deleted) state.proposed = value;
      const differs = !equalValue(state.base, state.proposed);
      const index = byID(item.id);
      if (index >= 0 && (differed || differs)) {
        if (state.open >= 0) join(state.open, index);
        else state.open = index;
      }
      if (!differs) state.open = -1;
      formats.set(key, state);
    }
  }
  const grouped = new Map<number, Part[]>();
  parts.forEach((p, i) => {
    const key = find(i);
    const group = grouped.get(key) || [];
    group.push(p);
    grouped.set(key, group);
  });
  return [...grouped.values()]
    .filter(group => group.some(p => (p.insert ? !p.item.deleted : p.remove)))
    .map(group => {
      const inserted = createIdSet();
      const removed = createIdSet();
      let insertedText = '';
      let deletedText = '';
      for (const p of group) {
        if (p.insert) inserted.add(p.client, p.clock, p.length);
        if (p.remove || (p.insert && p.item.deleted))
          removed.add(p.client, p.clock, p.length);
        if (p.item.content instanceof ContentString) {
          const value = p.item.content.str.slice(
            p.clock - p.item.id.clock,
            p.clock - p.item.id.clock + p.length,
          );
          if (p.insert && !p.item.deleted) insertedText += value;
          if (p.remove && !p.insert) deletedText += value;
        }
      }
      const ids = group.map(p => `${p.client}:${p.clock}`).sort();
      const kind = group.some(structural)
        ? 'structure'
        : group.some(p => p.item.parentSub !== null)
          ? 'property'
          : insertedText || deletedText
            ? 'text'
            : 'format';
      return {
        deletes: removed,
        inserts: inserted,
        suggestion: {
          deletedText,
          id: ids[0],
          insertedText,
          kind,
        } as YSuggestion,
      };
    })
    .sort((a, b) => a.suggestion.id.localeCompare(b.suggestion.id));
}
