/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {ListType} from './LexicalListNode';

import invariant from '@lexical/internal/invariant';
import {$getNearestNodeOfType} from '@lexical/utils';
import {
  $copyNode,
  $createParagraphNode,
  $getChildCaret,
  $getSelection,
  $isElementNode,
  $isLeafNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  $normalizeCaret,
  $setPointFromCaret,
  type ElementNode,
  type LexicalNode,
  type ParagraphNode,
} from 'lexical';

import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
  ListItemNode,
  type ListNode,
} from './';
import {
  $clearSemanticNestingMark,
  $parkNestedListsInWrapper,
} from './semanticNesting';
import {
  $copyListForSplit,
  $copySemanticNestingMark,
  $getAllListItems,
  $getNewListStart,
  $getTopListNode,
  $isEmptiedHostRow,
  $isWrapperListItemNode,
  $removeHighestEmptyListParent,
} from './utils';

function $isSelectingEmptyListItem(
  anchorNode: ListItemNode | LexicalNode,
  nodes: LexicalNode[],
  isCollapsed: boolean,
): boolean {
  if (!$isListItemNode(anchorNode)) {
    return false;
  }
  if (nodes.length === 0) {
    return true;
  }
  if (nodes.length !== 1) {
    return false;
  }
  if (anchorNode.is(nodes[0])) {
    return anchorNode.getChildrenSize() === 0;
  }
  // An emptied host row (semantic representation): a collapsed caret is an
  // element point on the li, but getNodes() resolves into its nested list.
  // The row is visually empty, so list commands target its own list level —
  // the same behavior the default representation's empty item gets. Only
  // for a collapsed selection: a RANGE anchored on the li reaching into the
  // nested rows produces the same getNodes() shape, and must keep targeting
  // the nested list that actually holds the selected text.
  return isCollapsed && $isEmptiedHostRow(anchorNode);
}

/**
 * Inserts a new ListNode. If the selection's anchor node is an empty ListItemNode and is a child of
 * the root/shadow root, it will replace the ListItemNode with a ListNode and the old ListItemNode.
 * Otherwise it will replace its parent with a new ListNode and re-insert the ListItemNode and any previous children.
 * If the selection's anchor node is not an empty ListItemNode, it will add a new ListNode or merge an existing ListNode,
 * unless the node is a leaf node, in which case it will attempt to find a ListNode up the branch and replace it with
 * a new ListNode, or create a new ListNode at the nearest root/shadow root.
 * @param listType - The type of list, "number" | "bullet" | "check".
 */
export function $insertList(listType: ListType): void {
  const selection = $getSelection();

  if (selection !== null) {
    let nodes = selection.getNodes();
    if ($isRangeSelection(selection)) {
      const [anchor] = selection.getStartEndPoints();
      const anchorNode = anchor.getNode();
      const anchorNodeParent = anchorNode.getParent();

      if ($isRootOrShadowRoot(anchorNode)) {
        const firstChild = anchorNode.getFirstChild();
        if (firstChild) {
          nodes = firstChild.selectStart().getNodes();
        } else {
          const paragraph = $createParagraphNode();
          anchorNode.append(paragraph);
          nodes = paragraph.select().getNodes();
        }
      } else if (
        $isSelectingEmptyListItem(anchorNode, nodes, selection.isCollapsed())
      ) {
        const list = $createListNode(listType);

        if ($isRootOrShadowRoot(anchorNodeParent)) {
          anchorNode.replace(list);
          const listItem = $createListItemNode();
          if ($isElementNode(anchorNode)) {
            listItem.setFormat(anchorNode.getFormatType());
            listItem.setIndent(anchorNode.getIndent());
          }
          list.append(listItem);
        } else if ($isListItemNode(anchorNode)) {
          const parent = anchorNode.getParentOrThrow();
          append(list, parent.getChildren());
          if ($isListNode(parent)) {
            $copySemanticNestingMark(parent, list);
          }
          parent.replace(list);
        }

        return;
      }
    }

    const handled = new Set();
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (
        $isElementNode(node) &&
        node.isEmpty() &&
        !$isListItemNode(node) &&
        !handled.has(node.getKey())
      ) {
        $createListOrMerge(node, listType);
        continue;
      }

      let parent = $isLeafNode(node)
        ? node.getParent()
        : $isListItemNode(node) && node.isEmpty()
          ? node
          : null;

      while (parent != null) {
        const parentKey = parent.getKey();

        if ($isListNode(parent)) {
          if (!handled.has(parentKey)) {
            const newListNode = $createListNode(listType);
            append(newListNode, parent.getChildren());
            $copySemanticNestingMark(parent, newListNode);
            parent.replace(newListNode);
            handled.add(parentKey);
          }

          break;
        } else {
          const nextParent = parent.getParent();

          if ($isRootOrShadowRoot(nextParent) && !handled.has(parentKey)) {
            handled.add(parentKey);
            $createListOrMerge(parent, listType);
            break;
          }

          parent = nextParent;
        }
      }
    }
  }
}

