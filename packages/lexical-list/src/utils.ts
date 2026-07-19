/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import invariant from '@lexical/internal/invariant';
import {
  $copyNode,
  $findMatchingParent,
  $getState,
  $isElementNode,
  $setState,
  createState,
  type ElementNode,
  type LexicalNode,
  type Spread,
} from 'lexical';

import {
  $isListItemNode,
  $isListNode,
  type ListItemNode,
  type ListNode,
} from './';

/**
 * NodeState for a nested ListNode recording that it is semantically part of
 * its parent ListItemNode (`<li>content<ul>…</ul></li>`) rather than the
 * content of a dedicated wrapper item (`<li><ul>…</ul></li>`). This is what
 * disambiguates a wrapper from a real item whose inline content was deleted
 * — the two are structurally identical.
 *
 * Only meaningful for a ListNode whose parent is a ListItemNode; it is never
 * consulted elsewhere. Set by the semantic nesting normalization (see the
 * `hasSemanticNesting` config of `ListExtension`) whenever a nested list
 * sits in an item that renders content of its own. `resetOnCopyNode` keeps
 * copies made by the indent/split machinery (which host lists in wrapper
 * items) unmarked; the normalization re-marks copies that land next to
 * content, and split operations that keep a list in its row use
 * {@link $copySemanticNestingMark} to carry the mark explicitly.
 *
 * @experimental
 */
export const listSemanticNestingState = /* @__PURE__ */ createState(
  'listSemanticNesting',
  {
    parse: v => v === true,
    resetOnCopyNode: true,
  },
);

/**
 * NodeState marking a ListItemNode that lives in a check list yet renders as a
 * plain row — no checkbox — the GitHub "mixed task list" case, where a single
 * `<ul class="contains-task-list">` holds both `task-list-item` rows and plain
 * `<li>`s. Check-ness is otherwise a property of the list (every row of a
 * `check` list is a task item); this per-item mark is the single exception, so
 * {@link ListItemNode.getChecked} reports `undefined` (not a task) for a
 * marked row and every "is this a checkbox row" decision — rendering, theming,
 * checklist navigation — follows from that.
 *
 * Only meaningful for an item whose parent is a `check` ListNode; the list
 * item `$transform` clears it when the row moves to any other list type.
 *
 * @experimental
 */
export const listItemPlainState = /* @__PURE__ */ createState('listItemPlain', {
  parse: v => v === true,
});

/**
 * Whether the item renders a checkbox of its own — i.e. it is a task item.
 * True exactly when {@link ListItemNode.getChecked} reports a boolean, which
 * already folds in the parent being a check list and the item not carrying
 * {@link listItemPlainState}. The single predicate shared by rendering,
 * theming, and checklist navigation so they cannot disagree on which rows are
 * checkboxes in a mixed task list.
 */
export function $isTaskListItem(node: ListItemNode): boolean {
  return node.getChecked() !== undefined;
}

/**
 * Checks the depth of listNode from the root node.
 * @param listNode - The ListNode to be checked.
 * @returns The depth of the ListNode.
 */
export function $getListDepth(listNode: ListNode): number {
  let depth = 1;
  let parent = listNode.getParent();

  while (parent != null) {
    if ($isListItemNode(parent)) {
      const parentList = parent.getParent();

      if ($isListNode(parentList)) {
        depth++;
        parent = parentList.getParent();
        continue;
      }
      invariant(false, 'A ListItemNode must have a ListNode for a parent.');
    }

    return depth;
  }

  return depth;
}

/**
 * Finds the nearest ancestral ListNode and returns it, throws an invariant if listItem is not a ListItemNode.
 * @param listItem - The node to be checked.
 * @returns The ListNode found.
 */
export function $getTopListNode(listItem: LexicalNode): ListNode {
  const parentList = listItem.getParent();

  if (!$isListNode(parentList)) {
    invariant(false, 'A ListItemNode must have a ListNode for a parent.');
  }

  let list: ListNode = parentList;
  let parent: ElementNode | null = parentList;

  while (parent !== null) {
    parent = parent.getParent();

    if ($isListNode(parent)) {
      list = parent;
    }
  }

  return list;
}

