/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {ListExtension} from './LexicalListExtension';

import {getPeerDependencyFromEditor} from '@lexical/extension';
import {$firstToLastIterator} from '@lexical/utils';
import {
  $getEditor,
  $setState,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical';

import {
  $createListItemNode,
  $isListItemNode,
  type ListItemNode,
} from './LexicalListItemNode';
import {$isListNode, type ListNode} from './LexicalListNode';
import {$isWrapperListItemNode, listSemanticNestingState} from './utils';

/**
 * Mark every ListNode among `children` with {@link listSemanticNestingState}
 * unconditionally (no wrapper guard — the caller has already established
 * that the lists belong to a row). Used by both HTML import pipelines when
 * an imported li demonstrably renders a row (it carried a checkbox input or
 * aria-checked, which dedicated wrappers never do), so that a row emptied
 * of its inline content is not reclassified as a wrapper and merged away by
 * the normalization.
 *
 * @internal
 */
export function $markNestedListsAsSemantic(
  children: Iterable<LexicalNode>,
): void {
  for (const child of children) {
    if ($isListNode(child)) {
      // Updater form so an already-marked list is not marked dirty again.
      $setState(child, listSemanticNestingState, () => true);
    }
  }
}

/**
 * Clear {@link listSemanticNestingState} from a list. This is the single
 * encoding of the parking policy's flip side: a list moved into a dedicated
 * wrapper item no longer belongs to a row of its own, so its mark must not
 * make the wrapper read as an emptied host row.
 *
 * @internal
 */
export function $clearSemanticNestingMark(listNode: ListNode): void {
  // Updater form so an already-unmarked list is not marked dirty again.
  $setState(listNode, listSemanticNestingState, () => false);
}

/**
 * Move every nested ListNode child of `listItemNode` into a fresh dedicated
 * wrapper item inserted after it, clearing their semantic nesting marks (in
 * a wrapper the lists no longer belong to a row of their own). Returns the
 * wrapper, or `null` when the item holds no nested lists. Shared by the
 * operations that strip an item down to its inline content — converting a
 * host row to another block type, Enter on an emptied row — so the parking
 * policy cannot diverge; it reproduces the default representation's shape,
 * where such lists live in a wrapper li that survives the operation.
 *
 * @internal
 */
export function $parkNestedListsInWrapper(
  listItemNode: ListItemNode,
): ListItemNode | null {
  let wrapper: ListItemNode | null = null;
  // $firstToLastIterator preserves the next sibling before yielding, so
  // reparenting the yielded list is safe (no children array snapshot).
  for (const child of $firstToLastIterator(listItemNode)) {
    if ($isListNode(child)) {
      if (wrapper === null) {
        wrapper = $createListItemNode();
        listItemNode.insertAfter(wrapper);
      }
      $clearSemanticNestingMark(child);
      wrapper.append(child);
    }
  }
  return wrapper;
}

/**
 * Mark the plain (non-checkbox) rows of an imported check list so they render
 * as bare `<li>`s rather than unchecked boxes — the GitHub mixed task-list
 * case, where a single `contains-task-list` holds both `task-list-item` rows
 * and plain items. A task row picked up an explicit checked flag from the
 * checkbox / aria-checked conversion; a plain `<li>` did not, so a top-level
 * row still carrying an undefined checked field is the plain one. Wrappers
 * (which only hold nested lists and render no row) are left alone. Shared by
 * both DOM import pipelines so their check-list normalization cannot diverge.
 * A no-op outside the semantic nesting mode (self-gated so either pipeline can
 * call it unconditionally) — default-mode check-list import is unchanged, and
 * mixed task lists are a semantic-mode feature.
 *
 * @internal
 */
export function $markPlainImportedCheckRows(
  items: ListItemNode[],
  listNode: ListNode,
): void {
  if (listNode.getListType() !== 'check' || !$isListSemanticNestingEnabled()) {
    return;
  }
  for (const item of items) {
    if (
      item.getLatest().__checked === undefined &&
      !$isWrapperListItemNode(item)
    ) {
      item.setListItemPlain(true);
    }
  }
}

/**
 * Whether the `hasSemanticNesting` config of {@link ListExtension} is
 * enabled for the given editor (default: the active editor). Reads the
 * extension's output signal; `false` for editors built without the
 * extension. Used by the DOM import paths to decide which nested list
 * representation to normalize to.
 *
 * @internal
 */
export function $isListSemanticNestingEnabled(
  editor: LexicalEditor = $getEditor(),
): boolean {
  const dep = getPeerDependencyFromEditor<typeof ListExtension>(
    editor,
    '@lexical/list/List',
  );
  return dep !== undefined && dep.output.hasSemanticNesting.peek();
}

/**
 * Mark every nested ListNode child of the item with
 * {@link listSemanticNestingState}. Link-walk rather than getChildren():
 * this runs from the $normalizeSemanticListItem transform on every dirty
 * list item, so no array allocation on that path. The caller must have
 * established that the item is a row of its own (not a wrapper).
 */
function $markNestedListsOfRow(listItemNode: ListItemNode): void {
  for (
    let child = listItemNode.getFirstChild();
    child !== null;
    child = child.getNextSibling()
  ) {
    if ($isListNode(child)) {
      // Updater form so an already-marked list is not marked dirty again.
      $setState(child, listSemanticNestingState, () => true);
    }
  }
}

/**
 * Mark every nested ListNode of the item with
 * {@link listSemanticNestingState}, recording that the lists belong to that
 * item's row. This is what later distinguishes the item — even after its
 * inline content is deleted — from a dedicated wrapper. A no-op for
 * wrapper items: a wrapper's lists must stay unmarked so wrapper chains
 * keep merging.
 *
 * @internal
 */
export function $markSemanticNestedLists(listItemNode: ListItemNode): void {
  if ($isWrapperListItemNode(listItemNode)) {
    return;
  }
  $markNestedListsOfRow(listItemNode);
}

/**
 * Merge the children of a wrapper list item into `previousItem` and remove
 * the wrapper. When the host renders a row of its own (it has inline
 * content, or holds marked lists after its content was deleted), the
 * merged lists are marked as semantically belonging to it; when the host
 * is itself a wrapper (wrapper chains merging toward a host), the marking
 * no-ops so the combined wrapper keeps merging.
 *
 * Shared by the {@link $normalizeSemanticListItem} transform and the HTML
 * import normalization so the merge policy cannot diverge.
 *
 * @internal
 */
export function $mergeWrapperListItemIntoPrevious(
  previousItem: ListItemNode,
  wrapper: ListItemNode,
): void {
  previousItem.append(...wrapper.getChildren());
  wrapper.remove();
  $markSemanticNestedLists(previousItem);
}

/**
 * ListItemNode transform registered by {@link ListExtension} when
 * `hasSemanticNesting` is enabled: merge a wrapper list item (a
 * ListItemNode whose children are all unmarked ListNodes) into the previous
 * sibling item so that the nested list is expressed semantically
 * (`<li>content<ul>…</ul></li>`) rather than through a dedicated `<li>` of
 * its own (`<li>content</li><li><ul>…</ul></li>`), and record the semantic
 * placement of nested lists via {@link $markSemanticNestedLists}. Thanks to
 * that mark, an item whose inline content is deleted keeps its own row and
 * nested list instead of being mistaken for a wrapper.
 *
 * A wrapper is kept as-is when there is no previous sibling to merge into
 * (a list that starts at a deeper indent has no semantic host) or when the
 * previous sibling is an empty item (merging would hide the empty item's
 * marker and leave nowhere visible to type).
 *
 * Registering marks all existing ListItemNodes dirty, so a document loaded
 * in the default representation is converted on the next update.
 *
 * @internal
 */
export function $normalizeSemanticListItem(node: ListItemNode): void {
  if ($isWrapperListItemNode(node)) {
    const previousSibling = node.getPreviousSibling();
    if (
      $isListItemNode(previousSibling) &&
      previousSibling.getChildrenSize() > 0
    ) {
      $mergeWrapperListItemIntoPrevious(previousSibling, node);
    }
  } else if (node.getFirstChild() !== null) {
    // node is not a wrapper (the branch above) but has children, so it is a
    // row of its own — either content-bearing or an emptied host row.
    // The transform only runs on dirty nodes, so also normalize from the
    // other direction: such a row adopts a wrapper that follows it (e.g.
    // typing into the empty item created by splitting a nested list). An
    // emptied host row adopts the same way — the import normalization
    // merges the identical shape, so leaving the wrapper unadopted would
    // make the live state diverge from a round-trip through import.
    const nextSibling = node.getNextSibling();
    if ($isWrapperListItemNode(nextSibling)) {
      // Also marks the adopted (and existing) lists.
      $mergeWrapperListItemIntoPrevious(node, nextSibling);
    } else {
      // node is already known not to be a wrapper here, so mark directly
      // without re-running the wrapper guard $markSemanticNestedLists does.
      $markNestedListsOfRow(node);
    }
  }
}
