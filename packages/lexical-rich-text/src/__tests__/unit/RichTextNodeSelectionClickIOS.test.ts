/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {buildEditorFromExtensions} from '@lexical/extension';
import {RichTextExtension} from '@lexical/rich-text';
import {
  $createNodeSelection,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  getDOMSelection,
} from 'lexical';
import {
  $createTestDecoratorNode,
  TestDecoratorNode,
} from 'lexical/src/__tests__/utils';
import {assert, describe, expect, test, vi} from 'vitest';

// `vi.mock` is hoisted above all imports, so LexicalEvents.ts sees iOS.
vi.mock('lexical/src/environment', async importOriginal => ({
  ...(await importOriginal<typeof import('lexical/src/environment')>()),
  IS_IOS: true,
}));

describe('a tap on text after a NodeSelection on iOS', () => {
  test('keeps the caret the tap placed', () => {
    const rootElement = document.createElement('div');
    rootElement.contentEditable = 'true';
    document.body.appendChild(rootElement);
    let textKey = '';
    using editor = buildEditorFromExtensions({
      $initialEditorState: () => {
        const decorator = $createTestDecoratorNode();
        const text = $createTextNode('Hello world');
        textKey = text.getKey();
        $getRoot().append(decorator, $createParagraphNode().append(text));
        const selection = $createNodeSelection();
        selection.add(decorator.getKey());
        $setSelection(selection);
      },
      dependencies: [RichTextExtension],
      name: 'test',
      nodes: [TestDecoratorNode],
    });
    editor.setRootElement(rootElement);

    const target = editor.getElementByKey(textKey)!;
    const textDOM = target.firstChild!;
    // iOS focuses the editor and places the caret, then fires the click
    // (reported with pointerType 'mouse') before the selectionchange.
    rootElement.focus();
    const domSelection = getDOMSelection(window)!;
    domSelection.setBaseAndExtent(textDOM, 3, textDOM, 3);
    target.dispatchEvent(new MouseEvent('click', {bubbles: true, detail: 1}));

    editor.read(() => {
      const selection = $getSelection();
      assert($isRangeSelection(selection));
      expect(selection.isCollapsed()).toBe(true);
      expect(selection.anchor.getNode().getTextContent()).toBe('Hello world');
      expect(selection.anchor.offset).toBe(3);
    });
    expect(domSelection.rangeCount).toBe(1);
    expect(domSelection.anchorNode).toBe(textDOM);
    expect(domSelection.anchorOffset).toBe(3);
    rootElement.remove();
  });
});