/**
 * True when the item has a nested ListNode child — the first child in the
 * default wrapper representation, trailing the content in the semantic
 * representation. Iterates the child links directly (no array allocation);
 * safe on reconcile paths.
 */
export function $hasNestedListChild(listItem: ListItemNode): boolean {
  for (
    let child = listItem.getFirstChild();
    child !== null;
    child = child.getNextSibling()
  ) {
    if ($isListNode(child)) {
      return true;
    }
  }
  return false;
}

/**
 * Whether `node` is a check-list ListNode. The single encoding of "this
 * list item's parent is a check list" — i.e. the item renders a checkbox —
 * shared by rendering ({@link $updateListItemChecked}), theming, and
 * checklist navigation so they cannot disagree on which rows are checkboxes.
 */
export function $isCheckList(
  node: LexicalNode | null | undefined,
): node is ListNode {
  return $isListNode(node) && node.getListType() === 'check';
}

/**
 * An "emptied host row": an item that renders a row of its own even though
 * its inline content was deleted — it has children, none of them inline
 * (all nested ListNodes), and at least one of the lists carries the
 * semantic nesting mark (an item whose lists are all unmarked is a
 * dedicated wrapper instead). The row shows its marker/checkbox with no
 * text; commands that special-case "empty list item" treat it like the
 * default representation's childless item.
 */
export function $isEmptiedHostRow(listItem: ListItemNode): boolean {
  // Single child-link walk (this runs on caret/selection hot paths via
  // ListItemNode.isBlock): an item whose children are all nested lists is
  // an emptied host row when at least one list carries the semantic mark
  // (otherwise it is a dedicated wrapper); any inline child means it still
  // renders content, and no children means there is no row to speak of.
  let sawMarkedList = false;
  for (
    let child = listItem.getFirstChild();
    child !== null;
    child = child.getNextSibling()
  ) {
    if (!$isListNode(child)) {
      return false;
    }
    if ($getState(child, listSemanticNestingState)) {
      sawMarkedList = true;
    }
  }
  return sawMarkedList;
}

/**
 * Whether any of the node's own content is selected — every descendant
 * except its nested ListNodes, which are the *following* rows' content and
 * filter themselves. Recurses through inline element wrappers (e.g. a
 * LinkNode) so a partial selection inside a link still counts as the row's
 * content being selected.
 */
