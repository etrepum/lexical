/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {YBinding} from './YBinding';

import {
  createAbsolutePositionFromRelativePosition,
  createRelativePositionFromJSON,
  createRelativePositionFromTypeIndex,
  type Node as YNode,
  type RelativePosition,
} from '@y/y';
import {
  $createNodeSelection,
  $createRangeSelection,
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isNodeSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  type BaseSelection,
  type ElementNode,
  type LexicalNode,
  type PointType,
} from 'lexical';

import {$isInlineWrapper} from './Inline';
import {getChildIndex, getParent, getStoredNode} from './Topology';

interface YRangeSelection {
  anchor: RelativePosition;
  focus: RelativePosition;
  anchorFallback?: RelativePosition[];
  focusFallback?: RelativePosition[];
  format: number;
  style: string;
}

function isRangeData(value: unknown): value is YRangeSelection {
  if (!value || typeof value !== 'object') return false;
  const selection = value as YRangeSelection;
  return (
    Number.isInteger(selection.format) &&
    typeof selection.style === 'string' &&
    (selection.anchorFallback === undefined ||
      (Array.isArray(selection.anchorFallback) &&
        selection.anchorFallback.every(isRelativePosition))) &&
    (selection.focusFallback === undefined ||
      (Array.isArray(selection.focusFallback) &&
        selection.focusFallback.every(isRelativePosition))) &&
    isRelativePosition(selection.anchor) &&
    isRelativePosition(selection.focus)
  );
}

export function isRelativePosition(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const position = value as RelativePosition;
  const isID = (id: RelativePosition['item']) =>
    id == null ||
    (Number.isSafeInteger(id.client) &&
      id.client >= 0 &&
      Number.isSafeInteger(id.clock) &&
      id.clock >= 0);
  return (
    (position.type != null ||
      position.item != null ||
      position.tname != null) &&
    isID(position.type) &&
    isID(position.item) &&
    (position.tname == null || typeof position.tname === 'string') &&
    (position.assoc == null || Number.isSafeInteger(position.assoc))
  );
}

function $mappedEdge(
  binding: YBinding,
  node: LexicalNode | null,
  end: boolean,
): LexicalNode | null {
  if (!node) return null;
  if (binding.mapping.types.has(node.getKey())) return node;
  if ($isInlineWrapper(node, binding)) {
    const children = node.getChildren();
    if (end) children.reverse();
    for (const child of children) {
      const edge = $mappedEdge(binding, child, end);
      if (edge) return edge;
    }
  }
  return null;
}

function $leafToRelative(
  binding: YBinding,
  node: LexicalNode,
  offset: number,
): RelativePosition | null {
  const type = binding.mapping.types.get(node.getKey());
  const mapped = type && binding.mapping.nodes.get(type);
  if (!type || !Array.isArray(mapped)) return null;
  let index = offset;
  for (const leaf of mapped) {
    if (leaf.getKey() === node.getKey())
      return createRelativePositionFromTypeIndex(type, index);
    index += leaf.getTextContentSize();
  }
  return null;
}

function $elementToRelative(
  binding: YBinding,
  node: ElementNode,
  offset: number,
): RelativePosition | null {
  const children = node.getChildren();
  const after = children
    .slice(offset)
    .map(child => $mappedEdge(binding, child, false))
    .find(child => child !== null);
  const before = children
    .slice(0, offset)
    .reverse()
    .map(child => $mappedEdge(binding, child, true))
    .find(child => child !== null);
  for (const [edge, end] of [
    [after, false],
    [before, true],
  ] as const) {
    if (!edge) continue;
    const relative = $leafToRelative(
      binding,
      edge,
      end ? edge.getTextContentSize() : 0,
    );
    if (relative) return relative;
    const type = binding.mapping.types.get(edge.getKey());
    const parent = type && getParent(binding, type);
    if (type && parent) {
      const index = getChildIndex(binding, parent, type);
      if (index >= 0)
        return createRelativePositionFromTypeIndex(
          parent,
          index + (end ? 1 : 0),
        );
    }
  }
  const type = binding.mapping.types.get(node.getKey());
  if (type)
    return createRelativePositionFromTypeIndex(
      type,
      offset === 0 ? 0 : type.length,
    );
  const parent = node.getParent();
  return parent
    ? $elementToRelative(
        binding,
        parent,
        node.getIndexWithinParent() + (offset === 0 ? 0 : 1),
      )
    : null;
}

