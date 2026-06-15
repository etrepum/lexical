/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  BaseSelection,
  DecoratorNode,
  ElementNode,
  LexicalNode,
  NodeKey,
  Point,
  RangeSelection,
  TextNode,
} from 'lexical';

import {
  $caretFromPoint,
  $extendCaretToRange,
  $findMatchingParent,
  $isChildCaret,
  $isDecoratorNode,
  $isElementNode,
  $isExtendableTextPointCaret,
  $isRangeSelection,
  $isTextNode,
  getStyleObjectFromCSS,
  INTERNAL_$isBlock,
} from 'lexical';

import {$getComputedStyleForElement, $getComputedStyleForParent} from './utils';

export function $copyBlockFormatIndent(
  srcNode: ElementNode,
  destNode: ElementNode,
): void {
  const format = srcNode.getFormatType();
  const indent = srcNode.getIndent();
  if (format !== destNode.getFormatType()) {
    destNode.setFormat(format);
  }
  if (indent !== destNode.getIndent()) {
    destNode.setIndent(indent);
  }
}

function $isPointAtBlockStart(point: Point, block: ElementNode): boolean {
  if (point.offset !== 0) {
    return false;
  }
  let node: LexicalNode = point.getNode();
  // When an ElementNode is empty it's not possible to distinguish if
  // the selection's intent is the entire block or the edge so we consider
  // it to be the entire block
  if ($isElementNode(node) && node.isEmpty()) {
    return false;
  }
  while (!node.is(block)) {
    if (node.getPreviousSibling() !== null) {
      return false;
    }
    const parent = node.getParent();
    if (parent === null) {
      return false;
    }
    node = parent;
  }
  return true;
}

/**
 * Converts all nodes in the selection that are of one block type to another.
 * @param selection - The selected blocks to be converted.
 * @param $createElement - The function that creates the node. eg. $createParagraphNode.
 * @param $afterCreateElement - The function that updates the new node based on the previous one ($copyBlockFormatIndent by default)
 */
export function $setBlocksType<T extends ElementNode>(
  selection: BaseSelection | null,
  $createElement: () => T,
  $afterCreateElement: (
    prevNodeSrc: ElementNode,
    newNodeDest: T,
  ) => void = $copyBlockFormatIndent,
): void {
  if (!selection) {
    return;
  }
  // Selections tend to not include their containing blocks so we effectively
  // expand it here
  const anchorAndFocus = selection.getStartEndPoints();
  let skipFocusAtBlockStart = false;
  let focusBlock: ElementNode | DecoratorNode<unknown> | null = null;
  const blockMap = new Map<NodeKey, ElementNode>();
  if (anchorAndFocus) {
    const [anchor, focus] = anchorAndFocus;
    const anchorBlock = $findMatchingParent(
      anchor.getNode(),
      INTERNAL_$isBlock,
    );
    focusBlock = $findMatchingParent(focus.getNode(), INTERNAL_$isBlock);
    skipFocusAtBlockStart =
      $isElementNode(focusBlock) &&
      !focusBlock.is(anchorBlock) &&
      $isPointAtBlockStart(focus, focusBlock);
    if ($isElementNode(anchorBlock)) {
      blockMap.set(anchorBlock.getKey(), anchorBlock);
    }
    if ($isElementNode(focusBlock) && !skipFocusAtBlockStart) {
      blockMap.set(focusBlock.getKey(), focusBlock);
    }
  }
  for (const node of selection.getNodes()) {
    if ($isElementNode(node) && INTERNAL_$isBlock(node)) {
      if (skipFocusAtBlockStart && node.is(focusBlock)) {
        continue;
      }
      blockMap.set(node.getKey(), node);
    } else if (!anchorAndFocus) {
      const ancestorBlock = $findMatchingParent(node, INTERNAL_$isBlock);
      if ($isElementNode(ancestorBlock)) {
        blockMap.set(ancestorBlock.getKey(), ancestorBlock);
      }
    }
  }
  // Selection remapping is delegated to LexicalNode.replace (and the
  // ListItemNode.replace override): both remap an element-anchored point
  // on the replaced block to {key: replacement, offset: prevSize + offset}.
  for (const prevNode of blockMap.values()) {
    const element = $createElement();
    $afterCreateElement(prevNode, element);
    prevNode.replace(element, true);
  }
}