function append(node: ElementNode, nodesToAppend: LexicalNode[]) {
  node.splice(node.getChildrenSize(), 0, nodesToAppend);
}

function $createListOrMerge(node: ElementNode, listType: ListType): ListNode {
  if ($isListNode(node)) {
    return node;
  }

  const previousSibling = node.getPreviousSibling();
  const nextSibling = node.getNextSibling();
  const listItem = $createListItemNode();
  append(listItem, node.getChildren());

  let targetList;
  if (
    $isListNode(previousSibling) &&
    listType === previousSibling.getListType()
  ) {
    previousSibling.append(listItem);
    // if the same type of list is on both sides, merge them.
    if ($isListNode(nextSibling) && listType === nextSibling.getListType()) {
      append(previousSibling, nextSibling.getChildren());
      nextSibling.remove();
    }
    targetList = previousSibling;
  } else if (
    $isListNode(nextSibling) &&
    listType === nextSibling.getListType()
  ) {
    nextSibling.getFirstChildOrThrow().insertBefore(listItem);
    targetList = nextSibling;
  } else {
    const list = $createListNode(listType);
    list.append(listItem);
    node.replace(list);
    targetList = list;
  }
  // listItem needs to be attached to root prior to setting indent
  listItem.setFormat(node.getFormatType());
  listItem.setIndent(node.getIndent());

  // Preserve element-anchored selections by updating them to anchor to the listItem instead of the listNode.
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    if (targetList.getKey() === selection.anchor.key) {
      selection.anchor.set(
        listItem.getKey(),
        selection.anchor.offset,
        'element',
      );
    }
    if (targetList.getKey() === selection.focus.key) {
      selection.focus.set(listItem.getKey(), selection.focus.offset, 'element');
    }
  }

  node.remove();

  return targetList;
}

/**
 * A recursive function that goes through each list and their children, including nested lists,
 * appending list2 children after list1 children and updating ListItemNode values.
 * @param list1 - The first list to be merged.
 * @param list2 - The second list to be merged.
 */
// mergeLists is a legacy-named editor-context export; the $-named helper it
// calls shares that context.
// eslint-disable-next-line @lexical/rules-of-lexical
export function mergeLists(list1: ListNode, list2: ListNode): void {
  const listItem1 = list1.getLastChild();
  const listItem2 = list2.getFirstChild();

  // Only dedicated wrapper items are collapsed into each other; an item
  // whose lists carry the semantic nesting mark renders a row of its own
  // and must survive the merge as a regular sibling.
  if ($isWrapperListItemNode(listItem1) && $isWrapperListItemNode(listItem2)) {
    $collapseWrapperPair(listItem1, listItem2);
  }

  const toMerge = list2.getChildren();
  if (toMerge.length > 0) {
    list1.append(...toMerge);
  }

  list2.remove();
}

/**
 * Collapse two adjacent dedicated wrapper items into the first one. A
 * wrapper may hold several lists (of different types), so merge the
 * boundary pair — the LAST list of the first wrapper with the FIRST list
 * of the second — and move any remaining lists across so none are lost.
 * Shared by {@link mergeLists} and `ListItemNode.remove` so the collapse
 * policy cannot diverge between merging two lists and deleting the row
 * that separated two wrappers.
 */
