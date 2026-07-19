/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {Signal} from '@lexical/extension';

import {calculateZoomLevel} from '@lexical/utils';
import {
  $addUpdateTag,
  $findMatchingParent,
  $getNearestNodeFromDOMNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  createCommand,
  getActiveElement,
  getNearestEditorFromDOMNode,
  getParentElement,
  isHTMLElement,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_SPACE_COMMAND,
  type LexicalCommand,
  type LexicalEditor,
  mergeRegister,
  registerEventListener,
  registerEventListeners,
  SKIP_DOM_SELECTION_TAG,
  SKIP_SELECTION_FOCUS_TAG,
} from 'lexical';

import {$insertList} from './formatList';
import {
  $isListItemNode,
  getListItemCheckboxDOM,
  getListItemFocusTarget,
  type ListItemNode,
} from './LexicalListItemNode';
import {
  $getAllListItems,
  $getTopListNode,
  $isCheckList,
  $isEmptiedHostRow,
} from './utils';

/**
 * The <li> whose native checkbox input (semantic nesting mode) is `target`,
 * or `null` when `target` is not such an input.
 */
function getCheckboxInputRow(target: EventTarget | null): HTMLElement | null {
  if (isHTMLElement(target) && target.nodeName === 'INPUT') {
    const listItemElement = getParentElement(target);
    if (
      isHTMLElement(listItemElement) &&
      getListItemCheckboxDOM(listItemElement) === target
    ) {
      return listItemElement;
    }
  }
  return null;
}

export const INSERT_CHECK_LIST_COMMAND: LexicalCommand<void> =
  /* @__PURE__ */ createCommand('INSERT_CHECK_LIST_COMMAND');

/**
 * Registers the checklist plugin with the editor.
 * @param editor The LexicalEditor instance.
 * @param options Optional configuration.
 *   - disableTakeFocusOnClick: If true, clicking a checklist item will not focus the editor (useful for mobile).
 */
