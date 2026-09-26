/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Tests for Shift+Enter on iOS (#9239).
 *
 * iOS only reports insertParagraph from beforeinput, so Lexical infers a line
 * break from the Enter keydown's shiftKey. The on-screen keyboard also sets
 * shiftKey on Enter while auto-capitalization is active, which must still
 * insert a paragraph. Only a real Shift press fires a keydown for Shift
 * itself, so that is what distinguishes the two: Enter with shiftKey inserts
 * a line break when Shift is held down (hardware keyboard) or was the key
 * tapped right before it (on-screen keyboard).
 */

import {buildEditorFromExtensions} from '@lexical/extension';
import {RichTextExtension} from '@lexical/rich-text';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
  $isLineBreakNode,
  type LexicalEditor,
  type LexicalEditorWithDispose,
} from 'lexical';
import {describe, expect, test, vi} from 'vitest';

// `vi.mock` is hoisted above all imports, so LexicalEvents.ts observes
// IS_IOS=true and CAN_USE_BEFORE_INPUT=true.
vi.mock('lexical/src/environment', () => ({
  CAN_USE_BEFORE_INPUT: true,
  CAN_USE_DOM: true,
  IS_ANDROID: false,
  IS_ANDROID_CHROME: false,
  IS_APPLE: true,
  IS_APPLE_WEBKIT: true,
  IS_CHROME: false,
  IS_FIREFOX: false,
  IS_IOS: true,
  IS_SAFARI: true,
}));

function createBeforeInputEvent(inputType: string): InputEvent {
  const event = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType,
  });
  // jsdom's InputEvent does not implement getTargetRanges.
  Object.defineProperty(event, 'getTargetRanges', {value: () => []});
  return event;
}

function createEditor(): LexicalEditorWithDispose {
  return buildEditorFromExtensions({
    $initialEditorState: () => {
      const text = $createTextNode('Hello');
      $getRoot().append($createParagraphNode().append(text));
      text.select(5, 5);
    },
    afterRegistration: editor => {
      const container = document.createElement('div');
      container.setAttribute('data-lexical-editor', 'true');
      container.contentEditable = 'true';
      document.body.appendChild(container);
      editor.setRootElement(container);
      return () => {
        editor.setRootElement(null);
        document.body.removeChild(container);
      };
    },
    dependencies: [RichTextExtension],
    name: '[test]',
  });
}

function keyEvent(
  type: 'keydown' | 'keyup',
  editor: LexicalEditor,
  key: string,
  init: KeyboardEventInit,
): void {
  editor.getRootElement()!.dispatchEvent(
    new KeyboardEvent(type, {
      bubbles: true,
      cancelable: true,
      key,
      ...init,
    }),
  );
}

function keydown(
  editor: LexicalEditor,
  key: string,
  init: KeyboardEventInit = {},
): void {
  keyEvent('keydown', editor, key, init);
}

function keyup(
  editor: LexicalEditor,
  key: string,
  init: KeyboardEventInit = {},
): void {
  keyEvent('keyup', editor, key, init);
}

/** A tap of the on-screen keyboard's Shift key. */
function tapShift(editor: LexicalEditor, shiftKey: boolean): void {
  keydown(editor, 'Shift', {shiftKey});
  keyup(editor, 'Shift', {shiftKey});
}

function insertParagraph(editor: LexicalEditor): void {
  editor
    .getRootElement()!
    .dispatchEvent(createBeforeInputEvent('insertParagraph'));
}

/** [paragraph count, whether the first paragraph ends with a line break] */
function readShape(editor: LexicalEditor): [number, boolean] {
  return editor.read('force-commit', () => {
    const first = $getRoot().getFirstChild();
    return [
      $getRoot().getChildrenSize(),
      $isElementNode(first) && $isLineBreakNode(first.getLastChild()),
    ];
  });
}

describe('iOS Shift+Enter', () => {
  test('inserts a line break while Shift is held (hardware keyboard)', () => {
    using editor = createEditor();

    keydown(editor, 'Shift', {shiftKey: true});
    keydown(editor, 'Enter', {shiftKey: true});
    insertParagraph(editor);

    expect(readShape(editor)).toEqual([1, true]);
  });

  test('keeps inserting line breaks while Shift stays held', () => {
    using editor = createEditor();

    keydown(editor, 'Shift', {shiftKey: true});
    keydown(editor, 'A', {shiftKey: true});
    keydown(editor, 'Enter', {shiftKey: true});
    insertParagraph(editor);
    keydown(editor, 'Enter', {shiftKey: true});
    insertParagraph(editor);

    expect(readShape(editor)).toEqual([1, true]);
    editor.read('latest', () => {
      expect($getRoot().getTextContent()).toBe('Hello\n\n');
    });
  });

  test('inserts a paragraph once a held Shift is released', () => {
    using editor = createEditor();

    keydown(editor, 'Shift', {shiftKey: true});
    keydown(editor, 'A', {shiftKey: true});
    keyup(editor, 'Shift');
    keydown(editor, 'Enter');
    insertParagraph(editor);

    expect(readShape(editor)).toEqual([2, false]);
  });

  test('inserts a line break when Shift is tapped on (on-screen keyboard)', () => {
    using editor = createEditor();

    tapShift(editor, true);
    keydown(editor, 'Enter', {shiftKey: true});
    insertParagraph(editor);

    expect(readShape(editor)).toEqual([1, true]);
  });

  test('inserts a paragraph when the tap turns Shift off', () => {
    // Auto-capitalization had Shift on, so tapping it turns it off and the
    // keyboard shows Shift off, so Return must not insert a line break.
    using editor = createEditor();

    tapShift(editor, false);
    keydown(editor, 'Enter');
    insertParagraph(editor);

    expect(readShape(editor)).toEqual([2, false]);
  });

  test('does not stick after a tapped Shift+Enter', () => {
    // Auto-capitalization turns Shift back on for the next line, but only
    // the Enter right after the tap is a line break.
    using editor = createEditor();

    tapShift(editor, true);
    keydown(editor, 'Enter', {shiftKey: true});
    insertParagraph(editor);
    keydown(editor, 'Enter', {shiftKey: true});
    insertParagraph(editor);

    expect(readShape(editor)).toEqual([2, true]);
  });

  test('inserts a paragraph when shiftKey comes from auto-capitalization', () => {
    // The on-screen keyboard fires no keydown for Shift.
    using editor = createEditor();

    keydown(editor, 'Enter', {shiftKey: true});
    insertParagraph(editor);

    expect(readShape(editor)).toEqual([2, false]);
  });

  test('forgets an earlier Shift press once a key is pressed without it', () => {
    using editor = createEditor();

    keydown(editor, 'Shift', {shiftKey: true});
    keydown(editor, 'a');
    keydown(editor, 'Enter', {shiftKey: true});
    insertParagraph(editor);

    expect(readShape(editor)).toEqual([2, false]);
  });

  test('inserts a paragraph for a plain Enter', () => {
    using editor = createEditor();

    keydown(editor, 'Enter');
    insertParagraph(editor);

    expect(readShape(editor)).toEqual([2, false]);
  });
});
