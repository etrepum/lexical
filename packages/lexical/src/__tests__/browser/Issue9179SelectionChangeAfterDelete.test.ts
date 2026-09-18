/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Regression test for #9179 — deleting a selection whose boundaries both sit
 * inside the same unformatted TextNode leaves the caret in the middle of a DOM
 * text node, which is exactly the shape the selectionchange handler skips as
 * "the event for the reconciler's own DOM update". That event is the only one
 * the change produces, so skipping it used to swallow SELECTION_CHANGE_COMMAND
 * entirely. Deletions whose boundaries land on a node boundary (formatted text,
 * inline nodes) were unaffected, which is why the bug looked conditional.
 */

import {buildEditorFromExtensions, defineExtension} from '@lexical/extension';
import {RichTextExtension} from '@lexical/rich-text';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  isDOMTextNode,
  type LexicalEditor,
  type NodeKey,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import {assert, describe, expect, onTestFinished, test, vi} from 'vitest';

/** Give the browser a beat to deliver its asynchronous selectionchange task. */
function settle(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 50));
}

function mountEditor(): {contentEditable: HTMLElement; editor: LexicalEditor} {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const contentEditable = document.createElement('div');
  contentEditable.contentEditable = 'true';
  container.appendChild(contentEditable);

  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [RichTextExtension],
      name: '[9179-selection-change-browser]',
    }),
  );
  editor.setRootElement(contentEditable);

  onTestFinished(() => {
    editor.setRootElement(null);
    document.body.removeChild(container);
    editor.dispose();
  });

  return {contentEditable, editor};
}

function backspace(contentEditable: HTMLElement): void {
  contentEditable.dispatchEvent(
    new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'deleteContentBackward',
    }),
  );
}

describe('Issue #9179: SELECTION_CHANGE_COMMAND after a Lexical-applied deletion', () => {
  test('backspacing a range inside one unformatted TextNode dispatches SELECTION_CHANGE_COMMAND', async () => {
    const {contentEditable, editor} = mountEditor();

    let textKey: NodeKey = '';
    editor.update(
      () => {
        const text = $createTextNode('Hello world');
        textKey = text.getKey();
        $getRoot().clear().append($createParagraphNode().append(text));
        text.select(0, 0);
      },
      {discrete: true},
    );

    contentEditable.focus();
    await settle();

    const textDOM = editor.getElementByKey(textKey);
    const domTextNode = textDOM && textDOM.firstChild;
    assert(isDOMTextNode(domTextNode));
    const domSelection = document.getSelection();
    assert(domSelection !== null);
    // Anchor and focus are both strictly inside the same unformatted text node.
    domSelection.setBaseAndExtent(domTextNode, 2, domTextNode, 8);
    await settle();

    const onSelectionChange = vi.fn(() => false);
    const unregister = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      onSelectionChange,
      COMMAND_PRIORITY_CRITICAL,
    );
    onTestFinished(() => unregister());

    backspace(contentEditable);
    await vi.waitFor(() => expect(onSelectionChange).toHaveBeenCalledTimes(1));

    expect(editor.read(() => $getRoot().getTextContent())).toBe('Herld');
    editor.read(() => {
      const selection = $getSelection();
      assert($isRangeSelection(selection));
      expect(selection.isCollapsed()).toBe(true);
      expect(selection.anchor.key).toBe(textKey);
      expect(selection.anchor.offset).toBe(2);
    });

    // The applied selection is announced exactly once — the skip path must not
    // add a dispatch on top of the one the full handler already makes.
    await settle();
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  test('backspacing a range that ends on a node boundary still dispatches once', async () => {
    const {contentEditable, editor} = mountEditor();

    let boldKey: NodeKey = '';
    editor.update(
      () => {
        const plain = $createTextNode('Hello ');
        const bold = $createTextNode('world');
        bold.toggleFormat('bold');
        boldKey = bold.getKey();
        $getRoot().clear().append($createParagraphNode().append(plain, bold));
        plain.select(0, 0);
      },
      {discrete: true},
    );

    contentEditable.focus();
    await settle();

    const boldDOM = editor.getElementByKey(boldKey);
    const boldTextNode = boldDOM && boldDOM.firstChild;
    assert(isDOMTextNode(boldTextNode));
    const domSelection = document.getSelection();
    assert(domSelection !== null);
    domSelection.setBaseAndExtent(boldTextNode, 0, boldTextNode, 5);
    await settle();

    const onSelectionChange = vi.fn(() => false);
    const unregister = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      onSelectionChange,
      COMMAND_PRIORITY_CRITICAL,
    );
    onTestFinished(() => unregister());

    backspace(contentEditable);
    await vi.waitFor(() => expect(onSelectionChange).toHaveBeenCalledTimes(1));

    expect(editor.read(() => $getRoot().getTextContent())).toBe('Hello ');
    await settle();
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });
});
