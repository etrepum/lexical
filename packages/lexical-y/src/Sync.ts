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
import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $getSlot,
  $getSlotNames,
  $isElementNode,
  $isRangeSelection,
  $isSlotHost,
  $isTextNode,
  $removeSlot,
  $setSlot,
  type ElementNode,
  type LexicalNode,
  type TextNode,
} from 'lexical';
import * as delta from 'lib0/delta';

import {type Content} from './Mapping';
import {
  $applyAttributes,
  $attributesFromNode,
  $createNode,
  type Attributes,
  equalValue,
  SLOT_PREFIX,
} from './Schema';
import {decodeAttributes, encodeAttributes, SHARED_PREFIX} from './SharedTypes';
import simpleDiffWithCursor from './simpleDiffWithCursor';
import {getChildren, getStoredNode, placeNode, TREE_PREFIX} from './Topology';

export function $normalizeContent(node: LexicalNode): Content[] {
  const content: Content[] = [];
  if ($isElementNode(node)) {
    for (const child of node.getChildren()) {
      const last = content[content.length - 1];
      if ($isTextNode(child)) {
        if (Array.isArray(last)) last.push(child);
        else content.push([child]);
      } else content.push(child);
    }
  }
  return content;
}

function sameContent(a: Content | undefined, b: Content): boolean {
  if (a === b) return true;
  if (!a) return false;
  const aa = Array.isArray(a) ? a : [a];
  const bb = Array.isArray(b) ? b : [b];
  return (
    aa.length === bb.length && aa.every((n, i) => n.getKey() === bb[i].getKey())
  );
}

function matches(type: YNode, content: Content): boolean {
  return type.name === (Array.isArray(content) ? null : content.getType());
}

function $createType(content: Content): YNode {
  const type = new YNode(Array.isArray(content) ? null : content.getType());
  // Integrate before reading it. Unintegrated Yjs nodes only queue writes.
  return type;
}

export function $writeText(
  type: YNode,
  nodes: TextNode[],
  binding: YBinding,
): void {
  const previous = readText(type);
  const str = previous.map(part => part.text).join('');
  const next = nodes.map(n => n.getTextContent()).join('');
  let cursor = next.length;
  const selection = $getSelection();
  if ($isRangeSelection(selection) && selection.isCollapsed()) {
    let offset = 0;
    for (const node of nodes) {
      if (node.getKey() === selection.anchor.key) {
        cursor = offset + selection.anchor.offset;
        break;
      }
      offset += node.getTextContentSize();
    }
  }
  const diff = simpleDiffWithCursor(str, next, cursor);
  if (diff.remove) type.delete(diff.index, diff.remove);
  if (diff.insert) type.insert(diff.index, diff.insert);
  const clear: Record<string, null> = {};
  for (const part of readText(type))
    for (const key of Object.keys(part.formats)) clear[key] = null;
  let offset = 0;
  nodes.forEach((node, index) => {
    const attrs = encodeAttributes(
      binding,
      node.getKey(),
      $attributesFromNode(node),
    );
    const formats: Attributes = {
      ...clear,
      boundary: index,
      type: node.getType(),
    };
    // A null format removes a mark. Wrapping JSON values preserves a real
    // null (as well as arrays and objects) without string serialization.
    for (const [key, value] of Object.entries(attrs)) formats[key] = [value];
    type.format(offset, node.getTextContentSize(), formats);
    offset += node.getTextContentSize();
  });
  binding.mapping.set(type, nodes);
}

export function readText(type: YNode): {text: string; formats: Attributes}[] {
  const result: {text: string; formats: Attributes}[] = [];
  for (const op of type.toDelta().children) {
    invariant(
      delta.$textOp.check(op),
      '@lexical/y: a text run must contain only text',
    );
    result.push({formats: op.format ?? {}, text: op.insert});
  }
  return result;
}

function $writeContent(
  type: YNode,
  content: Content,
  binding: YBinding,
  dirty?: Set<string>,
): void {
  if (
    dirty &&
    sameContent(binding.mapping.nodes.get(type), content) &&
    (Array.isArray(content)
      ? content.every(node => !dirty.has(node.getKey()))
      : !dirty.has(content.getKey()))
  )
    return;
  if (Array.isArray(content)) $writeText(type, content, binding);
  else $writeElement(type, content, binding, dirty);
}

