/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Slot-host navigation/deletion helpers, adapted from the Lexical playground.
// They give a slot host (here, the ReviewCard DecoratorNode) usable editing UX:
// ArrowUp/Down escape a slot's shadow-root boundary, Backspace removes an empty
// host, and inserts land at the nearest root. Nothing here is Octane-specific —
// it is plain Lexical, so the compiler skips it (no `@jsxImportSource` pragma).

import {
  $insertNodeToNearestRoot,
  $isAtEndOfNode,
  $isAtStartOfNode,
} from '@lexical/utils';
import {
  $createParagraphNode,
  $getSelection,
  $getSlot,
  $getSlotHost,
  $getSlotNames,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  COMMAND_PRIORITY_BEFORE_EDITOR,
  COMMAND_PRIORITY_LOW,
  isModifierMatch,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  type LexicalEditor,
  type LexicalNode,
  mergeRegister,
  type RangeSelection,
} from 'lexical';

// Find the slot host that contains `start`. The caret may be in the host's
// regular children — getParent reaches the host — or in a named slot, where
// slot values have `__parent === null`, so walk to the slot value and resolve
// its host with $getSlotHost.
export function $findSlotHost<T extends LexicalNode>(
  start: LexicalNode,
  $isHost: (node: LexicalNode | null | undefined) => node is T,
): T | null {
  let cur: LexicalNode | null = start;
  while (cur !== null) {
    if ($isHost(cur)) {
      return cur;
    }
    const parent: LexicalNode | null = cur.getParent();
    if (parent === null) {
      const host = $getSlotHost(cur);
      return host !== null && $isHost(host) ? host : null;
    }
    cur = parent;
  }
  return null;
}

// A navigable region of a host: a named slot value, or the host's children as a
// unit. `startNode` is where the caret enters from above; `endNode`'s end is the
// region's bottom edge.
interface Region {
  startNode: LexicalNode;
  endNode: LexicalNode;
  isChildren: boolean;
}

// Whether DOM element `a` precedes `b` in document order.
function isBefore(a: HTMLElement, b: HTMLElement): boolean {
  return (
    (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
  );
}

// The host's regions in rendered (visual) order, read from the actual document
// position rather than assuming a fixed slot-vs-children layout.
function $orderedRegions(editor: LexicalEditor, host: LexicalNode): Region[] {
  const regions: Region[] = [];
  if ($isElementNode(host)) {
    const first = host.getFirstChild();
    const last = host.getLastChild();
    if (first !== null && last !== null) {
      regions.push({endNode: last, isChildren: true, startNode: first});
    }
  }
  for (const name of $getSlotNames(host)) {
    const value = $getSlot(host, name);
    if (value !== null) {
      regions.push({endNode: value, isChildren: false, startNode: value});
    }
  }
  return regions.sort((a, b) => {
    const aDom = editor.getElementByKey(a.startNode.getKey());
    const bDom = editor.getElementByKey(b.startNode.getKey());
    if (aDom === null || bDom === null) {
      return 0;
    }
    return isBefore(aDom, bDom) ? -1 : 1;
  });
}

// Whether `anchorNode` sits within `region`.
function $regionContains(
  region: Region,
  anchorNode: LexicalNode,
  host: LexicalNode,
): boolean {
  if (region.isChildren) {
    for (
      let b: LexicalNode | null = anchorNode;
      b !== null;
      b = b.getParent()
    ) {
      if (b.getParent() === host) {
        return true;
      }
    }
    return false;
  }
  const value = region.startNode;
  return (
    value === anchorNode ||
    ($isElementNode(value) && value.isParentOf(anchorNode))
  );
}

// The contentEditable editing host of a node's rendered element. Two regions
// wrapped in their own contentEditable=true islands under a
// contentEditable=false shell are an island boundary the browser may not cross.
function $editingHost(
  editor: LexicalEditor,
  node: LexicalNode,
): Element | null {
  const dom = editor.getElementByKey(node.getKey());
  return dom === null ? null : dom.closest('[contenteditable="true"]');
}

function $handleSlotHostArrow<T extends LexicalNode>(
  editor: LexicalEditor,
  $isHost: (node: LexicalNode | null | undefined) => node is T,
  event: KeyboardEvent | null,
  down: boolean,
): boolean {
  if (event !== null && !isModifierMatch(event, {})) {
    return false;
  }
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return false;
  }
  const anchor = selection.anchor;
  const host = $findSlotHost(anchor.getNode(), $isHost);
  if (host === null) {
    return false;
  }
  const regions = $orderedRegions(editor, host);
  const index = regions.findIndex(r =>
    $regionContains(r, anchor.getNode(), host),
  );
  if (index === -1) {
    return false;
  }
  const region = regions[index];
  const edgeNode = down ? region.endNode : region.startNode;
  if (!$isElementNode(edgeNode)) {
    return false;
  }
  if (
    down
      ? !$isAtEndOfNode(anchor, edgeNode)
      : !$isAtStartOfNode(anchor, edgeNode)
  ) {
    return false;
  }
  const adjacent = regions[index + (down ? 1 : -1)];
  if (adjacent !== undefined) {
    const from = $editingHost(editor, edgeNode);
    const to = $editingHost(
      editor,
      down ? adjacent.startNode : adjacent.endNode,
    );
    if (from === null || to === null || from === to) {
      return false;
    }
    if (down) {
      adjacent.startNode.selectStart();
    } else {
      adjacent.endNode.selectEnd();
    }
    if (event) {
      event.preventDefault();
    }
    return true;
  }
  // No adjacent region: the caret is at the very bottom/top of the host. Insert
  // a paragraph only when the host is the last/first block.
  if ((down ? host.getNextSibling() : host.getPreviousSibling()) !== null) {
    return false;
  }
  const paragraph = $createParagraphNode();
  if (down) {
    host.insertAfter(paragraph);
  } else {
    host.insertBefore(paragraph);
  }
  paragraph.selectEnd();
  if (event) {
    event.preventDefault();
  }
  return true;
}