function $pointToRelative(
  binding: YBinding,
  point: PointType,
): RelativePosition | null {
  const node = point.getNode();
  return point.type === 'text'
    ? $leafToRelative(binding, node, point.offset)
    : $isElementNode(node)
      ? $elementToRelative(binding, node, point.offset)
      : null;
}

function $fallbacks(binding: YBinding, point: PointType): RelativePosition[] {
  const positions: RelativePosition[] = [];
  let node: LexicalNode | null = point.getNode();
  const edge = $mappedEdge(binding, node, false);
  let type = binding.mapping.types.get(edge ? edge.getKey() : point.key);
  while (!type && node) {
    node = node.getParent();
    type = node ? binding.mapping.types.get(node.getKey()) : undefined;
  }
  while (type && type !== binding.root) {
    const parent = getParent(binding, type);
    if (!parent) break;
    const index = getChildIndex(binding, parent, type);
    positions.push(
      createRelativePositionFromTypeIndex(parent, Math.max(0, index)),
    );
    type = parent;
  }
  return positions;
}

function $getRangeSelection(binding: YBinding): YRangeSelection | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return null;
  const anchor = $pointToRelative(binding, selection.anchor);
  const focus = $pointToRelative(binding, selection.focus);
  return anchor && focus
    ? {
        anchor,
        anchorFallback: $fallbacks(binding, selection.anchor),
        focus,
        focusFallback: $fallbacks(binding, selection.focus),
        format: selection.format,
        style: selection.style,
      }
    : null;
}

function isInRoot(type: YNode, root: YNode): boolean {
  for (let current: YNode | null = type; current; current = current.parent)
    if (current === root) return true;
  return false;
}

function $resolvePoint(
  binding: YBinding,
  relative: RelativePosition,
  followUndoneDeletions: boolean,
): [string, number, 'text' | 'element'] | null {
  const absolute = createAbsolutePositionFromRelativePosition(
    createRelativePositionFromJSON(relative),
    binding.doc,
    followUndoneDeletions,
  );
  if (!absolute || !isInRoot(absolute.type, binding.root)) return null;
  const mapped = binding.mapping.nodes.get(absolute.type);
  if (!mapped) return null;
  if (Array.isArray(mapped)) {
    let index = absolute.index;
    for (let i = 0; i < mapped.length; i++) {
      const node = $getNodeByKey(mapped[i].getKey());
      if (!node || !node.isAttached()) continue;
      const size = node.getTextContentSize();
      if (index <= size || i === mapped.length - 1) {
        if ($isTextNode(node))
          return [node.getKey(), Math.min(index, size), 'text'];
        const parent = node.getParent();
        return parent
          ? [
              parent.getKey(),
              node.getIndexWithinParent() + (index === 0 ? 0 : 1),
              'element',
            ]
          : null;
      }
      index -= size;
    }
  } else {
    const node = $getNodeByKey(mapped.getKey());
    if ($isElementNode(node) && node.isAttached()) {
      const children = absolute.type.toArray();
      // A text run can contain several wrappers and leaves. Count its direct
      // Lexical children, rather than treating every leaf as a child here.
      const edge = (value: unknown, end: boolean): LexicalNode | null => {
        const stored = getStoredNode(binding, value);
        const content = stored && binding.mapping.nodes.get(stored);
        const parts = Array.isArray(content)
          ? [...content]
          : content
            ? [content]
            : [];
        if (end) parts.reverse();
        for (const part of parts) {
          let child = $getNodeByKey(part.getKey());
          while (child) {
            const parent = child.getParent();
            if (parent && parent.getKey() === node.getKey()) break;
            child = parent;
          }
          if (child && child.isAttached()) return child;
        }
        return null;
      };
      for (let i = absolute.index - 1; i >= 0; i--) {
        const child = edge(children[i], true);
        if (child)
          return [node.getKey(), child.getIndexWithinParent() + 1, 'element'];
      }
      for (let i = absolute.index; i < children.length; i++) {
        const child = edge(children[i], false);
        if (child)
          return [node.getKey(), child.getIndexWithinParent(), 'element'];
      }
      return [node.getKey(), 0, 'element'];
    }
  }
  return null;
}

