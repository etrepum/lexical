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
  $isLineBreakNode,
  $isRangeSelection,
  $isSlotHost,
  $isTextNode,
  $removeSlot,
  $setSlot,
  type ElementNode,
  getComposedSchemaFields,
  type LexicalNode,
  LineBreakNode,
} from 'lexical';
import * as delta from 'lib0/delta';
import {uuidv4} from 'lib0/random';

import {
  $inlineFormats,
  $isInlineWrapper,
  $readInlineChildren,
  INLINE_PREFIX,
  type InlineContent,
  isInlineFormatKey,
} from './Inline';
import {type Content, type TextLeaf} from './Mapping';
import {
  $isOpaqueNode,
  $readOpaqueNode,
  containsUnknownType,
  hasUnknownType,
  preserveOpaqueChildren,
} from './Opaque';
import {
  $applyAttributes,
  $attributesFromNode,
  $createNode,
  type Attributes,
  equalValue,
  SLOT_PREFIX,
} from './Schema';
import {decodeAttributes, encodeAttributes} from './SharedTypes';
import simpleDiffWithCursor from './simpleDiffWithCursor';
import {
  decodeTextFormats,
  encodeTextFormats,
  isTextFormatKey,
} from './TextFormats';
import {getChildren, getStoredNode, placeNode} from './Topology';

export function $normalizeContent(
  node: LexicalNode,
  binding?: YBinding,
): Content[] {
  const content: Content[] = [];
  const append = (child: LexicalNode) => {
    if ($isInlineWrapper(child, binding)) {
      child.getChildren().forEach(append);
      return;
    }
    const last = content[content.length - 1];
    if ($isTextNode(child) || $isLineBreakNode(child)) {
      if (Array.isArray(last)) last.push(child);
      else content.push([child]);
    } else content.push(child);
  };
  if ($isElementNode(node)) node.getChildren().forEach(append);
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
  return !Array.isArray(content) && $isOpaqueNode(content)
    ? true
    : type.name === (Array.isArray(content) ? null : content.getType());
}

function $createType(content: Content): YNode {
  const type = new YNode(Array.isArray(content) ? null : content.getType());
  // Integrate before reading it. Unintegrated Yjs nodes only queue writes.
  return type;
}

