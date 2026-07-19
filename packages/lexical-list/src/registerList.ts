/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $createParagraphNode,
  $findMatchingParent,
  $getNodeByKey,
  $getSelection,
  $isDecoratorNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_BEFORE_EDITOR,
  COMMAND_PRIORITY_LOW,
  createCommand,
  type ElementNode,
  INSERT_PARAGRAPH_COMMAND,
  KEY_BACKSPACE_COMMAND,
  type LexicalCommand,
  type LexicalEditor,
  type LexicalNode,
  mergeRegister,
  type NodeKey,
  TextNode,
} from 'lexical';

import {
  $handleListInsertParagraph,
  $insertList,
  $removeList,
  updateChildrenListItemValue,
} from './formatList';
import {$isListItemNode, ListItemNode} from './LexicalListItemNode';
import {$isListNode, ListNode} from './LexicalListNode';
import {$getListDepth, $isWrapperListItemNode} from './utils';

export const UPDATE_LIST_START_COMMAND: LexicalCommand<{
  listNodeKey: NodeKey;
  newStart: number;
}> = /* @__PURE__ */ createCommand('UPDATE_LIST_START_COMMAND');
export const INSERT_UNORDERED_LIST_COMMAND: LexicalCommand<void> =
  /* @__PURE__ */ createCommand('INSERT_UNORDERED_LIST_COMMAND');
export const INSERT_ORDERED_LIST_COMMAND: LexicalCommand<void> =
  /* @__PURE__ */ createCommand('INSERT_ORDERED_LIST_COMMAND');
export const REMOVE_LIST_COMMAND: LexicalCommand<void> =
  /* @__PURE__ */ createCommand('REMOVE_LIST_COMMAND');

export interface RegisterListOptions {
  restoreNumbering?: boolean;
}

