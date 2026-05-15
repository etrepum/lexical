/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $caretRangeFromSelection,
  $getCaretRange,
  $getCaretRangeInDirection,
  $getChildCaret,
  $getEditor,
  $getPreviousSelection,
  $getSelection,
  $getSiblingCaret,
  $isChildCaret,
  $isElementNode,
  $isLineBreakNode,
  $isRangeSelection,
  $isSiblingCaret,
  $isTextPointCaret,
  $normalizeCaret,
  $rewindSiblingCaret,
  $setSelectionFromCaretRange,
  $updateDOMSelection,
  COMMAND_PRIORITY_BEFORE_CRITICAL,
  defineExtension,
  getDOMSelection,
  mergeRegister,
  safeCast,
  SELECTION_CHANGE_COMMAND,
  SKIP_SCROLL_INTO_VIEW_TAG,
  SKIP_SELECTION_FOCUS_TAG,
} from 'lexical';

import {namedSignals} from './namedSignals';
import {effect} from './signals';

export interface NormalizeTripleClickSelectionConfig {
  disabled: boolean;
}

const SKIP_TAGS = new Set([
  SKIP_SELECTION_FOCUS_TAG,
  SKIP_SCROLL_INTO_VIEW_TAG,
]);

function $fixFocusOverselection() {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return;
  }
  if (!selection.isCollapsed()) {
    // Triple click causing selection to overflow into the nearest element. In that
    // case visually it looks like a single element content is selected, focus node
    // is actually at the beginning of the next element (if present) and any manipulations
    // with selection (formatting) are affecting second element as well
    const range = $getCaretRangeInDirection(
      $caretRangeFromSelection(selection),
      'next',
    );
    let focusCaret = range.focus;
    // Move it out of the next TextNode if none of it is selected
    if (
      $isTextPointCaret(focusCaret) &&
      range.anchor.origin !== focusCaret.origin &&
      focusCaret.offset === 0
    ) {
      focusCaret = $rewindSiblingCaret(focusCaret.getSiblingCaret());
    }
    // Move it behind a single LineBreakNode
    if (
      $isSiblingCaret(focusCaret) &&
      range.anchor.origin !== focusCaret.origin &&
      $isLineBreakNode(focusCaret.origin)
    ) {
      focusCaret = $rewindSiblingCaret(focusCaret);
    }
    // Move the focus out of the start of any elements
    while (
      $isChildCaret(focusCaret) &&
      range.anchor.origin !== focusCaret.origin
    ) {
      focusCaret = $rewindSiblingCaret(
        $getSiblingCaret(focusCaret.origin, 'next'),
      );
    }
    if (focusCaret !== range.focus) {
      // Move it inside the containing element
      if ($isSiblingCaret(focusCaret) && $isElementNode(focusCaret.origin)) {
        focusCaret = $normalizeCaret(
          $getChildCaret(focusCaret.origin, 'previous'),
        ).getFlipped();
      }
      const sel = $setSelectionFromCaretRange(
        $getCaretRange(range.anchor, $normalizeCaret(focusCaret)),
      );
      const editor = $getEditor();
      const rootElement = editor.getRootElement();
      const domSelection =
        rootElement && getDOMSelection(rootElement.ownerDocument.defaultView);
      if (domSelection) {
        $updateDOMSelection(
          $getPreviousSelection(),
          sel,
          $getEditor(),
          domSelection,
          SKIP_TAGS,
          rootElement,
        );
      }
    }
  }
}

/**
 * This extension removes empty inline nodes from the EditorState.
 * This extension is designed to facilitate a smooth migration from
 * the plugin API with the option to disable it, but it may be removed
 * in the future and integrated into the core
 */
export const NormalizeTripleClickSelectionExtension = defineExtension({
  build: (editor, config, state) => namedSignals(config),
  config: safeCast<NormalizeTripleClickSelectionConfig>({
    disabled: false,
  }),
  name: '@lexical/NormalizeTripleClickSelection',
  register: (editor, config, state) =>
    effect(() => {
      const stores = state.getOutput();
      if (stores.disabled.value) {
        return;
      }
      return editor.registerRootListener(rootElement => {
        if (!rootElement) {
          return;
        }
        let willTripleClick = false;
        const onMouseUp = (event: MouseEvent) => {
          const {ownerDocument} = rootElement;
          const {defaultView} = ownerDocument;
          if (!defaultView || !willTripleClick || event.detail !== 3) {
            return;
          }
          queueMicrotask(() => {
            willTripleClick = false;
          });
        };
        const onMouseDown = (event: MouseEvent) => {
          const {ownerDocument} = rootElement;
          const {defaultView} = ownerDocument;
          if (!defaultView || event.detail !== 3) {
            return;
          }
          willTripleClick = defaultView != null && event.detail === 3;
        };
        return mergeRegister(
          editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            () => {
              if (willTripleClick) {
                willTripleClick = false;
                $fixFocusOverselection();
              }
              return false;
            },
            COMMAND_PRIORITY_BEFORE_CRITICAL,
          ),
          (() => {
            rootElement.addEventListener('mouseup', onMouseUp, true);
            rootElement.addEventListener('mousedown', onMouseDown, true);
            return () => {
              rootElement.removeEventListener('mouseup', onMouseUp, true);
              rootElement.removeEventListener('mousedown', onMouseDown, true);
            };
          })(),
        );
      });
    }),
});
