/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {LexicalNode} from '../LexicalNode';
import type {ElementNode} from '../nodes/LexicalElementNode';
import type {CaretDirection, SiblingCaret} from './LexicalCaret';

import invariant from '@lexical/internal/invariant';

import {$isElementNode, $isTextNode} from '../index';
import {
  $getSelection,
  $isRangeSelection,
  $selectionTouchesElement,
  $updateElementSelectionOnCreateDeleteNode,
  type PointType,
  type RangeSelection,
} from '../LexicalSelection';
import {
  $errorOnSlotCycleChild,
  $getSlotHost,
  $getSlotHostKey,
} from '../LexicalSlot';
import {errorOnReadOnly} from '../LexicalUpdates';
import {errorOnInsertTextNodeOnRoot} from '../LexicalUtils';

/**
 * Connect the two sides of a child-list gap. Null denotes the parent's
 * first/last boundary. Callers own the parent/size updates and must pass
 * writable nodes, obtained through getWritable for copy-on-write and dirtying.
 */
export function $linkSiblings(
  writableParent: ElementNode,
  writablePrevious: LexicalNode | null,
  writableNext: LexicalNode | null,
): void {
  const previousKey = writablePrevious === null ? null : writablePrevious.__key;
  const nextKey = writableNext === null ? null : writableNext.__key;
  if (writablePrevious === null) {
    writableParent.__first = nextKey;
  } else {
    writablePrevious.__next = nextKey;
  }
  if (writableNext === null) {
    writableParent.__last = previousKey;
  } else {
    writableNext.__prev = previousKey;
  }
}

/**
 * Detach a child and optionally repair element offsets in its old parent.
 * Return points that were immediately after the child, before that repair;
 * insertAfter uses them to follow the moved node to its new parent (#6031).
 */
export function $detachNode(
  node: LexicalNode,
  selection: RangeSelection | null = null,
): PointType[] | null {
  invariant(
    $getSlotHostKey(node) === null,
    '$removeFromParent: node %s is slotted into host %s; a slotted node and a child are mutually exclusive. Remove it from its slot first.',
    node.__key,
    String($getSlotHostKey(node)),
  );
  const parent = node.getParent();
  let points: PointType[] | null = null;
  if (parent !== null) {
    // Avoid a sibling walk when no element point can observe the index.
    // This keeps bulk moves linear when the selection is elsewhere (#5194).
    const index =
      selection && $selectionTouchesElement(selection, parent)
        ? node.getIndexWithinParent()
        : -1;
    if (selection && index !== -1) {
      points = [selection.anchor, selection.focus].filter(
        point =>
          point.type === 'element' &&
          point.key === parent.__key &&
          point.offset === index + 1,
      );
    }
    const writableNode = node.getWritable();
    const writableParent = parent.getWritable();
    const previous = node.getPreviousSibling();
    const next = node.getNextSibling();
    $linkSiblings(
      writableParent,
      previous && previous.getWritable(),
      next && next.getWritable(),
    );
    writableNode.__prev = null;
    writableNode.__next = null;
    writableNode.__parent = null;
    writableParent.__size--;
    if (selection && index !== -1) {
      $updateElementSelectionOnCreateDeleteNode(selection, parent, index, -1);
    }
  }
  return points;
}

/**
 * Shared insertion in a sibling caret direction, without allocating a caret
 * in the base node methods. Public carets still dispatch through those methods
 * so subclass overrides run.
 */
export function $insertSibling(
  origin: LexicalNode,
  direction: CaretDirection,
  node: LexicalNode,
  restoreSelection: boolean,
): LexicalNode {
  errorOnReadOnly();
  const isNext = direction === 'next';
  errorOnInsertTextNodeOnRoot(origin, node);
  const writableOrigin = origin.getWritable();
  const writableNode = node.getWritable();
  $errorOnSlotCycleChild(origin.getParentOrThrow(), writableNode);
  const currentSelection = $getSelection();
  const selection =
    restoreSelection && $isRangeSelection(currentSelection)
      ? currentSelection
      : null;
  const points = $detachNode(writableNode, selection);
  const parent = origin.getParentOrThrow().getWritable();
  // Before insertion this is the new node's index in either direction.
  const index =
    selection &&
    ((isNext && points !== null && points.length > 0) ||
      $selectionTouchesElement(selection, parent))
      ? origin.getIndexWithinParent() + (isNext ? 1 : 0)
      : -1;
  const sibling = isNext
    ? origin.getNextSibling()
    : origin.getPreviousSibling();
  const writableSibling = sibling && sibling.getWritable();
  $linkSiblings(
    parent,
    isNext ? writableOrigin : writableSibling,
    writableNode,
  );
  $linkSiblings(
    parent,
    writableNode,
    isNext ? writableSibling : writableOrigin,
  );
  writableNode.__parent = parent.__key;
  parent.__size++;
  if (selection && index !== -1) {
    $updateElementSelectionOnCreateDeleteNode(selection, parent, index);
    if (isNext && points !== null) {
      for (const point of points) {
        point.set(parent.__key, index + 1, 'element');
      }
    }
  }
  return node;
}

/**
 * Select the sibling at this caret, preserving the node methods' placement
 * rules for text, elements, decorators and slot roots.
 * @internal
 */
export function $selectAdjacentNode(
  caret: SiblingCaret,
  anchorOffset?: number,
  focusOffset?: number,
): RangeSelection {
  errorOnReadOnly();
  const {origin, direction} = caret;
  const isNext = direction === 'next';
  // Slot roots have no linked-list parent. Delegate through the host's public
  // method so custom selection behavior is preserved there too.
  const slotHost = $getSlotHost(origin);
  if (slotHost !== null) {
    return isNext
      ? slotHost.selectNext(anchorOffset, focusOffset)
      : slotHost.selectPrevious(anchorOffset, focusOffset);
  }
  const sibling = caret.getNodeAtCaret();
  const parent = origin.getParentOrThrow();
  if (sibling === null) {
    return isNext ? parent.select() : parent.select(0, 0);
  }
  if ($isElementNode(sibling)) {
    return isNext ? sibling.select(0, 0) : sibling.select();
  }
  if ($isTextNode(sibling)) {
    return sibling.select(anchorOffset, focusOffset);
  }
  const index = sibling.getIndexWithinParent() + (isNext ? 0 : 1);
  return parent.select(index, index);
}