/**
 * Tests if the selection's parent element has vertical writing mode.
 * @param selection - The selection whose parent to test.
 * @returns true if the selection's parent has vertical writing mode (writing-mode: vertical-rl), false otherwise.
 */
function $isEditorVerticalOrientation(selection: RangeSelection): boolean {
  const computedStyle = $getComputedStyle(selection);
  return computedStyle !== null && computedStyle.writingMode === 'vertical-rl';
}

/**
 * Gets the computed DOM styles of the parent of the selection's anchor node.
 * @param selection - The selection to check the styles for.
 * @returns the computed styles of the node or null if there is no DOM element or no default view for the document.
 */
function $getComputedStyle(
  selection: RangeSelection,
): CSSStyleDeclaration | null {
  const anchorNode = selection.anchor.getNode();
  if ($isElementNode(anchorNode)) {
    return $getComputedStyleForElement(anchorNode);
  }
  return $getComputedStyleForParent(anchorNode);
}

/**
 * Determines if the default character selection should be overridden. Used with DecoratorNodes
 * @param selection - The selection whose default character selection may need to be overridden.
 * @param isBackward - Is the selection backwards (the focus comes before the anchor)?
 * @returns true if it should be overridden, false if not.
 */
export function $shouldOverrideDefaultCharacterSelection(
  selection: RangeSelection,
  isBackward: boolean,
): boolean {
  const isVertical = $isEditorVerticalOrientation(selection);

  // In vertical writing mode, we adjust the direction for correct caret movement
  let adjustedIsBackward = isVertical ? !isBackward : isBackward;

  // In right-to-left writing mode, we invert the direction for correct caret movement
  if ($isParentElementRTL(selection)) {
    adjustedIsBackward = !adjustedIsBackward;
  }

  const focusCaret = $caretFromPoint(
    selection.focus,
    adjustedIsBackward ? 'previous' : 'next',
  );
  if ($isExtendableTextPointCaret(focusCaret)) {
    return false;
  }
  for (const nextCaret of $extendCaretToRange(focusCaret)) {
    if ($isChildCaret(nextCaret)) {
      return !nextCaret.origin.isInline();
    } else if ($isElementNode(nextCaret.origin)) {
      continue;
    } else if ($isDecoratorNode(nextCaret.origin)) {
      return true;
    }
    break;
  }
  return false;
}

/**
 * Moves the selection according to the arguments.
 * @param selection - The selected text or nodes.
 * @param isHoldingShift - Is the shift key being held down during the operation.
 * @param isBackward - Is the selection selected backwards (the focus comes before the anchor)?
 * @param granularity - The distance to adjust the current selection.
 */
export function $moveCaretSelection(
  selection: RangeSelection,
  isHoldingShift: boolean,
  isBackward: boolean,
  granularity: 'character' | 'word' | 'lineboundary',
): void {
  selection.modify(isHoldingShift ? 'extend' : 'move', isBackward, granularity);
}

/**
 * Tests a parent element for right to left direction.
 * @param selection - The selection whose parent is to be tested.
 * @returns true if the selections' parent element has a direction of 'rtl' (right to left), false otherwise.
 */
export function $isParentElementRTL(selection: RangeSelection): boolean {
  const computedStyle = $getComputedStyle(selection);
  return computedStyle !== null && computedStyle.direction === 'rtl';
}

/**
 * Moves selection by character according to arguments.
 * @param selection - The selection of the characters to move.
 * @param isHoldingShift - Is the shift key being held down during the operation.
 * @param isBackward - Is the selection backward (the focus comes before the anchor)?
 */