function $resolveRangeSelection(
  binding: YBinding,
  value: YRangeSelection,
  followUndoneDeletions = false,
) {
  if (!isRangeData(value)) return null;
  const resolve = (
    position: RelativePosition,
    fallback: RelativePosition[] = [],
  ) => {
    for (const candidate of [position, ...fallback]) {
      const point = $resolvePoint(binding, candidate, followUndoneDeletions);
      if (point) return point;
    }
    return null;
  };
  const anchor = resolve(value.anchor, value.anchorFallback);
  const focus = resolve(value.focus, value.focusFallback);
  if (!anchor || !focus) return null;
  const selection = $createRangeSelection();
  selection.anchor.set(...anchor);
  selection.focus.set(...focus);
  selection.format = value.format;
  selection.style = value.style;
  return selection;
}

/** Transport envelope shared by awareness and history; codecs validate their payloads. */
export interface YSelection {
  kind: string;
  data: unknown;
  fallback?: YRangeSelection;
}
export interface YSelectionCodec {
  kind: string;
  getNodesForHighlight?(selection: BaseSelection): LexicalNode[];
  encode(binding: YBinding, selection: BaseSelection): unknown | null;
  resolve(
    binding: YBinding,
    data: unknown,
    followUndoneDeletions: boolean,
  ): BaseSelection | null;
}
export interface YNodeReference {
  /** Stable root-store key, independent of each editor's Lexical keys. */
  id: string;
  start?: RelativePosition;
  end?: RelativePosition;
}
export function isYSelection(value: unknown): value is YSelection {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as YSelection).kind === 'string' &&
    'data' in value
  );
}
export function isYNodeReference(value: unknown): value is YNodeReference {
  if (!value || typeof value !== 'object') return false;
  const ref = value as YNodeReference;
  return (
    typeof ref.id === 'string' &&
    (ref.id === 'root' || ref.id.startsWith('tree:node:')) &&
    (ref.start === undefined || isRelativePosition(ref.start)) &&
    (ref.end === undefined || isRelativePosition(ref.end))
  );
}
export function $getYNodeReference(
  binding: YBinding,
  node: LexicalNode,
): YNodeReference | null {
  const type = binding.mapping.types.get(node.getKey());
  if (!type) return null;
  if (type === binding.root) return {id: 'root'};
  const id = type._item && type._item.parentSub;
  if (typeof id !== 'string' || !id.startsWith('tree:node:')) return null;
  const mapped = binding.mapping.nodes.get(type);
  if (!Array.isArray(mapped)) return {id};
  let offset = 0;
  for (const part of mapped) {
    if (part.getKey() === node.getKey())
      return {
        end: createRelativePositionFromTypeIndex(
          type,
          offset + part.getTextContentSize(),
        ),
        id,
        start: createRelativePositionFromTypeIndex(type, offset),
      };
    offset += part.getTextContentSize();
  }
  return null;
}
export function $resolveYNodeReference(
  binding: YBinding,
  value: YNodeReference,
  followUndoneDeletions = false,
): LexicalNode[] {
  if (!isYNodeReference(value)) return [];
  const type =
    value.id === 'root' ? binding.root : binding.root.getAttr(value.id);
  const mapped = type && binding.mapping.nodes.get(type);
  if (!mapped) return [];
  if (!Array.isArray(mapped)) {
    const node = $getNodeByKey(mapped.getKey());
    return node && node.isAttached() ? [node] : [];
  }
  if (!value.start || !value.end) return [];
  const start = createAbsolutePositionFromRelativePosition(
    createRelativePositionFromJSON(value.start),
    binding.doc,
    followUndoneDeletions,
  );
  const end = createAbsolutePositionFromRelativePosition(
    createRelativePositionFromJSON(value.end),
    binding.doc,
    followUndoneDeletions,
  );
  if (!start || !end || start.type !== type || end.type !== type) return [];
  if (start.index === end.index) return [];
  let offset = 0;
  return mapped.flatMap(part => {
    const node = $getNodeByKey(part.getKey());
    const next = offset + part.getTextContentSize();
    const selected =
      node && node.isAttached() && offset < end.index && next > start.index;
    offset = next;
    return selected ? [node!] : [];
  });
}
export function registerYSelectionCodec(
  binding: YBinding,
  codec: YSelectionCodec,
): () => void {
  if (
    codec.kind === 'range' ||
    codec.kind === 'node' ||
    binding.selectionCodecs.has(codec.kind)
  )
    throw new Error('@lexical/y: duplicate or reserved selection codec');
  binding.selectionCodecs.set(codec.kind, codec);
  return () => {
    binding.selectionCodecs.delete(codec.kind);
  };
}
function $selectionFallback(
  binding: YBinding,
  selection: BaseSelection,
): YRangeSelection | undefined {
  const first = selection.getNodes()[0];
  const parent = first && first.getParent();
  if (!parent) return undefined;
  const range = $createRangeSelection();
  range.anchor.set(parent.getKey(), first.getIndexWithinParent(), 'element');
  const point = $pointToRelative(binding, range.anchor);
  if (!point) return undefined;
  const fallback = $fallbacks(binding, range.anchor);
  return {
    anchor: point,
    anchorFallback: fallback,
    focus: point,
    focusFallback: fallback,
    format: 0,
    style: '',
  };
}
export function $getYSelection(binding: YBinding): YSelection | null {
  const selection = $getSelection();
  if (!selection) return null;
  if ($isRangeSelection(selection)) {
    const data = $getRangeSelection(binding);
    return data && {data, kind: 'range'};
  }
  if ($isNodeSelection(selection)) {
    const nodes = selection.getNodes().flatMap(node => {
      const ref = $getYNodeReference(binding, node);
      return ref ? [ref] : [];
    });
    return {
      data: nodes,
      fallback: $selectionFallback(binding, selection),
      kind: 'node',
    };
  }
  for (const codec of binding.selectionCodecs.values()) {
    const data = codec.encode(binding, selection);
    if (data !== null)
      return {
        data,
        fallback: $selectionFallback(binding, selection),
        kind: codec.kind,
      };
  }
  return null;
}
export function $resolveYSelection(
  binding: YBinding,
  value: YSelection,
  followUndoneDeletions = false,
): BaseSelection | null {
  if (!isYSelection(value)) return null;
  if (value.kind === 'range')
    return $resolveRangeSelection(
      binding,
      value.data as YRangeSelection,
      followUndoneDeletions,
    );
  if (value.kind === 'node') {
    if (!Array.isArray(value.data) || !value.data.every(isYNodeReference))
      return null;
    const selection = $createNodeSelection();
    for (const ref of value.data)
      for (const node of $resolveYNodeReference(
        binding,
        ref,
        followUndoneDeletions,
      ))
        selection.add(node.getKey());
    return selection.getNodes().length ? selection : null;
  }
  const codec = binding.selectionCodecs.get(value.kind);
  return codec
    ? codec.resolve(binding, value.data, followUndoneDeletions)
    : null;
}

export function $restoreYSelection(
  binding: YBinding,
  value: YSelection | null,
): void {
  if (value) {
    const selection = $resolveYSelection(binding, value, true);
    if (selection) $setSelection(selection);
    else if (value.kind !== 'range') {
      const fallback =
        (value.fallback &&
          $resolveRangeSelection(binding, value.fallback, true)) ||
        $createRangeSelection();
      $setSelection(fallback);
    }
  }
}
