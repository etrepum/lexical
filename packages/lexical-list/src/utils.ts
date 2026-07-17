/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import invariant from '@lexical/internal/invariant';
import {
  $findMatchingParent,
  $getState,
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
 * content.
 *
 * @internal
 */
export const listSemanticNestingState = /* @__PURE__ */ createState(
  'listSemanticNesting',
  {
    parse: v => v === true,
    resetOnCopyNode: true,
  },
);

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
 * safe on reconcile paths. Compare {@link $hasRowContent}, which asks the
 * opposite question.
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
 * True when the item has a child that is NOT a ListNode — i.e. it carries
 * inline content of its own. An item with children but no row content is
 * either a dedicated wrapper or an emptied host row (the semantic nesting
 * mark on its lists distinguishes the two). Link-walk, no allocation.
 * Compare {@link $hasNestedListChild}, which asks the opposite question.
 */
export function $hasRowContent(listItem: ListItemNode): boolean {
  for (
    let child = listItem.getFirstChild();
    child !== null;
    child = child.getNextSibling()
  ) {
    if (!$isListNode(child)) {
      return true;
    }
  }
  return false;
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
