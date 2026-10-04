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
  $createRangeSelection,
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $setSelection,
  type PointType,
} from 'lexical';

import {$normalizeContent} from './Sync';
import {getChildIndex, getChildren, getParent, getStoredNode} from './Topology';

export interface YSelection {
  anchor: RelativePosition;
  focus: RelativePosition;
  anchorFallback?: RelativePosition[];
  focusFallback?: RelativePosition[];
  format: number;
  style: string;
}

export function isYSelection(value: unknown): value is YSelection {
  if (!value || typeof value !== 'object') return false;
  const selection = value as YSelection;
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

function $pointToRelative(
  binding: YBinding,
  point: PointType,
): RelativePosition | null {
  const type = binding.mapping.types.get(point.key);
  if (!type) return null;
  const mapped = binding.mapping.nodes.get(type);
  if (point.type === 'text' && Array.isArray(mapped)) {
    let index = point.offset;
    for (const n of mapped) {
      if (n.getKey() === point.key)
        return createRelativePositionFromTypeIndex(type, index);
      index += n.getTextContentSize();
    }
  } else if (point.type === 'element') {
    const node = point.getNode();
    if ($isElementNode(node)) {
      let offset = 0;
      let index = 0;
      for (const child of $normalizeContent(node)) {
        const count = Array.isArray(child) ? child.length : 1;
        if (offset + count > point.offset && Array.isArray(child)) {
          const textType = binding.mapping.types.get(child[0].getKey());
          if (textType) {
            const textOffset = child
              .slice(0, point.offset - offset)
              .reduce((n, text) => n + text.getTextContentSize(), 0);
            return createRelativePositionFromTypeIndex(textType, textOffset);
          }
        }
        if (offset >= point.offset) break;
        offset += count;
        index++;
      }
      const child = getChildren(binding, type)[index];
      const rawIndex = child
        ? getChildIndex(binding, type, child)
        : type.length;
      return createRelativePositionFromTypeIndex(
        type,
        rawIndex < 0 ? type.length : rawIndex,
      );
    }
  }
  return null;
}

function $fallbacks(binding: YBinding, point: PointType): RelativePosition[] {
  const positions: RelativePosition[] = [];
  let type = binding.mapping.types.get(point.key);
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

export function $getYSelection(binding: YBinding): YSelection | null {
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
      if (index <= size || i === mapped.length - 1)
        return [node.getKey(), Math.min(index, size), 'text'];
      index -= size;
    }
  } else {
    const node = $getNodeByKey(mapped.getKey());
    if ($isElementNode(node) && node.isAttached()) {
      const offset = absolute.type
        .toArray()
        .slice(0, absolute.index)
        .reduce((sum: number, child: YNode) => {
          const stored = getStoredNode(binding, child);
          const content = stored && binding.mapping.nodes.get(stored);
          return (
            sum + (Array.isArray(content) ? content.length : content ? 1 : 0)
          );
        }, 0);
      return [
        node.getKey(),
        Math.min(offset, node.getChildrenSize()),
        'element',
      ];
    }
  }
  return null;
}

export function $resolveYSelection(
  binding: YBinding,
  value: YSelection,
  followUndoneDeletions = false,
) {
  if (!isYSelection(value)) return null;
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

export function $restoreYSelection(
  binding: YBinding,
  value: YSelection | null,
): void {
  if (value) {
    const selection = $resolveYSelection(binding, value, true);
    if (selection) $setSelection(selection);
  }
}
