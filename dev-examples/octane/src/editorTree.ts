/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $getRoot,
  $getSelection,
  $getSlot,
  $getSlotNames,
  $isElementNode,
  $isNodeSelection,
  $isRangeSelection,
  $isSlotHost,
  $isTextNode,
  type LexicalNode,
  type NodeKey,
  type TextFormatType,
} from 'lexical';

import {$isReviewCardNode} from './ReviewCardNode';

// A compact, readable tree view of the editor state — far easier to scan than
// the raw serialized JSON. It surfaces the two things the JSON buries (the
// ReviewCard's named slots, which live in a separate channel from `children`,
// and its `rating` NodeState) and marks the selection *in place* on the nodes it
// lands on, so "which nodes are selected" is answerable without correlating
// opaque node keys. Everything here is plain Lexical read inside an
// `editor.read`, so it stays framework-agnostic (no `@jsxImportSource` pragma).

const FORMATS: readonly TextFormatType[] = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'code',
];

const INDENT = '  ';

// Cap text content so a long run doesn't push the line (and its selection
// marker) off the right edge of the panel.
const MAX_TEXT = 56;

function truncate(text: string): string {
  return text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT - 1)}…` : text;
}

// A flattened view of the current selection, keyed so `$walk` can annotate each
// node as it prints it.
interface SelectionView {
  anchorKey?: NodeKey;
  anchorOffset?: number;
  focusKey?: NodeKey;
  focusOffset?: number;
  collapsed?: boolean;
  // Keys of a NodeSelection's nodes.
  nodeKeys?: ReadonlySet<NodeKey>;
}

function $selectionView(): SelectionView | null {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    return {
      anchorKey: selection.anchor.key,
      anchorOffset: selection.anchor.offset,
      collapsed: selection.isCollapsed(),
      focusKey: selection.focus.key,
      focusOffset: selection.focus.offset,
    };
  }
  if ($isNodeSelection(selection)) {
    return {nodeKeys: new Set(selection.getNodes().map(node => node.getKey()))};
  }
  return null;
}

// The marker to append to a node's line given the current selection, or ''.
function selectionMarker(key: NodeKey, view: SelectionView | null): string {
  if (view === null) {
    return '';
  }
  if (view.nodeKeys) {
    return view.nodeKeys.has(key) ? '  ◀ selected' : '';
  }
  const marks: string[] = [];
  if (key === view.anchorKey) {
    marks.push(
      view.collapsed
        ? `caret @${view.anchorOffset}`
        : `anchor @${view.anchorOffset}`,
    );
  }
  // Skip the focus mark when it coincides with a collapsed caret.
  if (key === view.focusKey && !(view.collapsed && key === view.anchorKey)) {
    marks.push(`focus @${view.focusOffset}`);
  }
  return marks.length > 0 ? `  ◀ ${marks.join(', ')}` : '';
}

function $describeNode(node: LexicalNode): string {
  if ($isTextNode(node)) {
    const active = FORMATS.filter(format => node.hasFormat(format));
    const suffix = active.length > 0 ? ` [${active.join(', ')}]` : '';
    return `${node.getType()} ${JSON.stringify(truncate(node.getTextContent()))}${suffix}`;
  }
  if ($isReviewCardNode(node)) {
    const rating = node.getRating();
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    return `${node.getType()} (rating ${stars})`;
  }
  return node.getType();
}

function $walk(
  node: LexicalNode,
  depth: number,
  lines: string[],
  view: SelectionView | null,
): void {
  lines.push(
    INDENT.repeat(depth) +
      $describeNode(node) +
      selectionMarker(node.getKey(), view),
  );

  // Named slots ride a separate channel from the linked-list children, so walk
  // them explicitly — this is what the raw JSON hides under `$slots`.
  if ($isSlotHost(node)) {
    for (const name of $getSlotNames(node)) {
      const value = $getSlot(node, name);
      if (value !== null) {
        lines.push(`${INDENT.repeat(depth + 1)}▸ slot: ${name}`);
        $walk(value, depth + 2, lines, view);
      }
    }
  }

  if ($isElementNode(node)) {
    for (const child of node.getChildren()) {
      $walk(child, depth + 1, lines, view);
    }
  }
}

/**
 * Render the current editor state as an indented tree string, with the
 * selection marked on the nodes it touches. Call inside an `editor.read` (e.g.
 * through the `useEditorRead` bridge).
 */
export function $renderEditorTree(): string {
  const view = $selectionView();
  const lines: string[] = [];
  $walk($getRoot(), 0, lines, view);
  if (view === null) {
    lines.push('', 'selection: none');
  }
  return lines.join('\n');
}