export function $moveCharacter(
  selection: RangeSelection,
  isHoldingShift: boolean,
  isBackward: boolean,
): void {
  const isRTL = $isParentElementRTL(selection);
  const isVertical = $isEditorVerticalOrientation(selection);

  // In vertical-rl writing mode, arrow key directions need to be flipped
  // to match the visual flow of text (top to bottom, right to left)
  let adjustedIsBackward;

  if (isVertical) {
    // In vertical-rl mode, we need to completely invert the direction
    // Left arrow (backward) should move down (forward)
    // Right arrow (forward) should move up (backward)
    adjustedIsBackward = !isBackward;
  } else if (isRTL) {
    // In horizontal RTL mode, use the standard RTL behavior
    adjustedIsBackward = !isBackward;
  } else {
    // Standard LTR horizontal text
    adjustedIsBackward = isBackward;
  }

  // Apply the direction adjustment to move the caret
  $moveCaretSelection(
    selection,
    isHoldingShift,
    adjustedIsBackward,
    'character',
  );
}

/**
 * Returns the current value of a CSS property for Nodes, if set. If not set, it returns the defaultValue.
 * @param node - The node whose style value to get.
 * @param styleProperty - The CSS style property.
 * @param defaultValue - The default value for the property.
 * @returns The value of the property for node.
 */
function $getNodeStyleValueForProperty(
  node: TextNode,
  styleProperty: string,
  defaultValue: string,
): string {
  const css = node.getStyle();
  const styleObject = getStyleObjectFromCSS(css);

  if (styleObject !== null) {
    return styleObject[styleProperty] || defaultValue;
  }

  return defaultValue;
}

/**
 * Returns the current value of a CSS property for TextNodes in the Selection, if set. If not set, it returns the defaultValue.
 * If all TextNodes do not have the same value, it returns an empty string.
 * @param selection - The selection of TextNodes whose value to find.
 * @param styleProperty - The CSS style property.
 * @param defaultValue - The default value for the property, defaults to an empty string.
 * @returns The value of the property for the selected TextNodes.
 */
export function $getSelectionStyleValueForProperty(
  selection: BaseSelection,
  styleProperty: string,
  defaultValue = '',
): string {
  let styleValue: string | null = null;
  const nodes = selection.getNodes();

  // The anchor/focus boundary handling below is specific to RangeSelection;
  // other selection types (e.g. table) style every node they contain.
  let startNode: LexicalNode | undefined;
  let endNode: LexicalNode | undefined;
  if ($isRangeSelection(selection)) {
    if (selection.isCollapsed() && selection.style !== '') {
      const styleObject = getStyleObjectFromCSS(selection.style);

      if (styleObject !== null && styleProperty in styleObject) {
        return styleObject[styleProperty];
      }
    }
    const {anchor, focus} = selection;
    const isBackward = selection.isBackward();
    const firstNode = isBackward ? focus.getNode() : anchor.getNode();
    const lastNode = isBackward ? anchor.getNode() : focus.getNode();
    const startOffset = isBackward ? focus.offset : anchor.offset;
    const endOffset = isBackward ? anchor.offset : focus.offset;
    // A boundary node contributes no styled text when the selection merely
    // touches its edge: the first node when the start offset is at its very
    // end, and the last node when the end offset is at its very beginning.
    if (
      $isTextNode(firstNode) &&
      startOffset === firstNode.getTextContentSize()
    ) {
      startNode = firstNode;
    }
    if (endOffset === 0) {
      endNode = lastNode;
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    // Skip the excluded boundary node for this position (startNode at the
    // head, endNode elsewhere); both are undefined when nothing is excluded.
    if ($isTextNode(node) && !node.is(i === 0 ? startNode : endNode)) {
      const nodeStyleValue = $getNodeStyleValueForProperty(
        node,
        styleProperty,
        defaultValue,
      );

      if (styleValue === null) {
        styleValue = nodeStyleValue;
      } else if (styleValue !== nodeStyleValue) {
        // multiple text nodes are in the selection and they don't all
        // have the same style.
        styleValue = '';
        break;
      }
    }
  }

  return styleValue === null ? defaultValue : styleValue;
}