export function $writeText(
  type: YNode,
  nodes: TextLeaf[],
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
  const mapped = binding.mapping.nodes.get(type);
  const boundaries = new Map<string, unknown>();
  if (Array.isArray(mapped)) {
    let position = 0;
    let partStart = 0;
    let index = 0;
    for (const node of mapped) {
      while (
        index < previous.length &&
        position >= partStart + previous[index].text.length
      ) {
        partStart += previous[index++].text.length;
      }
      const boundary = previous[index] && previous[index].formats.boundary;
      if (boundary !== undefined) boundaries.set(node.getKey(), boundary);
      // Mapping holds the previous immutable leaves. getLatest() would read
      // new lengths and shift boundaries when an earlier leaf was edited.
      position += $isTextNode(node) ? node.__text.length : 1;
    }
  }
  const propertyKeys = new Set<string>();
  const desired = nodes.map(node => {
    const entry = binding.editor._nodes.get(node.getType())!;
    for (const key of Object.keys(getComposedSchemaFields(entry.klass)))
      propertyKeys.add('p:' + key);
    const attrs = {
      ...encodeTextFormats(
        encodeAttributes(binding, node.getKey(), $attributesFromNode(node)),
      ),
      ...$inlineFormats(node, binding),
    };
    const formats: Attributes = {type: node.getType()};
    // Token and explicitly unmergeable nodes need stable separators even when
    // their schema fields agree. Normal text can merge without ordinal markers.
    if (
      $isTextNode(node) &&
      (node.getMode() !== 'normal' || node.isUnmergeable())
    ) {
      formats.boundary = boundaries.get(node.getKey()) ?? uuidv4();
    }
    // Null removes a format. Wrapping preserves real nulls and JSON values.
    for (const [key, value] of Object.entries(attrs)) formats[key] = [value];
    return {formats, text: node.getTextContent()};
  });
  const owns = (key: string) =>
    key === 'type' ||
    key === 'boundary' ||
    key.startsWith('s:') ||
    key.startsWith('ref:s:') ||
    propertyKeys.has(key.startsWith('ref:') ? key.slice(4) : key) ||
    isTextFormatKey(key) ||
    isInlineFormatKey(key, binding);
  if (diff.remove) type.delete(diff.index, diff.remove);
  // Insert with the final formats. Inheriting and then formatting the new text
  // leaves restore markers that can resurrect a concurrently changed value.
  if (diff.insert) {
    let offset = 0;
    for (const part of desired) {
      const start = Math.max(offset, diff.index);
      const end = Math.min(
        offset + part.text.length,
        diff.index + diff.insert.length,
      );
      if (start < end)
        type.insert(
          start,
          part.text.slice(start - offset, end - offset),
          part.formats,
        );
      offset += part.text.length;
    }
  }
  // Re-applying equal Yjs formats replaces boundary items and can spread stale
  // values over a peer's concurrent edits. Only write keys/ranges that differ.
  const current = readText(type);
  let ci = 0;
  let di = 0;
  let co = 0;
  let dO = 0;
  let offset = 0;
  while (ci < current.length && di < desired.length) {
    const c = current[ci];
    const d = desired[di];
    const length = Math.min(c.text.length - co, d.text.length - dO);
    const changed: Attributes = {};
    for (const key of Object.keys(c.formats))
      if (owns(key) && !(key in d.formats)) changed[key] = null;
    for (const [key, value] of Object.entries(d.formats))
      if (!equalValue(c.formats[key], value)) changed[key] = value;
    if (length > 0 && Object.keys(changed).length)
      type.format(offset, length, changed);
    offset += length;
    co += length;
    dO += length;
    if (co === c.text.length) {
      ci++;
      co = 0;
    }
    if (dO === d.text.length) {
      di++;
      dO = 0;
    }
  }
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

function hasDirtyWrapper(
  node: LexicalNode,
  dirty: Set<string>,
  binding: YBinding,
): boolean {
  let parent = node.getParent();
  while (parent && $isInlineWrapper(parent, binding)) {
    if (dirty.has(parent.getKey())) return true;
    parent = parent.getParent();
  }
  return false;
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
      ? content.every(
          node =>
            !dirty.has(node.getKey()) && !hasDirtyWrapper(node, dirty, binding),
        )
      : !dirty.has(content.getKey()) &&
        !hasDirtyWrapper(content, dirty, binding))
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
  // A placeholder has no authority to rewrite an unavailable node's schema,
  // descendants, shared references, or text formatting.
  if ($isOpaqueNode(node)) return;
  const attrs = {
    ...encodeAttributes(binding, node.getKey(), $attributesFromNode(node)),
    ...$inlineFormats(node, binding),
  };
  const oldAttrs = binding.getAttributes(type);
  const fields = getComposedSchemaFields(
    binding.editor._nodes.get(node.getType())!.klass,
  );
  const owns = (key: string) => {
    const property = key.startsWith('ref:') ? key.slice(4) : key;
    return (
      property.startsWith('s:') ||
      (property.startsWith('p:') &&
        Object.prototype.hasOwnProperty.call(fields, property.slice(2))) ||
      isInlineFormatKey(key, binding)
    );
  };
  for (const [key, value] of Object.entries(attrs)) {
    if (!equalValue(oldAttrs[key], value)) type.setAttr(key, value);
  }
  for (const key of Object.keys(oldAttrs)) {
    if (owns(key) && !(key in attrs)) type.deleteAttr(key);
  }
  const names = new Set($getSlotNames(node));
  for (const name of names) {
    const child = $getSlot(node, name)!;
    const oldSlot = getStoredNode(binding, type.getAttr(SLOT_PREFIX + name));
    let slot = binding.mapping.types.get(child.getKey());
    if (oldSlot && slot !== oldSlot && containsUnknownType(oldSlot, binding)) {
      binding.restoreOpaque = true;
      continue;
    }
    if (!slot || (!$isOpaqueNode(child) && slot.name !== child.getType()))
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
      const slot = getStoredNode(binding, oldAttrs[key]);
      if (slot && containsUnknownType(slot, binding)) {
        names.add(key.slice(SLOT_PREFIX.length));
        binding.restoreOpaque = true;
        continue;
      }
      type.deleteAttr(key);
      binding.topologyChanged = true;
    }
  }
  const children = $normalizeContent(node, binding);
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
  const contentByType = new Map(next.map((child, i) => [child, children[i]]));
  preserveOpaqueChildren(old, next, binding);
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
    // Stored children in sequence order, kept in step with type's edits.
    const stored = type.toArray().map(value => getStoredNode(binding, value));
    const nextIndex = new Map(next.map((child, i) => [child, i]));
    for (const child of next) {
      if (stored[index] !== child) {
        const later = stored.indexOf(child, index);
        if (
          later >= 0 &&
          stored
            .slice(index, later)
            .every(value => !value || (nextIndex.get(value) ?? -1) <= index)
        ) {
          type.delete(index, later - index);
          stored.splice(index, later - index);
        } else {
          if (later >= 0) {
            type.delete(later, 1);
            stored.splice(later, 1);
          }
          type.insert(index, [placeNode(binding, child)]);
          stored.splice(index, 0, child);
        }
      }
      binding.parents.set(child, type);
      index++;
    }
    if (type.length > index) type.delete(index, type.length - index);
    next.forEach(child => {
      const content = contentByType.get(child);
      if (content) $writeContent(child, content, binding, dirty);
    });
  }
  const cached = {
    ...Object.fromEntries(
      Object.entries(oldAttrs).filter(
        ([key]) => !owns(key) && !key.startsWith(SLOT_PREFIX),
      ),
    ),
    ...attrs,
  };
  for (const name of names)
    cached[SLOT_PREFIX + name] = type.getAttr(SLOT_PREFIX + name);
  binding.cacheAttributes(type, cached);
  binding.mapping.set(type, node.getLatest());
}

