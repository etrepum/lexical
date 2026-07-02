/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {buildEditorFromExtensions} from '@lexical/extension';
import {$isLinkNode} from '@lexical/link';
import {$isListNode} from '@lexical/list';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  MdastExtension,
} from '@lexical/mdast';
import {GfmMdastConfig, GfmMdastExtension} from '@lexical/mdast/gfm';
import {$getRoot, $isElementNode, $isTextNode} from 'lexical';
import {assert, describe, expect, test} from 'vitest';

describe('@lexical/mdast', () => {
  test('imports CommonMark formatting and links through mdast', () => {
    using editor = buildEditorFromExtensions([MdastExtension]);

    editor.update(() =>
      $convertFromMarkdownString(
        'Hello **strong** [link](https://lexical.dev)',
      ),
    );

    editor.read(() => {
      const paragraph = $getRoot().getFirstChildOrThrow();
      assert($isElementNode(paragraph));
      const children = paragraph.getChildren();
      expect(children.map(child => child.getTextContent())).toEqual([
        'Hello ',
        'strong',
        ' ',
        'link',
      ]);
      assert($isTextNode(children[1]));
      expect(children[1].hasFormat('bold')).toBe(true);
      assert($isLinkNode(children[3]));
      expect(children[3].getURL()).toBe('https://lexical.dev');
    });
  });

  test('exports Lexical content to Markdown through mdast', () => {
    using editor = buildEditorFromExtensions([MdastExtension]);

    editor.update(() => $convertFromMarkdownString('# Title'));

    editor.read(() => {
      expect($convertToMarkdownString()).toBe('# Title\n');
    });
  });

  test('supports GFM task lists through the configured extension options', () => {
    using editor = buildEditorFromExtensions([GfmMdastExtension]);

    editor.update(() =>
      $convertFromMarkdownString('- [x] done', GfmMdastConfig),
    );

    editor.read(() => {
      const list = $getRoot().getFirstChildOrThrow();
      assert($isListNode(list));
      expect(list.getFirstChildOrThrow().getTextContent()).toBe('done');
    });
  });
});
