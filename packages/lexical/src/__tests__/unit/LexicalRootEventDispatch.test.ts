/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {buildEditorFromExtensions} from '@lexical/extension';
import {
  type AnyLexicalCommand,
  BLUR_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COPY_COMMAND,
  CUT_COMMAND,
  DRAGEND_COMMAND,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  FOCUS_COMMAND,
  type LexicalEditor,
  PASTE_COMMAND,
} from 'lexical';
import {describe, expect, onTestFinished, test, vi} from 'vitest';

function mount(editor: LexicalEditor): HTMLElement {
  const root = document.createElement('div');
  document.body.appendChild(root);
  onTestFinished(() => root.remove());
  editor.setRootElement(root);
  return root;
}

describe.each([true, false])('root events (editable: %s)', editable => {
  test.each([
    ['copy', COPY_COMMAND],
    ['cut', CUT_COMMAND],
    ['paste', PASTE_COMMAND],
    ['dragstart', DRAGSTART_COMMAND],
    ['dragover', DRAGOVER_COMMAND],
    ['dragend', DRAGEND_COMMAND],
    ['drop', DROP_COMMAND],
    ['focus', FOCUS_COMMAND],
    ['blur', BLUR_COMMAND],
  ] as const)(
    '%s preserves the event payload and editability policy',
    (name, command) => {
      using editor = buildEditorFromExtensions();
      editor.setEditable(editable);
      const root = mount(editor);
      const listener = vi.fn(() => true);
      editor.registerCommand(
        command as AnyLexicalCommand,
        listener,
        COMMAND_PRIORITY_CRITICAL,
      );
      const event = new Event(name, {bubbles: true, cancelable: true});
      root.dispatchEvent(event);
      if (editable || name === 'copy') {
        expect(listener).toHaveBeenCalledExactlyOnceWith(event, editor);
      } else {
        expect(listener).not.toHaveBeenCalled();
      }
    },
  );
});

test('a root event is handled only by the innermost editor', () => {
  using outer = buildEditorFromExtensions();
  using inner = buildEditorFromExtensions();
  const outerRoot = mount(outer);
  const innerRoot = mount(inner);
  outerRoot.appendChild(innerRoot);
  const outerListener = vi.fn(() => false);
  const innerListener = vi.fn(() => false);
  outer.registerCommand(COPY_COMMAND, outerListener, COMMAND_PRIORITY_CRITICAL);
  inner.registerCommand(COPY_COMMAND, innerListener, COMMAND_PRIORITY_CRITICAL);
  innerRoot.dispatchEvent(new Event('copy', {bubbles: true}));
  expect(innerListener).toHaveBeenCalledOnce();
  expect(outerListener).not.toHaveBeenCalled();
});

test('blur clears transient key state even after switching to read-only', () => {
  using editor = buildEditorFromExtensions();
  const root = mount(editor);
  editor._inputState.isShiftKeyDown = true;
  editor._inputState.isInsertLineBreak = true;
  editor.setEditable(false);
  root.dispatchEvent(new FocusEvent('blur'));
  expect(editor._inputState.isShiftKeyDown).toBe(false);
  expect(editor._inputState.isInsertLineBreak).toBe(false);
});
