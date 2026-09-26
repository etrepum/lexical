/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {$createLinkNode, LinkNode} from '@lexical/link';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  createEditor,
  type TextNode,
} from 'lexical';
import {expect, test} from 'vitest';

test.each([false, true])(
  'node traversal stops at a nested ancestor endpoint (reverse=%s)',
  reverse => {
    const editor = createEditor({
      nodes: [LinkNode],
      onError: error => {
        throw error;
      },
    });
    editor.update(
      () => {
        const text = $createTextNode('inside');
        const link = $createLinkNode('https://example.test').append(text);
        const paragraph = $createParagraphNode().append(link);
        $getRoot().append(
          paragraph,
          $createParagraphNode().append($createTextNode('outside')),
        );
        expect(
          reverse
            ? paragraph.getNodesBetween(text)
            : text.getNodesBetween(paragraph),
        ).toEqual([text, link, paragraph]);
      },
      {discrete: true},
    );
  },
);

test('node traversal recognizes a stale target reference', () => {
  const editor = createEditor({
    onError: error => {
      throw error;
    },
  });
  let start: TextNode, end: TextNode;
  editor.update(
    () => {
      start = $createTextNode('start').toggleUnmergeable();
      end = $createTextNode('end').toggleUnmergeable();
      $getRoot().append(
        $createParagraphNode().append(
          start,
          end,
          $createTextNode('outside').toggleUnmergeable(),
        ),
      );
    },
    {discrete: true},
  );
  editor.update(
    () => {
      const currentEnd = end.setFormat('italic');
      expect(currentEnd).not.toBe(end);
      expect(start.getNodesBetween(end)).toEqual([start, currentEnd]);
    },
    {discrete: true},
  );
});
