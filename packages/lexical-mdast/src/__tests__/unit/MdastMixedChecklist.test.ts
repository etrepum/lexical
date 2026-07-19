/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  buildEditorFromExtensions,
  configExtension,
  type LexicalEditorWithDispose,
} from '@lexical/extension';
import {
  $isListNode,
  CheckListExtension,
  ListExtension,
  type ListItemNode,
} from '@lexical/list';
import {$getRoot, defineExtension} from 'lexical';
import {$assertNodeType} from 'lexical/src/__tests__/utils';
import {describe, expect, test} from 'vitest';

import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  MdastCommonMarkExtension,
  MdastExportExtension,
  MdastTaskListExtension,
} from '../../index';

// A GitHub mixed task list — one list with both task rows and plain rows —
// is the reason the mdast-editor enables the semantic nesting ListExtension.
// mdast represents it natively (each listItem's `checked` is a boolean for a
// task row and null for a plain one), so the round-trip needs no line merging.
function createEditor(): LexicalEditorWithDispose {
  return buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(ListExtension, {hasSemanticNesting: true}),
        CheckListExtension,
        MdastCommonMarkExtension,
        MdastTaskListExtension,
        MdastExportExtension,
      ],
      name: '[root]',
    }),
  );
}

function importMarkdown(
  editor: LexicalEditorWithDispose,
  markdown: string,
): void {
  editor.update(() => $convertFromMarkdownString(markdown), {discrete: true});
}

function exportMarkdown(editor: LexicalEditorWithDispose): string {
  return editor.read(() => $convertToMarkdownString());
}

describe('@lexical/mdast mixed check list', () => {
  test('imports a mixed task list as one check list with a marked plain row', () => {
    using editor = createEditor();
    importMarkdown(editor, '- [ ] check\n- no check\n- [x] done');
    editor.read(() => {
      const root = $getRoot();
      expect(root.getChildrenSize()).toBe(1);
      const list = $assertNodeType(root.getFirstChild(), $isListNode);
      expect(list.getListType()).toBe('check');
      const [a, b, c] = list.getChildren() as ListItemNode[];
      expect(a.getChecked()).toBe(false);
      expect(b.getChecked()).toBeUndefined();
      expect(b.getListItemPlain()).toBe(true);
      expect(c.getChecked()).toBe(true);
    });
  });

  test('round-trips a mixed task list byte-for-byte', () => {
    using editor = createEditor();
    const markdown = '- [ ] check\n- no check\n- [x] done';
    importMarkdown(editor, markdown);
    expect(exportMarkdown(editor)).toBe(markdown);
  });

  test('a plain row in a check list exports as a bare item (checked: null)', () => {
    using editor = createEditor();
    // A plain leading row followed by a task row.
    importMarkdown(editor, '- plain\n- [x] task');
    editor.read(() => {
      const list = $assertNodeType($getRoot().getFirstChild(), $isListNode);
      const [plain] = list.getChildren() as ListItemNode[];
      expect(plain.getListItemPlain()).toBe(true);
    });
    expect(exportMarkdown(editor)).toBe('- plain\n- [x] task');
  });
});