function $hasSelectedRowContent(
  element: ElementNode,
  isSelected: (node: LexicalNode) => boolean,
): boolean {
  for (
    let child = element.getFirstChild();
    child !== null;
    child = child.getNextSibling()
  ) {
    if ($isListNode(child)) {
      continue;
    }
    if (
      isSelected(child) ||
      ($isElementNode(child) && $hasSelectedRowContent(child, isSelected))
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Whether a list item emits its own row in a markdown/mdast export, versus
 * being a pure nesting container whose only output is its nested rows. The
 * single encoding of this rule, shared by the markdown and mdast list
 * exporters so the two representations and the two pipelines cannot diverge.
 *
 * - A dedicated wrapper never emits a row.
 * - In a whole-document export (`hasSelection` false) every other item
 *   emits, matching the default representation (even childless / emptied
 *   rows).
 * - In a selection export a content row emits when any of its own content
 *   is selected (at any depth, e.g. text inside a link — but NOT its nested
 *   lists, which are the following rows); an emptied host row (children are
 *   all nested lists) emits when the item itself is selected; a childless
 *   item never emits.
 *
 * `isSelected(node)` reports whether that node's own range is selected; it
 * is only consulted when `hasSelection` is true.
 */
export function $listItemEmitsRow(
  listItem: ListItemNode,
  hasSelection: boolean,
  isSelected: (node: LexicalNode) => boolean,
): boolean {
  if ($isWrapperListItemNode(listItem)) {
    return false;
  }
  if (!hasSelection) {
    return true;
  }
  let hasChild = false;
  let hasOwnContent = false;
  for (
    let child = listItem.getFirstChild();
    child !== null;
    child = child.getNextSibling()
  ) {
    hasChild = true;
    if ($isListNode(child)) {
      continue;
    }
    hasOwnContent = true;
    if (
      isSelected(child) ||
      ($isElementNode(child) && $hasSelectedRowContent(child, isSelected))
    ) {
      return true;
    }
  }
  return !hasOwnContent && hasChild && isSelected(listItem);
}

/**
 * Copy {@link listSemanticNestingState} from one list to another. Used
 * whenever an operation replaces a list with a freshly created one (list
 * retype, outdent splits): without the carried mark, an emptied host row
 * would read as a dedicated wrapper and be merged away.
 */
export function $copySemanticNestingMark(from: ListNode, to: ListNode): void {
  $setState(
    to,
    listSemanticNestingState,
    $getState(from, listSemanticNestingState),
  );
}

/**
 * `$copyNode` for the list-split paths: copy a ListNode and carry its
 * {@link listSemanticNestingState} over (`resetOnCopyNode` drops it on the
 * bare copy). Every operation that splits a list into an original and a
 * fresh copy living in the same position class — sibling lists of the same
 * host row, or continuations of the same nesting level — must go through
 * this so the copied half cannot silently lose the mark and read as
 * wrapper content.
 */
export function $copyListForSplit(list: ListNode): ListNode {
  const copy = $copyNode(list);
  $copySemanticNestingMark(list, copy);
  return copy;
}

/**
 * Whether any direct child of the list element holds a direct
 * `input[type=checkbox]` child — the shared checklist heuristic for
 * class-less task-list HTML, used identically by both import pipelines so
 * the same paste cannot classify differently between them.
 */
export function hasCheckboxInputRowChild(listElement: Element): boolean {
  for (const child of listElement.children) {
    if (findCheckboxInputChild(child) !== null) {
      return true;
    }
  }
  return false;
}

/**
 * The direct `input[type=checkbox]` child of a list item element, if any.
 * The presence of one marks a task-list row in GitHub HTML and in the
 * semantic nesting mode's own export.
 */
export function findCheckboxInputChild(
  listItemElement: Element,
): Element | null {
  for (const child of listItemElement.children) {
    if (
      child.tagName === 'INPUT' &&
      child.getAttribute('type') === 'checkbox'
    ) {
      return child;
    }
  }
  return null;
}

/**
 * Checks if listItem has no child ListNodes and has no ListItemNode ancestors with siblings.
 * @param listItem - the ListItemNode to be checked.
 * @returns true if listItem has no child ListNode and no ListItemNode ancestors with siblings, false otherwise.
 */
export function $isLastItemInList(listItem: ListItemNode): boolean {
  let isLast = true;

  // A nested list may be the first child (default wrapper representation) or
  // trail the item's own content (semantic representation); either way this
  // item is followed by deeper items.
  if ($hasNestedListChild(listItem)) {
    return false;
  }
  let parent: ElementNode | null = listItem;

  while (parent !== null) {
    if ($isListItemNode(parent)) {
      if (parent.getNextSiblings().length > 0) {
        isLast = false;
      }
    }

    parent = parent.getParent();
  }

  return isLast;
}

/**
 * A recursive Depth-First Search (Postorder Traversal) that finds all of a node's children
 * that are of type ListItemNode and returns them in an array.
 * @param node - The ListNode to start the search.
 * @returns An array containing all nodes of type ListItemNode found.
 */
// This should probably be $getAllChildrenOfType
export function $getAllListItems(node: ListNode): ListItemNode[] {
  // Single-pass link walk into a shared accumulator: this runs on keystroke
  // paths (checklist arrow navigation) as well as one-shot commands.
  const listItemNodes: ListItemNode[] = [];
  $collectListItems(node, listItemNodes);
  return listItemNodes;
}

function $collectListItems(node: ListNode, out: ListItemNode[]): void {
  for (
    let listItemNode = node.getFirstChild();
    listItemNode !== null;
    listItemNode = listItemNode.getNextSibling()
  ) {
    if (!$isListItemNode(listItemNode)) {
      continue;
    }
    // An item that renders a row of its own is collected; dedicated wrapper
    // items are not. Any nested ListNode children (first child in the
    // default wrapper representation, trailing the content in the semantic
    // representation) are traversed in document order.
    if (!$isWrapperListItemNode(listItemNode)) {
      out.push(listItemNode);
    }
    for (
      let nestedList = listItemNode.getFirstChild();
      nestedList !== null;
      nestedList = nestedList.getNextSibling()
    ) {
      if ($isListNode(nestedList)) {
        $collectListItems(nestedList, out);
      }
    }
  }
}

const WrapperListItemNodeBrand: unique symbol = Symbol.for(
  '@lexical/WrapperListItemNodeBrand',
);

/**
 * Checks to see if the passed node is a ListItemNode that exists solely to
 * hold nested ListNodes (every child is a ListNode, none of them marked
 * with {@link listSemanticNestingState}). This is the dedicated "wrapper"
 * list item that the default list representation uses to express nesting
 * (`<li><ul>…</ul></li>`); it renders no content of its own. See the
 * `hasSemanticNesting` config of `ListExtension` for the opt-in
 * representation that keeps nested lists inside their preceding sibling
 * instead.
 *
 * An item whose lists carry the semantic nesting mark is NOT a wrapper even
 * when it currently has no inline content: it is a real item whose content
 * was deleted, and it keeps rendering its own marker/checkbox/value.
 *
 * @param node - The node to be checked.
 * @returns true if the node is a ListItemNode whose children are all
 * unmarked ListNodes.
 */
export function $isWrapperListItemNode(
  node: LexicalNode | null | undefined,
): node is Spread<
  {getFirstChild(): ListNode; [WrapperListItemNodeBrand]: never},
  ListItemNode
> {
  if (!$isListItemNode(node)) {
    return false;
  }
  // Iterate the child links directly (this runs during reconciliation and
  // in transforms); a typical content item exits at its first child with no
  // array allocation.
  let child = node.getFirstChild();
  if (child === null) {
    return false;
  }
  for (; child !== null; child = child.getNextSibling()) {
    if (!$isListNode(child) || $getState(child, listSemanticNestingState)) {
      return false;
    }
  }
  return true;
}

/**
 * Traverses up the tree and returns the first ListItemNode found.
 * @param node - Node to start the search.
 * @returns The first ListItemNode found, or null if none exist.
 */
export function $findNearestListItemNode(
  node: LexicalNode,
): ListItemNode | null {
  const matchingParent = $findMatchingParent(node, parent =>
    $isListItemNode(parent),
  );
  return matchingParent as ListItemNode | null;
}

/**
 * Takes a deeply nested ListNode or ListItemNode and traverses up the branch to delete the first
 * ancestral ListNode (which could be the root ListNode) or ListItemNode with siblings, essentially
 * bringing the deeply nested node up the branch once. Would remove sublist if it has siblings.
 * Should not break ListItem -> List -> ListItem chain as empty List/ItemNodes should be removed on .remove().
 * @param sublist - The nested ListNode or ListItemNode to be brought up the branch.
 */
export function $removeHighestEmptyListParent(
  sublist: ListItemNode | ListNode,
) {
  // Nodes may be repeatedly indented, to create deeply nested lists that each
  // contain just one bullet.
  // Our goal is to remove these (empty) deeply nested lists. The easiest
  // way to do that is crawl back up the tree until we find a node that has siblings
  // (e.g. is actually part of the list contents) and delete that, or delete
  // the root of the list (if no list nodes have siblings.)
  let emptyListPtr = sublist;

  while (
    emptyListPtr.getNextSibling() == null &&
    emptyListPtr.getPreviousSibling() == null
  ) {
    const parent = emptyListPtr.getParent();

    if (parent == null || !($isListItemNode(parent) || $isListNode(parent))) {
      break;
    }

    // A marked list belongs to a row of its own (semantic representation);
    // climbing past it would delete that rendered row — an item emptied of
    // its inline content still shows its marker/checkbox. The marked list
    // is the highest node this cleanup may remove.
    if (
      $isListNode(emptyListPtr) &&
      $getState(emptyListPtr, listSemanticNestingState)
    ) {
      break;
    }

    emptyListPtr = parent;
  }

  emptyListPtr.remove();
}

/**
 * Calculates the start value for a new list created by splitting an existing list.
 */
export function $getNewListStart(
  list: ListNode,
  listItem: ListItemNode,
): number {
  return list.getStart() + listItem.getIndexWithinParent();
}
