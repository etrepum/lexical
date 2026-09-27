/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Shared cases for an insertText beforeinput that arrives right after a
 * handled Backspace or select-all, with no keydown in between (#9250).
 *
 * Chrome on macOS can fire such an insertText to accept a pending text
 * replacement, which Lexical drops. On every other platform the insertText is
 * legitimate input and must reach the document. Import this from a test file
 * that mocks `lexical/src/environment` for the platform under test.
 */

import {buildEditorFromExtensions} from '@lexical/extension';
import {RichTextExtension} from '@lexical/rich-text';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type LexicalEditor,
  type LexicalEditorWithDispose,
} from 'lexical';
import {describe, expect, test} from 'vitest';

/** "draft" with "ft" selected, so Backspace deletes without selection.modify. */
function editorWithDraft(): LexicalEditorWithDispose {
  return buildEditorFromExtensions({
    $initialEditorState: () => {
      const textNode = $createTextNode('draft');
      $getRoot().append($createParagraphNode().append(textNode));
      textNode.select(3, 5);
    },
    afterRegistration: editor => {
      const container = document.createElement('div');
      container.setAttribute('data-lexical-editor', 'true');
      container.contentEditable = 'true';
      document.body.appendChild(container);
      editor.setRootElement(container);
      // Focus so the reconciler mirrors the editor selection into the DOM,
      // which beforeinput reads its selection from.
      container.focus();
      return () => {
        editor.setRootElement(null);
        document.body.removeChild(container);
      };
    },
    dependencies: [RichTextExtension],
    name: '[test]',
  });
}

function keyDown(editor: LexicalEditor, init: KeyboardEventInit): void {
  editor
    .getRootElement()!
    .dispatchEvent(
      new KeyboardEvent('keydown', {bubbles: true, cancelable: true, ...init}),
    );
}

function textContent(editor: LexicalEditor): string {
  return editor.read('force-commit', () => $getRoot().getTextContent());
}

/**
 * Dispatches an insertText beforeinput and reports whether Lexical dropped it:
 * prevented the browser from inserting the text without inserting it itself.
 */
function isInsertTextDropped(editor: LexicalEditor, data: string): boolean {
  const before = textContent(editor);
  const event = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    data,
    inputType: 'insertText',
  });
  // jsdom's InputEvent does not implement getTargetRanges.
  Object.defineProperty(event, 'getTargetRanges', {value: () => []});
  editor.getRootElement()!.dispatchEvent(event);
  return event.defaultPrevented && textContent(editor) === before;
}

export function runHandledSelectionCommandInsertTextTests({
  isApple,
  dropsInsertText,
}: {
  isApple: boolean;
  dropsInsertText: boolean;
}): void {
  const selectAll: KeyboardEventInit = isApple
    ? {key: 'a', metaKey: true}
    : {ctrlKey: true, key: 'a'};

  describe('insertText right after a handled selection command', () => {
    test(`is ${dropsInsertText ? '' : 'not '}dropped after Backspace`, () => {
      using editor = editorWithDraft();

      keyDown(editor, {key: 'Backspace'});
      expect(textContent(editor)).toBe('dra');

      expect(isInsertTextDropped(editor, 'swift')).toBe(dropsInsertText);
    });

    test(`is ${dropsInsertText ? '' : 'not '}dropped after select-all`, () => {
      using editor = editorWithDraft();

      keyDown(editor, selectAll);

      expect(isInsertTextDropped(editor, 'swift')).toBe(dropsInsertText);
    });

    test('is not dropped once another keydown intervenes', () => {
      using editor = editorWithDraft();

      keyDown(editor, selectAll);
      keyDown(editor, {key: 's'});

      expect(isInsertTextDropped(editor, 'swift')).toBe(false);
    });
  });
}