function $readText(
  type: YNode,
  binding: YBinding,
  changed?: ReadonlySet<YNode>,
): InlineContent[] {
  if (hasUnknownType(type, binding))
    return [{attributes: {}, node: $readOpaqueNode(type, binding)}];
  const parts = readText(type).flatMap(part => {
    const entry =
      typeof part.formats.type === 'string' &&
      binding.editor._nodes.get(part.formats.type);
    return entry &&
      (entry.klass === LineBreakNode ||
        entry.klass.prototype instanceof LineBreakNode)
      ? Array.from(part.text, text => ({formats: part.formats, text}))
      : [part];
  });
  const previous = binding.mapping.nodes.get(type);
  const nodes: TextLeaf[] = [];
  const content: InlineContent[] = [];
  for (let i = 0; i < parts.length; i++) {
    const {text, formats} = parts[i];
    const name = typeof formats.type === 'string' ? formats.type : 'text';
    const old = Array.isArray(previous) ? previous[i] : undefined;
    let node = old && $getNodeByKey(old.getKey());
    if (!node || node.getType() !== name)
      node = $createNode(binding.editor, name);
    invariant(
      $isTextNode(node) || $isLineBreakNode(node),
      '@lexical/y: text run type %s must be text or a line break',
      name,
    );
    const attrs: Attributes = {};
    for (const [key, value] of Object.entries(formats))
      if (Array.isArray(value) && value.length === 1) attrs[key] = value[0];
    const schemaAttrs = Object.fromEntries(
      Object.entries(attrs).filter(([key]) => !key.startsWith(INLINE_PREFIX)),
    );
    const attributes = decodeAttributes(binding, node.getKey(), schemaAttrs);
    const decoded = $isTextNode(node)
      ? decodeTextFormats(attributes)
      : attributes;
    if (
      !equalValue($attributesFromNode(node), decoded) ||
      node.getTextContent() !== text
    )
      $applyAttributes(node, decoded, $isTextNode(node) ? text : undefined);
    nodes.push(node.getLatest());
    content.push({attributes: attrs, node: node.getLatest()});
  }
  binding.mapping.set(type, nodes);
  return content;
}

export function $readElement(
  type: YNode,
  binding: YBinding,
  changed?: ReadonlySet<YNode>,
): LexicalNode {
  if (type !== binding.root && hasUnknownType(type, binding))
    return $readOpaqueNode(type, binding);
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
    const children: InlineContent[] = [];
    for (const child of getChildren(binding, type)) {
      invariant(
        child instanceof YNode,
        '@lexical/y: element children must be Y.Node instances',
      );
      if (child.name === null)
        children.push(...$readText(child, binding, changed));
      else
        children.push({
          attributes: binding.getAttributes(child),
          node: $readElement(child, binding, changed),
        });
    }
    $spliceChildren(node, $readInlineChildren(children, binding));
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