/**
 * Step the caret between a slot host's regions at their shared edge, and insert
 * a paragraph before/after the host when the caret is at the very top/bottom of
 * a first/last-block host so the host is never a navigational dead end.
 */
export function registerSlotHostArrowEscape<T extends LexicalNode>(
  editor: LexicalEditor,
  $isHost: (node: LexicalNode | null | undefined) => node is T,
): () => void {
  return mergeRegister(
    editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      event => $handleSlotHostArrow(editor, $isHost, event, true),
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      event => $handleSlotHostArrow(editor, $isHost, event, false),
      COMMAND_PRIORITY_LOW,
    ),
  );
}

/**
 * Whether a slot host has no text in its children or in any of its named slots.
 * A host with other meaningful state (e.g. the ReviewCard's rating) composes an
 * extra check on top of this.
 */
export function $isSlotHostTextEmpty(host: LexicalNode): boolean {
  if ($isElementNode(host) && host.getTextContentSize() !== 0) {
    return false;
  }
  for (const name of $getSlotNames(host)) {
    const value = $getSlot(host, name);
    if ($isElementNode(value) && value.getTextContentSize() !== 0) {
      return false;
    }
  }
  return true;
}

// Remove an empty host and put the caret where it was: at the end of the
// previous block, else the start of the next, else in a fresh paragraph that
// replaces it (the document always needs at least one block).
function $deleteEmptyHost(host: LexicalNode): void {
  const prev = host.getPreviousSibling();
  if ($isElementNode(prev)) {
    host.remove();
    prev.selectEnd();
    return;
  }
  const next = host.getNextSibling();
  if ($isElementNode(next)) {
    host.remove();
    next.selectStart();
    return;
  }
  host.replace($createParagraphNode()).selectStart();
}

// A non-collapsed selection whose start sits at a host's content start and whose
// end is outside the host — e.g. a document-wide select-all of a first-block
// host — should replace the whole host with a paragraph rather than clearing
// only its contents. Move that start point to just before the host so the host
// itself falls in the deleted range.
function $reanchorRangeBeforeHost<T extends LexicalNode>(
  selection: RangeSelection,
  $isHost: (node: LexicalNode | null | undefined) => node is T,
): void {
  const backward = selection.isBackward();
  const start = backward ? selection.focus : selection.anchor;
  const end = backward ? selection.anchor : selection.focus;
  const host = $findSlotHost(start.getNode(), $isHost);
  if (host === null || $findSlotHost(end.getNode(), $isHost) === host) {
    return;
  }
  const parent = host.getParent();
  if (
    parent !== null &&
    $isElementNode(host) &&
    $isAtStartOfNode(start, host)
  ) {
    start.set(parent.getKey(), host.getIndexWithinParent(), 'element');
  }
}

/**
 * Delete a slot host from a range or its edges:
 *
 * - A non-collapsed selection that starts at the host's content and extends out
 *   of it replaces the whole host with a paragraph.
 * - On Backspace, a collapsed caret at the start of an *empty* host's first
 *   region escapes the host by deleting it.
 *
 * A non-empty host is otherwise left to the default handler, so the slots'
 * shadow-root boundary still protects their content.
 */
export function registerSlotHostBackspace<T extends LexicalNode>(
  editor: LexicalEditor,
  $isHost: (node: LexicalNode | null | undefined) => node is T,
  $isEmpty: (host: T) => boolean,
): () => void {
  return mergeRegister(
    editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      event => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }
        if (!selection.isCollapsed()) {
          $reanchorRangeBeforeHost(selection, $isHost);
          return false;
        }
        const anchor = selection.anchor;
        const inner = $findSlotHost(anchor.getNode(), $isHost);
        if (inner === null) {
          return false;
        }
        const first = $orderedRegions(editor, inner)[0];
        if (
          first !== undefined &&
          $isElementNode(first.startNode) &&
          $isAtStartOfNode(anchor, first.startNode) &&
          $isEmpty(inner)
        ) {
          $deleteEmptyHost(inner);
          if (event) {
            event.preventDefault();
          }
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_BEFORE_EDITOR,
    ),
    editor.registerCommand(
      KEY_DELETE_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          $reanchorRangeBeforeHost(selection, $isHost);
        }
        return false;
      },
      COMMAND_PRIORITY_BEFORE_EDITOR,
    ),
  );
}

/**
 * Insert a slot host at the nearest root for an INSERT_* command, dropping the
 * empty paragraph `$insertNodeToNearestRoot` leaves before the host (from the
 * block split) so inserting from an empty line seeds no stray blank line above.
 */
export function $insertSlotHostAtRoot<T extends LexicalNode>(node: T): T {
  $insertNodeToNearestRoot(node);
  const before = node.getPreviousSibling();
  if ($isParagraphNode(before) && before.getTextContentSize() === 0) {
    before.remove();
  }
  return node.getLatest();
}