export function $collapseWrapperPair(
  wrapper1: ListItemNode,
  wrapper2: ListItemNode,
): void {
  const boundaryList1 = wrapper1.getLastChild();
  const boundaryList2 = wrapper2.getFirstChild();
  if ($isListNode(boundaryList1) && $isListNode(boundaryList2)) {
    mergeLists(boundaryList1, boundaryList2);
  }
  wrapper1.append(...wrapper2.getChildren());
  wrapper2.remove();
}

/**
 * Searches for the nearest ancestral ListNode and removes it. If selection is an empty ListItemNode
 * it will remove the whole list, including the ListItemNode. For each ListItemNode in the ListNode,
 * removeList will also generate new ParagraphNodes in the removed ListNode's place. Any child node
 * inside a ListItemNode will be appended to the new ParagraphNodes.
 */
export function $removeList(): void {
  const selection = $getSelection();

  if ($isRangeSelection(selection)) {
    const listNodes = new Set<ListNode>();
    const nodes = selection.getNodes();
    const anchorNode = selection.anchor.getNode();

    if ($isSelectingEmptyListItem(anchorNode, nodes, selection.isCollapsed())) {
      listNodes.add($getTopListNode(anchorNode));
    } else {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if ($isLeafNode(node)) {
          const listItemNode = $getNearestNodeOfType(node, ListItemNode);

          if (listItemNode != null) {
            listNodes.add($getTopListNode(listItemNode));
          }
        }
      }
    }

    for (const listNode of listNodes) {
      let insertionPoint: ListNode | ParagraphNode = listNode;

      const listItems = $getAllListItems(listNode);

      for (const listItemNode of listItems) {
        const paragraph = $createParagraphNode()
          .setTextStyle(selection.style)
          .setTextFormat(selection.format);

        // Nested ListNode children (semantic representation) hold items that
        // are processed later in this loop; relocate them next to the item
        // (rather than removing them with it) so they — and any selection
        // inside them — stay attached until their own turn. They remove
        // themselves once their last item is gone (canBeEmpty is false).
        for (const child of listItemNode.getChildren()) {
          if ($isListNode(child)) {
            listItemNode.insertBefore(child);
          }
        }
        append(paragraph, listItemNode.getChildren());

        insertionPoint.insertAfter(paragraph);
        insertionPoint = paragraph;

        // When the anchor and focus fall on the textNode
        // we don't have to change the selection because the textNode will be appended to
        // the newly generated paragraph.
        // When selection is in empty nested list item, selection is actually on the listItemNode.
        // When the corresponding listItemNode is deleted and replaced by the newly generated paragraph
        // we should manually set the selection's focus and anchor to the newly generated paragraph.
        if (listItemNode.__key === selection.anchor.key) {
          $setPointFromCaret(
            selection.anchor,
            $normalizeCaret($getChildCaret(paragraph, 'next')),
          );
        }
        if (listItemNode.__key === selection.focus.key) {
          $setPointFromCaret(
            selection.focus,
            $normalizeCaret($getChildCaret(paragraph, 'next')),
          );
        }

        listItemNode.remove();
      }
      listNode.remove();
    }
  }
}

/**
 * Takes the value of a child ListItemNode and makes it the value the ListItemNode
 * should be if it isn't already. Also ensures that checked is undefined if the
 * parent does not have a list type of 'check'.
 * @param list - The list whose children are updated.
 */
export function updateChildrenListItemValue(list: ListNode): void {
  const isNotChecklist = list.getListType() !== 'check';
  let value = list.getStart();
  for (const child of list.getChildren()) {
    if ($isListItemNode(child)) {
      if (child.getValue() !== value) {
        child.setValue(value);
      }
      if (isNotChecklist && child.getLatest().__checked != null) {
        child.setChecked(undefined);
      }
      // Wrapper items only hold a nested list and don't render a marker of
      // their own; items with content (including those with a trailing
      // nested list in the semantic representation) consume a value.
      if (!$isWrapperListItemNode(child)) {
        value++;
      }
    }
  }
}