export function $writeElement(
  type: YNode,
  node: LexicalNode,
  binding: YBinding,
  dirty?: Set<string>,
): void {
  const attrs = encodeAttributes(
    binding,
    node.getKey(),
    $attributesFromNode(node),
  );
  const oldAttrs = binding.getAttributes(type);
  for (const [key, value] of Object.entries(attrs)) {
    if (!equalValue(oldAttrs[key], value)) type.setAttr(key, value);
  }
  for (const key of Object.keys(oldAttrs)) {
    if (
      !key.startsWith(TREE_PREFIX) &&
      !key.startsWith(SLOT_PREFIX) &&
      !key.startsWith(SHARED_PREFIX) &&
      !(key in attrs)
    )
      type.deleteAttr(key);
  }
  const names = new Set($getSlotNames(node));
  for (const name of names) {
    const child = $getSlot(node, name)!;
    const oldSlot = getStoredNode(binding, type.getAttr(SLOT_PREFIX + name));
    let slot = binding.mapping.types.get(child.getKey());
    if (!slot || slot.name !== child.getType())
      slot = new YNode(child.getType());
    if (slot !== oldSlot)
      type.setAttr(SLOT_PREFIX + name, placeNode(binding, slot));
    binding.parents.set(slot, type);
    $writeContent(slot, child, binding, dirty);
  }
  for (const key of Object.keys(oldAttrs)) {
    if (
      key.startsWith(SLOT_PREFIX) &&
      !names.has(key.slice(SLOT_PREFIX.length))
    ) {
      type.deleteAttr(key);
      binding.topologyChanged = true;
    }
  }
  const children = $normalizeContent(node);
  const old = getChildren(binding, type);
  // Resolve by Lexical identity. A moved node keeps its stored Y.Node and text.
  const used = new Set<YNode>();
  const next = children.map((content, i) => {
    const first = Array.isArray(content) ? content[0] : content;
    const mapped = binding.mapping.types.get(first.getKey());
    const empty = old[i];
    const candidate =
      mapped && matches(mapped, content) && !used.has(mapped)
        ? mapped
        : Array.isArray(content) &&
            empty &&
            empty.name === null &&
            empty.length === 0 &&
            !used.has(empty)
          ? empty
          : $createType(content);
    used.add(candidate);
    return candidate;
  });
  for (const previous of old) {
    if (binding.recovered.has(previous) && !next.includes(previous)) {
      previous.deleteAttr('tree:placement');
      binding.topologyChanged = true;
    }
  }
  // An empty text run remains available for concurrent insertions.
  if (next.length === 0 && old.length === 1 && old[0].name === null) {
    old[0].delete(0, old[0].length);
    binding.mapping.set(old[0], []);
  } else {
    if (next.length !== old.length || next.some((child, i) => child !== old[i]))
      binding.topologyChanged = true;
    let index = 0;
    for (const child of next) {
      const values = type.toArray();
      if (getStoredNode(binding, values[index]) !== child) {
        const later = values.findIndex(
          (value, i) => i >= index && getStoredNode(binding, value) === child,
        );
        if (
          later >= 0 &&
          values
            .slice(index, later)
            .every(
              value =>
                !next.slice(index + 1).includes(getStoredNode(binding, value)!),
            )
        ) {
          type.delete(index, later - index);
        } else {
          if (later >= 0) type.delete(later, 1);
          type.insert(index, [placeNode(binding, child)]);
        }
      }
      binding.parents.set(child, type);
      index++;
    }
    if (type.length > index) type.delete(index, type.length - index);
    next.forEach((child, i) =>
      $writeContent(child, children[i], binding, dirty),
    );
  }
  const cached = {...attrs};
  for (const name of names)
    cached[SLOT_PREFIX + name] = type.getAttr(SLOT_PREFIX + name);
  binding.cacheAttributes(type, cached);
  binding.mapping.set(type, node.getLatest());
}