export function registerCheckList(
  editor: LexicalEditor,
  options?: {disableTakeFocusOnClick?: boolean | Signal<boolean>},
) {
  const disableTakeFocusOnClick =
    (options && options.disableTakeFocusOnClick) || false;
  const peekDisableTakeFocusOnClick =
    typeof disableTakeFocusOnClick === 'boolean'
      ? () => disableTakeFocusOnClick
      : disableTakeFocusOnClick.peek.bind(disableTakeFocusOnClick);

  // Mobile tap fix: the touchstart listener registered below calls
  // event.preventDefault() to keep the caret away from the marker. On iOS
  // Safari and Android Chrome that suppression also cancels the synthesized
  // click, so handleClick never runs and the checkbox cannot be toggled by
  // tap. We additionally listen for pointerup with pointerType === 'touch'
  // and run the same toggle logic, deduplicating against any click that
  // does fire on browsers where preventDefault doesn't suppress it.
  //
  // Dedup state is per-target: recorded as `__lexicalCheckListLastHandled`
  // on the target element. A global window would
  // block tapping a second checkbox within 500ms of toggling the first.
  const DEDUP_WINDOW_MS = 500;
  const isWithinDedupWindow = (
    event: PointerEvent | MouseEvent | TouchEvent,
  ): boolean => {
    const target = event.target;
    if (!isHTMLElement(target)) {
      return false;
    }
    // @ts-ignore internal field
    const last = target.__lexicalCheckListLastHandled as number | undefined;
    return last !== undefined && event.timeStamp - last < DEDUP_WINDOW_MS;
  };
  // Drop the dedup record from a target, if any. Used both when a paired
  // click consumes it and when a later activation must clear a stale one.
  const clearDedupRecord = (target: EventTarget | null) => {
    if (isHTMLElement(target)) {
      // @ts-ignore internal field
      delete target.__lexicalCheckListLastHandled;
    }
  };
  // The record pairs one handled touch pointerup with the one click the
  // browser synthesizes right after it; consuming it on that click keeps
  // later legitimate activations within the window (a follow-up Space
  // press or mouse click on the same checkbox) from being swallowed.
  const consumeDedupRecord = (
    event: PointerEvent | MouseEvent | TouchEvent,
  ): boolean => {
    if (!isWithinDedupWindow(event)) {
      return false;
    }
    clearDedupRecord(event.target);
    return true;
  };
  const recordHandled = (event: PointerEvent | MouseEvent | TouchEvent) => {
    const target = event.target;
    if (isHTMLElement(target)) {
      // @ts-ignore internal field
      target.__lexicalCheckListLastHandled = event.timeStamp;
    }
  };
  const configHandleClick = (event: PointerEvent | MouseEvent | TouchEvent) => {
    if (consumeDedupRecord(event)) {
      // Already handled at pointerup. A click on the row's native checkbox
      // input (semantic nesting mode) would still apply the browser's own
      // toggle on top of the editor's — suppress it. (preventDefault makes
      // the browser revert the input to its pre-click state.)
      if (getCheckboxInputRow(event.target) !== null) {
        event.preventDefault();
      }
      return;
    }
    // No recordHandled here: the dedup record exists to pair a handled touch
    // pointerup with the click the browser synthesizes right after it.
    // Recording plain clicks too would swallow legitimate activations that
    // follow within the window — a rapid second mouse click, or the click
    // synthesized when Space activates the row's native checkbox input.
    handleClick(event, peekDisableTakeFocusOnClick());
  };
  const configHandlePointerUp = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') {
      return;
    }
    if (isWithinDedupWindow(event)) {
      return;
    }
    recordHandled(event);
    handleClick(event, peekDisableTakeFocusOnClick());
  };
  const configHandleSelectDefaults = (
    event: PointerEvent | MouseEvent | TouchEvent,
  ) => {
    handleSelectDefaults(event, peekDisableTakeFocusOnClick());
  };
  return mergeRegister(
    editor.registerCommand(
      INSERT_CHECK_LIST_COMMAND,
      () => {
        $insertList('check');
        return true;
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_DOWN_COMMAND,
      event => {
        return handleArrowUpOrDown(event, editor, false);
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_UP_COMMAND,
      event => {
        return handleArrowUpOrDown(event, editor, true);
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_ESCAPE_COMMAND,
      () => {
        const activeItem = getActiveCheckListItem(editor);

        if (activeItem != null) {
          const rootElement = editor.getRootElement();

          if (rootElement != null) {
            rootElement.focus();
          }

          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_SPACE_COMMAND,
      event => {
        const activeItem = getActiveCheckListItem(editor);

        if (activeItem != null && editor.isEditable()) {
          const checkboxInput = getListItemCheckboxDOM(activeItem);
          if (
            checkboxInput !== null &&
            checkboxInput === getActiveElement(activeItem)
          ) {
            // The row's native checkbox input (semantic nesting mode) is
            // focused: Space activates the input itself, and the resulting
            // click event is routed through the editor by handleClick. A
            // stale dedup record from a touch tap whose synthesized click
            // never arrived would swallow that click — clear it first.
            clearDedupRecord(checkboxInput);
            return false;
          }
          editor.update(() => {
            const listItemNode = $getNearestNodeFromDOMNode(activeItem);

            if ($isListItemNode(listItemNode)) {
              event.preventDefault();
              listItemNode.toggleChecked();
            }
          });
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_LEFT_COMMAND,
      event => {
        return editor.read('latest', () => {
          const selection = $getSelection();

          if ($isRangeSelection(selection) && selection.isCollapsed()) {
            const {anchor} = selection;
            const isElement = anchor.type === 'element';

            if (isElement || anchor.offset === 0) {
              const anchorNode = anchor.getNode();
              const elementNode = $findMatchingParent(
                anchorNode,
                node => $isElementNode(node) && !node.isInline(),
              );
              if ($isListItemNode(elementNode)) {
                const parent = elementNode.getParent();
                if (
                  $isCheckList(parent) &&
                  (isElement || elementNode.getFirstDescendant() === anchorNode)
                ) {
                  const domNode = editor.getElementByKey(elementNode.__key);

                  if (domNode != null) {
                    // Focus mode lives on the row's native checkbox input
                    // when it renders one (semantic nesting mode), on the li
                    // itself otherwise. getActiveElement rather than
                    // document.activeElement, which reports the shadow host
                    // in a shadow root (so this would otherwise always
                    // re-focus and swallow the arrow key).
                    const focusTarget = getListItemFocusTarget(domNode);
                    if (getActiveElement(domNode) !== focusTarget) {
                      focusTarget.focus();
                      event.preventDefault();
                      return true;
                    }
                  }
                }
              }
            }
          }

          return false;
        });
      },
      COMMAND_PRIORITY_LOW,
    ),

    editor.registerRootListener(rootElement => {
      if (rootElement !== null) {
        return mergeRegister(
          registerEventListeners(rootElement, {
            click: configHandleClick,
            pointerup: configHandlePointerUp,
          }),
          // Use capture so we run before other listeners that might move focus.
          // Some browsers / integrations still generate mousedown events as well
          // as pointerdown, so handle both.
          registerEventListeners(
            rootElement,
            {
              mousedown: configHandleSelectDefaults,
              pointerdown: configHandleSelectDefaults,
            },
            {capture: true},
          ),
          // Intercept touchstart to stop the mobile browser from placing the
          // caret and opening the keyboard when tapping the checklist marker.
          // passive:false lets the handler call preventDefault, so it needs its
          // own options and can't share the capture-only group above.
          registerEventListener(
            rootElement,
            'touchstart',
            configHandleSelectDefaults,
            {
              capture: true,
              passive: false,
            },
          ),
        );
      }
    }),
  );
}

function handleCheckItemEvent(
  event: PointerEvent | MouseEvent | TouchEvent,
  callback: () => void,
) {
  const target = event.target;

  if (!isHTMLElement(target)) {
    return;
  }

  // A row's native checkbox input (semantic nesting mode) IS the checkbox:
  // no marker geometry to measure, the hit test is the input itself.
  if (getCheckboxInputRow(target) !== null) {
    callback();
    return;
  }

  // Only rows that render a checkbox are toggleable. $updateListItemChecked
  // stamps aria-checked on exactly those <li>s in both modes (ARIA
  // emulation and native input) and strips it from dedicated wrapper
  // items, so this single mode-neutral check covers rows where a theme
  // draws a ::before marker whose area must stay clickable. Trust the
  // reconciler-written DOM rather than inferring from child shape — a row
  // emptied of its inline content has a list as its first Lexical child
  // but still renders a checkbox.
  if (!target.hasAttribute('aria-checked')) {
    return;
  }

  const parentNode = target.parentNode;

  // @ts-ignore internal field
  if (!parentNode || parentNode.__lexicalListType !== 'check') {
    return;
  }
  let clientX: number | null = null;
  let pointerType: string | null = null;

  if ('clientX' in event) {
    clientX = event.clientX;
  } else if ('touches' in event) {
    const touches = event.touches;
    if (touches.length > 0) {
      clientX = touches[0].clientX;
      pointerType = 'touch';
    }
  }

  // If we couldn't resolve a clientX (unexpected input), bail out.
  if (clientX == null) {
    return;
  }

  const rect = target.getBoundingClientRect();
  const zoom = calculateZoomLevel(target);
  const clientXInPixels = clientX / zoom;

  // Use getComputedStyle if available, otherwise fallback to 0px width
  const targetView = target.ownerDocument.defaultView;
  const beforeStyles = targetView
    ? targetView.getComputedStyle(target, '::before')
    : ({width: '0px'} as CSSStyleDeclaration);
  const beforeWidthInPixels = parseFloat(beforeStyles.width);

  // Make click area slightly larger for touch devices to improve accessibility
  // Determine whether this is a touch event; some environments may supply
  // pointerType on PointerEvent while touch events use the `touches` API above.
  const isTouchEvent =
    pointerType === 'touch' ||
    ('pointerType' in event && event.pointerType === 'touch');
  const clickAreaPadding = isTouchEvent ? 32 : 0; // Add 32px padding for touch events

  if (
    target.dir === 'rtl'
      ? clientXInPixels < rect.right + clickAreaPadding &&
        clientXInPixels > rect.right - beforeWidthInPixels - clickAreaPadding
      : clientXInPixels > rect.left - clickAreaPadding &&
        clientXInPixels < rect.left + beforeWidthInPixels + clickAreaPadding
  ) {
    callback();
  }
}

function handleClick(
  event: PointerEvent | MouseEvent | TouchEvent,
  disableFocusOnClick: boolean,
) {
  handleCheckItemEvent(event, () => {
    if (isHTMLElement(event.target)) {
      const domNode = event.target;
      const editor = getNearestEditorFromDOMNode(domNode);

      if (editor != null && editor.isEditable()) {
        // When the target is the row's native checkbox input, the browser's
        // own toggle is left to run: the editor toggle below writes the same
        // value through the reconciler, keeping the two in agreement.
        // (Suppressing it instead does not work — preventDefault makes the
        // browser revert the input after dispatch, clobbering the
        // reconciler's write.)
        editor.update(() => {
          const node = $getNearestNodeFromDOMNode(domNode);

          if ($isListItemNode(node)) {
            if (disableFocusOnClick) {
              $addUpdateTag(SKIP_SELECTION_FOCUS_TAG);
              $addUpdateTag(SKIP_DOM_SELECTION_TAG);
            } else {
              // A click that hit the li (themed marker area) still moves
              // focus mode onto the row's native input when it renders one;
              // for a click on the input itself the target is the input and
              // it keeps focus.
              getListItemFocusTarget(domNode).focus();
            }
            node.toggleChecked();
          }
        });
      } else if (getCheckboxInputRow(domNode) !== null) {
        // No editable editor to route through: revert the native toggle so
        // the input keeps reflecting the (unchanged) editor state.
        event.preventDefault();
      }
    }
  });
}

/**
 * Prevents default focus switch behavior
 *
 * @param event might be of type PointerEvent, MouseEvent, or TouchEvent, hence the generic Event type
 *
 */
function handleSelectDefaults(
  event: PointerEvent | MouseEvent | TouchEvent,
  disableTakeFocusOnClick: boolean,
) {
  handleCheckItemEvent(event, () => {
    // Prevents caret moving when clicking on check mark.
    event.preventDefault();
    if (disableTakeFocusOnClick) {
      event.stopPropagation();
    }
  });
}

function getActiveCheckListItem(editor: LexicalEditor): HTMLElement | null {
  // getActiveElement scoped to the editor's root rather than
  // document.activeElement, which reports the shadow host when the editor is
  // in a shadow root (so the focused <li> would otherwise be invisible here).
  const rootElement = editor.getRootElement();
  let activeElement = rootElement ? getActiveElement(rootElement) : null;

  // Focus mode lives on the row's native checkbox input when it renders one
  // (semantic nesting mode); resolve it to its <li>.
  const inputRow = getCheckboxInputRow(activeElement);
  if (inputRow !== null) {
    activeElement = inputRow;
  }

  return isHTMLElement(activeElement) &&
    activeElement.tagName === 'LI' &&
    activeElement.parentNode != null &&
    // @ts-ignore internal field
    activeElement.parentNode.__lexicalListType === 'check'
    ? activeElement
    : null;
}

/**
 * Whether the item renders a checkbox row of its own ($getAllListItems
 * already excludes dedicated wrapper items).
 */
function $isCheckRow(node: ListItemNode): boolean {
  return $isCheckList(node.getParent());
}

/**
 * The nearest checkbox row before/after `node` in visual order within its
 * top-level list. Walking the flattened row list ($getAllListItems returns
 * every rendered row in visual/document order, for both representations)
 * handles every nesting shape uniformly: semantic hosts with several
 * nested lists, rows emptied of their content, and check rows nested below
 * lists of other types.
 *
 * @internal exported for unit tests
 */
export function $findCheckListItemSibling(
  node: ListItemNode,
  backward: boolean,
): ListItemNode | null {
  const rows = $getAllListItems($getTopListNode(node));
  const index = rows.findIndex(row => row.is(node));
  if (index === -1) {
    return null;
  }
  const step = backward ? -1 : 1;
  for (let i = index + step; i >= 0 && i < rows.length; i += step) {
    if ($isCheckRow(rows[i])) {
      return rows[i];
    }
  }
  return null;
}

function handleArrowUpOrDown(
  event: KeyboardEvent,
  editor: LexicalEditor,
  backward: boolean,
) {
  const activeItem = getActiveCheckListItem(editor);

  if (activeItem != null) {
    editor.update(() => {
      const listItem = $getNearestNodeFromDOMNode(activeItem);

      if (!$isListItemNode(listItem)) {
        return;
      }

      const nextListItem = $findCheckListItemSibling(listItem, backward);

      if (nextListItem != null) {
        if ($isEmptiedHostRow(nextListItem)) {
          // An emptied host row: selectStart() would descend into the
          // first nested row's text; anchor the selection on the row
          // itself so selection and checkbox focus agree.
          nextListItem.select(0, 0);
        } else {
          nextListItem.selectStart();
        }
        const dom = editor.getElementByKey(nextListItem.__key);

        if (dom != null) {
          // The row's native checkbox input carries focus mode when it
          // renders one (semantic nesting mode).
          const focusTarget = getListItemFocusTarget(dom);
          event.preventDefault();
          setTimeout(() => {
            focusTarget.focus();
          }, 0);
        }
      }
    });
  }

  return false;
}
