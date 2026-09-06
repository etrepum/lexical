/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isTextNode,
  $setSelection,
  createEditor,
  IS_BOLD,
  IS_ITALIC,
} from 'lexical';
import {describe, expect, test} from 'vitest';

describe('selection text slices', () => {
  test.each([false, true])(
    'extracts through an element endpoint between children (backward=%s)',
    backward => {
      const editor = createEditor({
        onError: error => {
          throw error;
        },
      });
      editor.update(
        () => {
          const first = $createTextNode('abcd');
          const second = $createTextNode('efgh').setFormat('italic');
          const third = $createTextNode('ijkl').setFormat('bold');
          const paragraph = $createParagraphNode().append(first, second, third);
          $getRoot().append(paragraph);
          const selection = $createRangeSelection();
          const [start, end] = backward
            ? [selection.focus, selection.anchor]
            : [selection.anchor, selection.focus];
          start.set(first.getKey(), 1, 'text');
          end.set(paragraph.getKey(), 2, 'element');
          $setSelection(selection);

          expect(
            selection
              .extract()
              .filter($isTextNode)
              .map(node => node.getTextContent()),
          ).toEqual(['bcd', 'efgh']);
          expect(paragraph.getTextContent()).toBe('abcdefghijkl');
          expect(selection.isBackward()).toBe(backward);
        },
        {discrete: true},
      );
    },
  );

  test.each([false, true])(
    'does not extract text from an empty mixed-point range (backward=%s)',
    backward => {
      const editor = createEditor({
        onError: error => {
          throw error;
        },
      });
      editor.update(
        () => {
          const text = $createTextNode('abcd');
          const following = $createTextNode('efgh').setFormat('italic');
          const paragraph = $createParagraphNode().append(text, following);
          $getRoot().append(paragraph);
          const selection = $createRangeSelection();
          const [elementPoint, textPoint] = backward
            ? [selection.focus, selection.anchor]
            : [selection.anchor, selection.focus];
          elementPoint.set(paragraph.getKey(), 1, 'element');
          textPoint.set(text.getKey(), 4, 'text');
          $setSelection(selection);

          expect(selection.extract()).toEqual([]);
          expect(paragraph.getChildren()).toEqual([text, following]);
          expect(text.getTextContent()).toBe('abcd');
        },
        {discrete: true},
      );
    },
  );

  test('pending format excludes a final node selected at offset zero', () => {
    const editor = createEditor({
      onError: error => {
        throw error;
      },
    });
    editor.update(
      () => {
        const first = $createTextNode('abcd').setFormat(IS_BOLD);
        const second = $createTextNode('efgh').setFormat(IS_ITALIC);
        const paragraph = $createParagraphNode().append(first, second);
        $getRoot().append(paragraph);
        const selection = $createRangeSelection();
        selection.anchor.set(first.getKey(), 0, 'text');
        selection.focus.set(second.getKey(), 0, 'text');
        selection.format = IS_BOLD;
        $setSelection(selection);

        selection.formatText('bold');
        expect(first.getFormat()).toBe(0);
        expect(second.getFormat()).toBe(IS_ITALIC);
        expect(selection.format).toBe(0);
      },
      {discrete: true},
    );
  });

  test('formatting a detached selection retains its partial text range', () => {
    const editor = createEditor({
      onError: error => {
        throw error;
      },
    });
    editor.update(
      () => {
        const text = $createTextNode('abcde');
        const other = $createTextNode('other');
        const paragraph = $createParagraphNode().append(text);
        $getRoot().append(paragraph, $createParagraphNode().append(other));
        const active = other.select(2, 2);
        const selection = $createRangeSelection();
        selection.anchor.set(text.getKey(), 4, 'text');
        selection.focus.set(text.getKey(), 1, 'text');

        selection.formatText('bold');
        expect(
          paragraph
            .getChildren()
            .map(node => [
              node.getTextContent(),
              $isTextNode(node) && node.getFormat(),
            ]),
        ).toEqual([
          ['a', 0],
          ['bcd', IS_BOLD],
          ['e', 0],
        ]);
        expect(selection.anchor.getNode().getTextContent()).toBe('bcd');
        expect(selection.anchor.offset).toBe(3);
        expect(selection.focus.offset).toBe(0);
        expect($getSelection()).toBe(active);
        expect(active.anchor.key).toBe(other.getKey());
        expect(active.anchor.offset).toBe(2);
      },
      {discrete: true},
    );
  });
});