/**
 * Merge the next sibling list if same type.
 * <ul> will merge with <ul>, but NOT <ul> with <ol>.
 * @param list - The list whose next sibling should be potentially merged
 */
export function mergeNextSiblingListIfSameType(list: ListNode): void {
  const nextSibling = list.getNextSibling();
  if (
    $isListNode(nextSibling) &&
    list.getListType() === nextSibling.getListType()
  ) {
    mergeLists(list, nextSibling);
  }
}

/**
 * Adds an empty ListNode/ListItemNode chain at listItemNode, so as to
 * create an indent effect. Won't indent ListItemNodes that have a ListNode as
 * a child, but does merge sibling ListItemNodes if one has a nested ListNode.
 * @param listItemNode - The ListItemNode to be indented.
 */
export function $handleIndent(listItemNode: ListItemNode): void {
  // Dedicated wrapper items cannot be indented; items whose lists carry the
  // semantic nesting mark are real rows and can.
  if ($isWrapperListItemNode(listItemNode)) {
    return;
  }

  const parent = listItemNode.getParent();

  const nextSibling = listItemNode.getNextSibling();
  const previousSibling = listItemNode.getPreviousSibling();
  // If there are dedicated wrapper items on either side, merge them all
  // together. An adjacent item whose lists are semantically marked is a row
  // of its own, not this item's continuation, so it is never merged into;
  // the fallback branch (plus the semantic normalization transform, when
  // enabled) handles nesting next to such rows.

  if (
    $isWrapperListItemNode(nextSibling) &&
    $isWrapperListItemNode(previousSibling)
  ) {
    // Append into the previous wrapper's LAST list (adjacent to the next
    // wrapper), then collapse the pair — which merges the boundary lists
    // and carries every remaining list, so multi-list wrappers lose
    // nothing.
    const innerList = previousSibling.getLastChild();

    if ($isListNode(innerList)) {
      innerList.append(listItemNode);
      $collapseWrapperPair(previousSibling, nextSibling);
    }
  } else if ($isWrapperListItemNode(nextSibling)) {
    // if the ListItemNode is next to a nested ListNode, merge them
    const innerList = nextSibling.getFirstChild();

    if ($isListNode(innerList)) {
      const firstChild = innerList.getFirstChild();

      if (firstChild !== null) {
        firstChild.insertBefore(listItemNode);
      }
    }
  } else if ($isWrapperListItemNode(previousSibling)) {
    const innerList = previousSibling.getFirstChild();

    if ($isListNode(innerList)) {
      innerList.append(listItemNode);
    }
  } else {
    const previousTrailingList = $isListItemNode(previousSibling)
      ? previousSibling.getLastChild()
      : null;

    if ($isListNode(previousTrailingList)) {
      // The previous sibling is a host row with a trailing nested list
      // (semantic representation): continue that list rather than starting
      // a separate wrapper alongside it, which would restart ordered
      // numbering. A move preserves the list's semantic nesting mark.
      previousTrailingList.append(listItemNode);
    } else if ($isListNode(parent)) {
      // otherwise, we need to create a new nested ListNode
      const newListItem = $copyNode(listItemNode);
      const newList = $copyNode(parent);
      newListItem.append(newList);
      newList.append(listItemNode);

      if (previousSibling) {
        previousSibling.insertAfter(newListItem);
      } else if (nextSibling) {
        nextSibling.insertBefore(newListItem);
      } else {
        parent.append(newListItem);
      }
    }
  }
}

/**
 * Removes an indent by removing an empty ListNode/ListItemNode chain. An indented ListItemNode
 * has a great grandparent node of type ListNode, which is where the ListItemNode will reside
 * within as a child.
 * @param listItemNode - The ListItemNode to remove the indent (outdent).
 */
