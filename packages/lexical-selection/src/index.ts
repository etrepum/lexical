/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {getStyleObjectFromCSS as getStyleObjectFromCSS_} from 'lexical';

export {
  $addNodeStyle,
  $ensureForwardRangeSelection,
  $forEachSelectedTextNode,
  $isAtNodeEnd,
  $patchStyleText,
  $sliceSelectedTextNodeContent,
  $trimTextContentFromAnchor,
} from './lexical-node';
export {
  $copyBlockFormatIndent,
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $moveCaretSelection,
  $moveCharacter,
  $setBlocksType,
  $shouldOverrideDefaultCharacterSelection,
} from './range-selection';
export {
  $getComputedStyleForElement,
  $getComputedStyleForParent,
  $isParentRTL,
  createDOMRange,
  createRectsFromDOMRange,
  getCSSFromStyleObject,
} from './utils';
/** @deprecated moved to the `lexical` package */
export const getStyleObjectFromCSS = getStyleObjectFromCSS_;
