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
  type TextFormatType,
} from 'lexical';

import {$isReviewCardNode} from './ReviewCardNode';

// A compact, readable tree view of the editor state — far easier to scan than
// the raw serialized JSON, and it surfaces the two things the JSON buries: the
// ReviewCard's named slots (which live in a separate channel, not `children`)
// and its `rating` NodeState. Everything here is plain Lexical read inside an
// `editor.read`, so it stays framework-agnostic (no `@jsxImportSource` pragma).

const FORMATS: readonly TextFormatType[] = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'code',
];

const INDENT = '  ';

function $describeNode(node: LexicalNode): string {
  if ($isTextNode(node)) {
    const active = FORMATS.filter(format => node.hasFormat(format));
    const suffix = active.length > 0 ? ` [${active.join(', ')}]` : '';
    return `${node.getType()} ${JSON.stringify(node.getTextContent())}${suffix}`;
  }
  if ($isReviewCardNode(node)) {
    const rating = node.getRating();
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    return `${node.getType()} (rating ${stars})`;
  }
  return node.getType();
}

function $walk(node: LexicalNode, depth: number, lines: string[]): void {
  lines.push(INDENT.repeat(depth) + $describeNode(node));

  // Named slots ride a separate channel from the linked-list children, so walk
  // them explicitly — this is what the raw JSON hides under `$slots`.
  if ($isSlotHost(node)) {
    for (const name of $getSlotNames(node)) {
      const value = $getSlot(node, name);
      if (value !== null) {
        lines.push(`${INDENT.repeat(depth + 1)}▸ slot: ${name}`);
        $walk(value, depth + 2, lines);
      }
    }
  }

  if ($isElementNode(node)) {
    for (const child of node.getChildren()) {
      $walk(child, depth + 1, lines);
    }
  }
}

function $describeSelection(): string {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    const {anchor, focus} = selection;
    return `selection: range ${anchor.key}:${anchor.offset} → ${focus.key}:${focus.offset}`;
  }
  if ($isNodeSelection(selection)) {
    return `selection: nodes [${selection
      .getNodes()
      .map(node => node.getKey())
      .join(', ')}]`;
  }
  return 'selection: none';
}

/**
 * Render the current editor state as an indented tree string. Call inside an
 * `editor.read` (e.g. through the `useEditorRead` bridge).
 */
export function $renderEditorTree(): string {
  const lines: string[] = [];
  $walk($getRoot(), 0, lines);
  lines.push('', $describeSelection());
  return lines.join('\n');
}