export function $handleOutdent(listItemNode: ListItemNode): void {
  // go through each node and decide where to move it.

  // Dedicated wrapper items cannot be outdented; items whose lists carry
  // the semantic nesting mark are real rows and can.
  if ($isWrapperListItemNode(listItemNode)) {
    return;
  }
  const parentList = listItemNode.getParent();
  const grandparentListItem = parentList ? parentList.getParent() : undefined;
  const greatGrandparentList = grandparentListItem
    ? grandparentListItem.getParent()
    : undefined;
  // If it doesn't have these ancestors, it's not indented.

  if (
    $isListNode(greatGrandparentList) &&
    $isListItemNode(grandparentListItem) &&
    $isListNode(parentList)
  ) {
    if (!$isWrapperListItemNode(grandparentListItem)) {
      // The parent list is nested semantically: it lives inside a list item
      // that renders a row of its own, so the outdented item lands *after*
      // that item. Anything that renders below the outdented item — its
      // next siblings, and any further nested lists of the grandparent
      // that follow the parent list — stays one level deeper and becomes
      // the outdented item's own nested lists to preserve document order.
      const isFirstChild = listItemNode.getPreviousSibling() === null;
      const nextSiblings = listItemNode.getNextSiblings();
      const trailingLists = parentList.getNextSiblings().filter($isListNode);
      grandparentListItem.insertAfter(listItemNode);
      if (nextSiblings.length > 0) {
        if (isFirstChild) {
          // The remaining list is exactly the next siblings; adopt it
          // whole (a move, so its semantic nesting mark is preserved).
          listItemNode.append(parentList);
        } else {
          // $copyListForSplit carries the original list's mark so the
          // outdented item still reads as a row even if its own inline
          // content is empty.
          const nextSiblingsList = $copyListForSplit(parentList);
          append(nextSiblingsList, nextSiblings);
          listItemNode.append(nextSiblingsList);
        }
      } else if (isFirstChild) {
        parentList.remove();
      }
      for (const trailingList of trailingLists) {
        listItemNode.append(trailingList);
      }
      return;
    }
    // The item lands beside the wrapper in the great grandparent list.
    // "First"/"last" must hold for the whole wrapper — a wrapper may hold
    // several lists — otherwise the outdented item would be reordered
    // across the wrapper's other lists' rows.
    const isFirstRow =
      listItemNode.getPreviousSibling() === null &&
      parentList.getPreviousSibling() === null;
    const isLastRow =
      listItemNode.getNextSibling() === null &&
      parentList.getNextSibling() === null;

    if (isFirstRow || isLastRow) {
      if (isFirstRow) {
        grandparentListItem.insertBefore(listItemNode);
      } else {
        grandparentListItem.insertAfter(listItemNode);
      }
      // Remove only the emptied list, and the wrapper itself only once no
      // list remains.
      if (parentList.isEmpty()) {
        parentList.remove();
        if (grandparentListItem.isEmpty()) {
          grandparentListItem.remove();
        }
      }
    } else {
      // Split the wrapper: everything that renders below the outdented
      // item — its next siblings and the wrapper's later lists — moves to
      // a new wrapper inserted after it, preserving document order. The
      // original wrapper keeps everything that renders above.
      const nextSiblings = listItemNode.getNextSiblings();
      const trailingLists = parentList.getNextSiblings().filter($isListNode);
      grandparentListItem.insertAfter(listItemNode);
      if (nextSiblings.length > 0 || trailingLists.length > 0) {
        // A fresh dedicated wrapper (mirrors $parkNestedListsInWrapper).
        const nextWrapper = $createListItemNode();
        if (nextSiblings.length > 0) {
          const nextSiblingsList = $copyListForSplit(parentList);
          append(nextSiblingsList, nextSiblings);
          nextWrapper.append(nextSiblingsList);
        }
        append(nextWrapper, trailingLists);
        listItemNode.insertAfter(nextWrapper);
      }
      if (parentList.isEmpty()) {
        parentList.remove();
      }
    }
  }
}

/**
 * Attempts to insert a ParagraphNode at selection and selects the new node. The selection must contain a ListItemNode
 * or a node that does not already contain text. If its grandparent is the root/shadow root, it will get the ListNode
 * (which should be the parent node) and insert the ParagraphNode as a sibling to the ListNode. If the ListNode is
 * nested in a ListItemNode instead, it will add the ParagraphNode after the grandparent ListItemNode.
 * Throws an invariant if the selection is not a child of a ListNode.
 * @returns true if a ParagraphNode was inserted successfully, false if there is no selection
 * or the selection does not contain a ListItemNode or the node already holds text.
 */
