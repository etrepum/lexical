/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  buildEditorFromExtensions,
  effect,
  getExtensionDependencyFromEditor,
} from '@lexical/extension';
import {$convertFromMarkdownString} from '@lexical/mdast';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $selectAll,
  CONTROLLED_TEXT_INSERTION_COMMAND,
  defineExtension,
  DELETE_CHARACTER_COMMAND,
} from 'lexical';
import {describe, expect, it} from 'vitest';

import {ToolbarStateExtension} from '../../extensions/ToolbarStateExtension';

describe('ToolbarStateExtension', () => {
  it('reads a selection anchored on the root after select all + delete', () => {
    using editor = buildEditorFromExtensions(
      defineExtension({
        $initialEditorState: () => {
          $convertFromMarkdownString(
            '# Title\n\nSome text[^1]\n\n[^1]: A note\n\n```ts\nconst x = 1;\n```\n',
          );
        },
        dependencies: [ToolbarStateExtension],
        name: '[root]',
      }),
    );
    const {blockType} = getExtensionDependencyFromEditor(
      editor,
      ToolbarStateExtension,
    ).output;
    const blockTypes: string[] = [];
    // Watch the signal the way the toolbar does, so it tracks every
    // committed editor state.
    const dispose = effect(() => {
      blockTypes.push(blockType.value);
    });

    editor.update(
      () => {
        $selectAll();
      },
      {discrete: true},
    );
    editor.dispatchCommand(DELETE_CHARACTER_COMMAND, true);
    // Deleting everything leaves an empty root with the selection on it
    editor.read(() => {
      const selection = $getSelection();
      expect($isRangeSelection(selection)).toBe(true);
      expect($getRoot().getChildrenSize()).toBe(0);
      expect($isRangeSelection(selection) && selection.anchor.getNode()).toBe(
        $getRoot(),
      );
    });
    expect(blockTypes).toEqual(['paragraph', 'h1', 'paragraph']);

    // Typing into the emptied document still works
    editor.dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, 'x');
    expect(
      editor.read(() => $getRoot().getFirstChildOrThrow().getTextContent()),
    ).toBe('x');
    expect(blockTypes.at(-1)).toBe('paragraph');
    dispose();
  });
});
