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
  const tableOf = (type: YNode): string | null => {
    for (const owner of [binding, base]) {
      const key = type._item && type._item.parentSub;
      let node =
        owner === binding
          ? type
          : typeof key === 'string'
            ? owner.root.getAttr(key)
            : null;
      const seen = new Set<YNode>();
      while (node instanceof YNode && !seen.has(node)) {
        if (node.name === 'table')
          return String(node._item && node._item.parentSub);
        seen.add(node);
        node = owner.parents.get(node);
      }
    }
    return null;
  };
  const tables = parts.map(p =>
    tableOf(
      p.item.content instanceof ContentType ? p.item.content.type : p.parent,
    ),
  );
  const structuralTables = new Set(
    parts.flatMap((p, i) =>
      tables[i] &&
      (structural(p) ||
        p.item.parentSub === 'p:colSpan' ||
        p.item.parentSub === 'p:rowSpan')
        ? [tables[i]!]
        : [],
    ),
  );
  parts.forEach((p, i) => {
    const {item, parent} = p;
    // A missing parent or sequence origin must be reviewed with its dependent operation.
    for (const id of [
      item.origin,
      item.rightOrigin,
      parent._item && parent._item.id,
    ]) {
      if (!id) continue;
      const other = byID(id);
      if (other >= 0) join(i, other);
    }
    if (item.parentSub !== null) {
      tag(i, `attribute:${typeID(parent)}:${item.parentSub}`);
      if (/^(tree:node:|shared:)/.test(item.parentSub))
        tag(i, `storage:${item.parentSub}`);
      if (
        item.parentSub === 'tree:placement' &&
        parent._item &&
        parent._item.parentSub
      )
        tag(i, `storage:${parent._item.parentSub}`);
    }

    if (tables[i] && structuralTables.has(tables[i]!))
      tag(i, `table:${tables[i]}`);
    const references = (value: unknown): void => {
      if (!value || typeof value !== 'object' || value instanceof YNode) return;
      if (Array.isArray(value)) {
        value.forEach(references);
        return;
      }
      const record = value as Record<string, unknown>;
      if (typeof record.id === 'string' && typeof record.token === 'string')
        tag(i, `storage:tree:node:${record.id}`);
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
  // Pair boundaries per formatting run rather than merging every edit in a text node.
  for (const type of new Set(
    parts
      .filter(p => p.item.content instanceof ContentFormat)
      .map(p => p.parent),
  )) {
    const opened = new Map<string, number>();
    for (let item = type._start; item; item = item.right) {
      if (!(item.content instanceof ContentFormat)) continue;
      const index = byID(item.id);
      if (index < 0) continue;
      const {key, value} = item.content;
      const previous = opened.get(key);
      if (previous !== undefined) {
        join(previous, index);
        opened.delete(key);
      } else if (value !== null) opened.set(key, index);
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
    .map(group => {
      const inserted = createIdSet();
      const removed = createIdSet();
      let insertedText = '';
      let deletedText = '';
      for (const p of group) {
        if (p.insert) inserted.add(p.client, p.clock, p.length);
        if (p.remove) removed.add(p.client, p.clock, p.length);
        if (p.item.content instanceof ContentString) {
          const value = p.item.content.str.slice(
            p.clock - p.item.id.clock,
            p.clock - p.item.id.clock + p.length,
          );
          if (p.insert && !p.item.deleted) insertedText += value;
          if (p.remove) deletedText += value;
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