function $readText(
  type: YNode,
  binding: YBinding,
  changed?: ReadonlySet<YNode>,
): TextNode[] {
  const mapped = binding.mapping.nodes.get(type);
  if (changed && !changed.has(type) && Array.isArray(mapped))
    return mapped.map(node => node.getLatest());
  const parts = readText(type);
  const previous = binding.mapping.nodes.get(type);
  const nodes: TextNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    const {text, formats} = parts[i];
    const name = typeof formats.type === 'string' ? formats.type : 'text';
    const old = Array.isArray(previous) ? previous[i] : undefined;
    let node = old && $getNodeByKey(old.getKey());
    if (!node || node.getType() !== name)
      node = $createNode(binding.editor, name);
    invariant(
      $isTextNode(node),
      '@lexical/y: text run type %s must be a TextNode',
      name,
    );
    const attrs: Attributes = {};
    for (const [key, value] of Object.entries(formats)) {
      if (Array.isArray(value) && value.length === 1) attrs[key] = value[0];
    }
    const decoded = decodeAttributes(binding, node.getKey(), attrs);
    if (
      !equalValue($attributesFromNode(node), decoded) ||
      node.getTextContent() !== text
    )
      $applyAttributes(node, decoded, text);
    nodes.push(node.getLatest());
  }
  binding.mapping.set(type, nodes);
  return nodes;
}

export function $readElement(
  type: YNode,
  binding: YBinding,
  changed?: ReadonlySet<YNode>,
): LexicalNode {
  const prev = binding.mapping.nodes.get(type);
  let node =
    type === binding.root
      ? $getRoot()
      : prev && !Array.isArray(prev)
        ? $getNodeByKey(prev.getKey())
        : null;
  if (node && changed && !changed.has(type)) return node;
  if (!node) {
    invariant(
      typeof type.name === 'string',
      '@lexical/y: element must have a node type',
    );
    node = $createNode(binding.editor, type.name);
  }
  const attrs = binding.getAttributes(type);
  const properties = decodeAttributes(binding, node.getKey(), attrs);
  if (!equalValue($attributesFromNode(node), properties))
    $applyAttributes(node, properties);
  if ($isElementNode(node)) {
    const children: LexicalNode[] = [];
    for (const child of getChildren(binding, type)) {
      invariant(
        child instanceof YNode,
        '@lexical/y: element children must be Y.Node instances',
      );
      if (child.name === null)
        children.push(...$readText(child, binding, changed));
      else children.push($readElement(child, binding, changed));
    }
    $spliceChildren(node, children);
  }
  const names = new Set<string>();
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith(SLOT_PREFIX)) {
      const name = key.slice(SLOT_PREFIX.length);
      const slot = getStoredNode(binding, value);
      if (!slot || binding.recovered.has(slot)) continue;
      const child = $readElement(slot, binding, changed);
      names.add(name);
      const previous = $getSlot(node, name);
      if (!previous || previous.getKey() !== child.getKey()) {
        invariant($isSlotHost(node), '@lexical/y: slots require a slot host');
        $setSlot(node, name, child);
      }
    }
  }
  for (const name of $getSlotNames(node))
    if (!names.has(name)) {
      invariant($isSlotHost(node), '@lexical/y: slots require a slot host');
      $removeSlot(node, name);
    }
  binding.mapping.set(type, node.getLatest());
  return node;
}

function $spliceChildren(node: ElementNode, next: LexicalNode[]): void {
  // Leave an unchanged prefix/suffix attached, including the local selection.
  const prev = node.getChildren();
  let left = 0;
  let right = 0;
  while (
    left < Math.min(prev.length, next.length) &&
    prev[left].getKey() === next[left].getKey()
  )
    left++;
  while (
    left + right < Math.min(prev.length, next.length) &&
    prev[prev.length - right - 1].getKey() ===
      next[next.length - right - 1].getKey()
  )
    right++;
  if (left + right !== prev.length || left + right !== next.length) {
    node.splice(
      left,
      prev.length - left - right,
      next.slice(left, next.length - right),
    );
  }
}