export function registerList(
  editor: LexicalEditor,
  options?: RegisterListOptions,
): () => void {
  const removeListener = mergeRegister(
    editor.registerCommand(
      INSERT_ORDERED_LIST_COMMAND,
      () => {
        $insertList('number');
        return true;
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      UPDATE_LIST_START_COMMAND,
      payload => {
        const {listNodeKey, newStart} = payload;
        const listNode = $getNodeByKey(listNodeKey);
        if (!$isListNode(listNode)) {
          return false;
        }
        if (listNode.getListType() === 'number') {
          listNode.setStart(newStart);
          updateChildrenListItemValue(listNode);
        }
        return true;
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      INSERT_UNORDERED_LIST_COMMAND,
      () => {
        $insertList('bullet');
        return true;
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      REMOVE_LIST_COMMAND,
      () => {
        $removeList();
        return true;
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      INSERT_PARAGRAPH_COMMAND,
      () => {
        const shouldRestore = options && options.restoreNumbering;
        return $handleListInsertParagraph(!!shouldRestore);
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      event => {
        if ($handleListItemBackspaceAdjacentToDecorator()) {
          event.preventDefault();
          return true;
        }
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }
        const {anchor} = selection;
        if (anchor.offset !== 0) {
          return false;
        }
        let current: LexicalNode = anchor.getNode();
        while (!$isListItemNode(current)) {
          if (current.getPreviousSibling() !== null) {
            return false;
          }
          const parent = current.getParent();
          if (parent === null) {
            return false;
          }
          current = parent;
        }
        if ($isListItemNode(current) && current.collapseAtStart(selection)) {
          event.preventDefault();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_BEFORE_EDITOR,
    ),
    editor.registerNodeTransform(ListItemNode, node => {
      const firstChild = node.getFirstChild();
      if (firstChild) {
        if ($isTextNode(firstChild)) {
          const style = firstChild.getStyle();
          const format = firstChild.getFormat();
          if (node.getTextStyle() !== style) {
            node.setTextStyle(style);
          }
          if (node.getTextFormat() !== format) {
            node.setTextFormat(format);
          }
        }
      } else {
        // If it's empty, check the selection
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) &&
          (selection.style !== node.getTextStyle() ||
            selection.format !== node.getTextFormat()) &&
          selection.isCollapsed() &&
          node.is(selection.anchor.getNode())
        ) {
          node.setTextStyle(selection.style).setTextFormat(selection.format);
        }
      }
    }),
    editor.registerNodeTransform(TextNode, node => {
      const listItemParentNode = node.getParent();
      if (
        $isListItemNode(listItemParentNode) &&
        node.is(listItemParentNode.getFirstChild())
      ) {
        const style = node.getStyle();
        const format = node.getFormat();
        if (
          style !== listItemParentNode.getTextStyle() ||
          format !== listItemParentNode.getTextFormat()
        ) {
          listItemParentNode.setTextStyle(style).setTextFormat(format);
        }
      }
    }),
  );
  return removeListener;
}

export function registerListStrictIndentTransform(
  editor: LexicalEditor,
): () => void {
  const $formatListIndentStrict = (listItemNode: ListItemNode): void => {
    const listNode = listItemNode.getParent();
    if ($isWrapperListItemNode(listItemNode) || !$isListNode(listNode)) {
      return;
    }

    // Find the list item that ends the previous visual row: the nearest
    // ancestor-or-self list item with a previous sibling (then descend to
    // the end of that sibling's nested lists), or — in the semantic
    // representation — the content-bearing list item that directly contains
    // this item's list.
    let endListItemNode: ListItemNode | null = null;
    let probe: ListItemNode | null = listItemNode;
    while ($isListItemNode(probe)) {
      const previousSibling = probe.getPreviousSibling();
      if ($isListItemNode(previousSibling)) {
        endListItemNode = $findChildrenEndListItemNode(previousSibling);
        break;
      }
      const probeList: ElementNode | null = probe.getParent();
      if (!$isListNode(probeList)) {
        break;
      }
      const containingListItem: ElementNode | null = probeList.getParent();
      if (!$isListItemNode(containingListItem)) {
        break;
      }
      // A host or wrapper item may hold several nested lists; an earlier
      // sibling list inside the same item renders its rows directly above
      // this one, so the previous visual row is that list's deepest last
      // item.
      let previousList: LexicalNode | null = probeList.getPreviousSibling();
      while (previousList !== null && !$isListNode(previousList)) {
        previousList = previousList.getPreviousSibling();
      }
      if ($isListNode(previousList)) {
        const lastItem = previousList.getLastChild();
        if ($isListItemNode(lastItem)) {
          endListItemNode = $findChildrenEndListItemNode(lastItem);
          break;
        }
      }
      if (!$isWrapperListItemNode(containingListItem)) {
        // Semantic representation: the containing item renders its own
        // content, so it is itself the previous row.
        endListItemNode = containingListItem;
        break;
      }
      probe = containingListItem;
    }

    if (endListItemNode === null) {
      if (listItemNode.getIndent() > 0) {
        listItemNode.setIndent(0);
      }
    } else {
      const endListNode = endListItemNode.getParent();

      if ($isListNode(endListNode)) {
        const prevDepth = $getListDepth(endListNode);
        const depth = $getListDepth(listNode);

        if (prevDepth + 1 < depth) {
          listItemNode.setIndent(prevDepth);
        }
      }
    }
  };

  const $processListWithStrictIndent = (listNode: ListNode): void => {
    const queue: ListNode[] = [listNode];

    while (queue.length > 0) {
      const node = queue.shift();
      if (!$isListNode(node)) {
        continue;
      }

      for (
        let child = node.getFirstChild();
        child !== null;
        child = child.getNextSibling()
      ) {
        if ($isListItemNode(child)) {
          $formatListIndentStrict(child);

          for (
            let grandchild = child.getFirstChild();
            grandchild !== null;
            grandchild = grandchild.getNextSibling()
          ) {
            if ($isListNode(grandchild)) {
              queue.push(grandchild);
            }
          }
        }
      }
    }
  };

  return editor.registerNodeTransform(ListNode, $processListWithStrictIndent);
}

function $findChildrenEndListItemNode(
  listItemNode: ListItemNode,
): ListItemNode {
  let current = listItemNode;

  // Descend through nested lists: the sole child of a wrapper item, or the
  // last nested list trailing an item's content (semantic representation).
  // Scan the child links backward from the end — the last nested list is at
  // (or near) the tail in both representations.
  while (true) {
    let lastNestedList = null;
    for (
      let child = current.getLastChild();
      child !== null;
      child = child.getPreviousSibling()
    ) {
      if ($isListNode(child)) {
        lastNestedList = child;
        break;
      }
    }
    const lastChild = lastNestedList ? lastNestedList.getLastChild() : null;
    if ($isListItemNode(lastChild)) {
      current = lastChild;
    } else {
      break;
    }
  }

  return current;
}

/**
 * #5072: When the first list item of a top-level list is adjacent to a
 * non-isolated decorator that is either keyboard-selectable or a block, and
 * the caret sits at the start of that list item, Backspace previously fell
 * through `deleteCharacter`'s merge-block path and deleted the decorator
 * outright. Convert the first list item into a paragraph inserted before the
 * list instead, keeping the decorator and the list item's content intact.
 */
function $handleListItemBackspaceAdjacentToDecorator(): boolean {
  const selection = $getSelection();
  if (
    !$isRangeSelection(selection) ||
    !selection.isCollapsed() ||
    selection.anchor.offset !== 0
  ) {
    return false;
  }
  const anchorNode = selection.anchor.getNode();
  const listItem = $findMatchingParent(anchorNode, $isListItemNode);
  if (!$isListItemNode(listItem)) {
    return false;
  }
  // Empty list item: defer to deleteCharacter's merge-next-block + decorator
  // branch in LexicalSelection.ts, which already removes the empty element and
  // places a NodeSelection on the adjacent decorator.
  const firstDescendant = listItem.getFirstDescendant();
  if (firstDescendant === null) {
    return false;
  }
  // The caret must be at the very start of the list item — either the anchor
  // is the list item itself, or it is the list item's first descendant.
  if (!listItem.is(anchorNode) && !firstDescendant.is(anchorNode)) {
    return false;
  }
  const list = listItem.getParent();
  if (!$isListNode(list) || !listItem.is(list.getFirstChild())) {
    return false;
  }
  // Nested lists fall through: their parent is a ListItemNode, not a
  // DecoratorNode, so the previous-sibling check below returns false and the
  // existing outdent path runs.
  const previousBlock = list.getPreviousSibling();
  if (
    !$isDecoratorNode(previousBlock) ||
    previousBlock.isIsolated() ||
    !(previousBlock.isKeyboardSelectable() || !previousBlock.isInline())
  ) {
    return false;
  }
  // Demote the first list item to a paragraph and slot it in before the list.
  const paragraph = $createParagraphNode().append(...listItem.getChildren());
  list.insertBefore(paragraph);
  listItem.remove();
  if (list.isEmpty()) {
    list.remove();
  }
  paragraph.selectStart();
  return true;
}