export function $handleListInsertParagraph(
  restoreNumbering: boolean = false,
): boolean {
  const selection = $getSelection();

  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return false;
  }
  // Only run this code on empty list items (including whitespace-only)
  const anchor = selection.anchor.getNode();

  let listItem: ListItemNode | null = null;

  if (
    $isListItemNode(anchor) &&
    (anchor.getChildrenSize() === 0 ||
      // An emptied host row (semantic representation): only marked nested
      // lists remain, the row itself is visually empty.
      $isEmptiedHostRow(anchor))
  ) {
    // Empty list item (element selection)
    listItem = anchor;
  } else if ($isTextNode(anchor)) {
    // Check if the entire list item contains only whitespace text nodes
    // (nested ListNode children — the semantic representation — do not
    // make the row non-empty; they are handled by the parking below).
    const parentListItem = anchor.getParent();
    if (
      $isListItemNode(parentListItem) &&
      parentListItem
        .getChildren()
        .every(
          node =>
            $isListNode(node) ||
            ($isTextNode(node) && node.getTextContent().trim() === ''),
        )
    ) {
      listItem = parentListItem;
    }
  }

  if (listItem === null) {
    return false;
  }

  const topListNode = $getTopListNode(listItem);
  const parent = listItem.getParent();

  invariant(
    $isListNode(parent),
    'A ListItemNode must have a ListNode for a parent.',
  );

  const grandparent = parent.getParent();

  let replacementNode: ParagraphNode | ListItemNode;

  if ($isRootOrShadowRoot(grandparent)) {
    replacementNode = $createParagraphNode();
    topListNode.insertAfter(replacementNode);
  } else if ($isListItemNode(grandparent)) {
    replacementNode = $copyNode(grandparent);
    grandparent.insertAfter(replacementNode);
  } else {
    // Unhandled container: decline WITHOUT having mutated anything (the
    // parking below must not run before this classification).
    return false;
  }
  replacementNode
    .setTextStyle(selection.style)
    .setTextFormat(selection.format)
    .select();

  // An emptied (or whitespace-only) host row's nested lists are the
  // following rows' content; park them in a dedicated wrapper (like the
  // default representation's shape) so the split below carries them and
  // the row's removal cannot take them along.
  $parkNestedListsInWrapper(listItem);

  const nextSiblings = listItem.getNextSiblings();
  // A semantic host may hold further nested lists after the split one; they
  // render below the split point and must move with it to preserve document
  // order. They land in a dedicated wrapper, so their semantic nesting marks
  // are cleared (typing into the new row adopts and re-marks them).
  const trailingLists = $isListItemNode(replacementNode)
    ? parent.getNextSiblings().filter($isListNode)
    : [];

  const $createContinuationList = (): ListNode => {
    const newStart = restoreNumbering ? $getNewListStart(parent, listItem) : 1;
    const newList = $copyNode(parent).setStart(newStart);
    newList.append(...nextSiblings);
    return newList;
  };

  if ($isListItemNode(replacementNode)) {
    if (nextSiblings.length > 0 || trailingLists.length > 0) {
      const carriedLists: ListNode[] = [];
      if (nextSiblings.length > 0) {
        carriedLists.push($createContinuationList());
      }
      for (const trailingList of trailingLists) {
        // Moving into a dedicated wrapper clears the mark.
        $clearSemanticNestingMark(trailingList);
        carriedLists.push(trailingList);
      }
      const newListItem = $copyNode(replacementNode);
      newListItem.append(...carriedLists);
      replacementNode.insertAfter(newListItem);
    }
  } else if (nextSiblings.length > 0) {
    // Top-level split: the rows after the removed item continue in a new
    // list following the paragraph (trailingLists is always empty here).
    replacementNode.insertAfter($createContinuationList());
  }

  // Don't leave hanging nested empty lists
  $removeHighestEmptyListParent(listItem);

  return true;
}
