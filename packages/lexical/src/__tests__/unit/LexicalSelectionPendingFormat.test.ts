/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isParagraphNode,
  $setSelection,
  IS_BOLD,
  TextNode,
} from 'lexical';
import {describe, expect, test} from 'vitest';

import {$assertRangeSelection, initializeUnitTest} from '../utils';

function $textNodeContaining(text: string): TextNode {
  for (const node of $getRoot().getAllTextNodes()) {
    if (node.getTextContent().includes(text)) {
      return node;
    }
  }
  throw new Error(`No TextNode containing ${JSON.stringify(text)}`);
}

/**
 * These tests pin the "pending format" contract of RangeSelection:
 * selection.format/selection.style may deliberately differ from the
 * anchor node (e.g. after formatText on a collapsed selection) and must
 * survive the internal .select() calls made by core mutation flows
 * (insertText boundary redirects, insertParagraph, insertNodes,
 * deleteCharacter on segmented nodes).
 */
describe('RangeSelection pending format/style preservation', () => {
  initializeUnitTest(testEnv => {
    test('typing at the end of a token node applies a pending format toggle, not the sibling format', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const paragraph = $createParagraphNode();
        const token = $createTextNode('@bob').setMode('token');
        const sibling = $createTextNode(' hi').toggleFormat('italic');
        paragraph.append(token, sibling);
        $getRoot().clear().append(paragraph);

        // Collapsed caret at the end of the token node, then a pending
        // bold toggle (formatText on a collapsed selection only sets
        // selection.format).
        token.select(4, 4);
        const selection = $assertRangeSelection($getSelection());
        selection.formatText('bold');
        selection.insertText('x');

        const inserted = $textNodeContaining('x');
        expect(inserted.hasFormat('bold')).toBe(true);
        expect(inserted.hasFormat('italic')).toBe(false);
      });
    });

    test('typing at the start of a token node keeps the pending selection style', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const paragraph = $createParagraphNode();
        const token = $createTextNode('@bob').setMode('token');
        paragraph.append(token);
        $getRoot().clear().append(paragraph);

        token.select(0, 0);
        const selection = $assertRangeSelection($getSelection());
        selection.style = 'color: red;';
        selection.insertText('x');

        const inserted = $textNodeContaining('x');
        expect(inserted.getStyle()).toBe('color: red;');
      });
    });

    test('pressing Enter preserves a pending format toggle for the next typed character', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const paragraph = $createParagraphNode();
        const text = $createTextNode('hello');
        paragraph.append(text);
        $getRoot().clear().append(paragraph);

        text.select(3, 3);
        let selection = $assertRangeSelection($getSelection());
        selection.formatText('bold');
        selection.insertParagraph();
        selection = $assertRangeSelection($getSelection());
        expect(selection.hasFormat('bold')).toBe(true);
        selection.insertText('x');

        const inserted = $textNodeContaining('x');
        expect(inserted.hasFormat('bold')).toBe(true);
      });
    });

    test('insertNodes preserves a pending format toggle', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const paragraph = $createParagraphNode();
        const text = $createTextNode('hello');
        paragraph.append(text);
        $getRoot().clear().append(paragraph);

        text.select(2, 2);
        let selection = $assertRangeSelection($getSelection());
        selection.formatText('bold');
        selection.insertNodes([$createTextNode('Z')]);
        selection = $assertRangeSelection($getSelection());
        expect(selection.hasFormat('bold')).toBe(true);
        selection.insertText('x');

        const inserted = $textNodeContaining('x');
        expect(inserted.hasFormat('bold')).toBe(true);
      });
    });

    test('backspacing into a segmented node does not adopt its format for subsequent typing', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const paragraph = $createParagraphNode();
        const segmented = $createTextNode('John Doe')
          .setMode('segmented')
          .toggleFormat('bold');
        const plain = $createTextNode('after');
        paragraph.append(segmented, plain);
        $getRoot().clear().append(paragraph);

        plain.select(0, 0);
        let selection = $assertRangeSelection($getSelection());
        expect(selection.hasFormat('bold')).toBe(false);
        selection.deleteCharacter(true);
        selection = $assertRangeSelection($getSelection());
        expect(selection.hasFormat('bold')).toBe(false);
      });
    });

    test('purely programmatic selection movement inherits format and style from the target node', async () => {
      const {editor} = testEnv;
      // Mutating update: two differently formatted nodes, bold applied to
      // the first via the selection.
      await editor.update(() => {
        const paragraph = $createParagraphNode();
        const text1 = $createTextNode('Hello');
        const text2 = $createTextNode(' World')
          .toggleFormat('italic')
          .setStyle('color: red;');
        paragraph.append(text1, text2);
        $getRoot().clear().append(paragraph);
        text1.select(0, 5);
        $assertRangeSelection($getSelection()).formatText('bold');
      });

      // Pure navigation update: jump to the end of the document, which is
      // the italic/red text2.
      await editor.update(() => {
        expect($assertRangeSelection($getSelection()).hasFormat('bold')).toBe(
          true,
        );
        $getRoot().selectEnd();
      });

      await editor.update(() => {
        const selection = $assertRangeSelection($getSelection());
        expect(selection.hasFormat('bold')).toBe(false);
        expect(selection.hasFormat('italic')).toBe(true);
        expect(selection.style).toBe('color: red;');
      });
    });

    test('select() with no prior range selection also inherits the target node format', async () => {
      const {editor} = testEnv;
      let textKey = '';
      await editor.update(() => {
        const paragraph = $createParagraphNode();
        const text = $createTextNode('World')
          .toggleFormat('italic')
          .setStyle('color: red;');
        paragraph.append(text);
        $getRoot().clear().append(paragraph);
        textKey = text.getKey();
        $setSelection(null);
      });

      await editor.update(() => {
        const text = $getNodeByKey(textKey);
        if (!(text instanceof TextNode)) {
          throw new Error('expected TextNode');
        }
        text.select();
      });

      await editor.update(() => {
        const selection = $assertRangeSelection($getSelection());
        expect(selection.hasFormat('italic')).toBe(true);
        expect(selection.style).toBe('color: red;');
      });
    });

    test('purely programmatic selection of an empty element inherits its textFormat', async () => {
      const {editor} = testEnv;
      let paragraphKey = '';
      await editor.update(() => {
        const paragraph1 = $createParagraphNode();
        paragraph1.append($createTextNode('plain'));
        const paragraph2 = $createParagraphNode().setTextFormat(IS_BOLD);
        $getRoot().clear().append(paragraph1, paragraph2);
        paragraphKey = paragraph2.getKey();
        paragraph1.getFirstChildOrThrow<TextNode>().select(0, 0);
      });

      await editor.update(() => {
        const paragraph = $getNodeByKey(paragraphKey);
        if (!$isParagraphNode(paragraph)) {
          throw new Error('expected ParagraphNode');
        }
        paragraph.select();
      });

      await editor.update(() => {
        const selection = $assertRangeSelection($getSelection());
        expect(selection.hasFormat('bold')).toBe(true);
      });
    });

    test('programmatic select-all over uniformly bold content still reports bold', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const paragraph = $createParagraphNode();
        const text = $createTextNode('hello');
        paragraph.append(text);
        $getRoot().clear().append(paragraph);

        text.select(0, 5);
        const selection = $assertRangeSelection($getSelection());
        selection.formatText('bold');
        expect($textNodeContaining('hello').hasFormat('bold')).toBe(true);
        expect(selection.hasFormat('bold')).toBe(true);

        const root = $getRoot();
        const selectAll = $assertRangeSelection(
          root.select(0, root.getChildrenSize()),
        );
        expect(selectAll.hasFormat('bold')).toBe(true);
      });
    });
  });
});
