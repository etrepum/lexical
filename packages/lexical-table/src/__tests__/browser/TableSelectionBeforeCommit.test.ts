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
  $createTableCellNode,
  $createTableNodeWithDimensions,
  $createTableRowNode,
  $createTableSelectionFrom,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  $isTableSelection,
  getTableObserverFromTableElement,
  TableExtension,
} from '@lexical/table';
import {
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import {assert, expect, onTestFinished, test, vi} from 'vitest';

function mount() {
  const root = document.createElement('div');
  root.contentEditable = 'true';
  document.body.appendChild(root);
  const editor = buildEditorFromExtensions({
    dependencies: [RichTextExtension, TableExtension],
    name: 'test/table-before-commit',
    theme: {tableCellSelected: 'selected-cell'},
  });
  editor.setRootElement(root);
  onTestFinished(() => {
    editor.dispose();
    root.remove();
  });
  return {editor, root};
}

test.each(['caret', 'range', 'table'])(
  'selects a newly created table before its DOM exists (%s)',
  kind => {
    const {editor, root} = mount();
    const updates = vi.fn();
    editor.registerUpdateListener(updates);
    const previousState = editor.getEditorState();
    const listener = vi.fn(() => {
      expect(root.querySelector('table')).toBe(null);
      expect(editor.getEditorState()).toBe(previousState);
      expect($isTableSelection($getSelection())).toBe(kind !== 'caret');
      return false;
    });
    const unregister = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      listener,
      COMMAND_PRIORITY_LOW,
    );
    editor.update(
      () => {
        const table = $createTableNodeWithDimensions(2, 2);
        $getRoot().clear().append(table);
        const cells = table.getChildren().flatMap(row => {
          assert($isTableRowNode(row));
          return row.getChildren();
        });
        const first = cells[0];
        const last = cells.at(-1)!;
        assert($isTableCellNode(first) && $isTableCellNode(last));
        if (kind === 'caret') {
          first.selectStart();
        } else if (kind === 'table') {
          $setSelection($createTableSelectionFrom(table, first, last));
        } else {
          const selection = $createRangeSelection();
          selection.anchor.set(first.getKey(), 0, 'element');
          selection.focus.set(last.getKey(), 0, 'element');
          $setSelection(selection);
        }
      },
      {discrete: true},
    );
    unregister();
    expect(listener).toHaveBeenCalled();
    expect(updates).toHaveBeenCalledTimes(1);
    const tableDOM = root.querySelector('table');
    assert(tableDOM !== null);
    const observer = getTableObserverFromTableElement(tableDOM);
    assert(observer !== null);
    expect(root.querySelectorAll('.selected-cell')).toHaveLength(
      kind === 'caret' ? 0 : 4,
    );
    expect(observer.tableSelection !== null).toBe(kind !== 'caret');

    // DOM cleanup must preserve the new range selection.
    editor.update(
      () => {
        const paragraph = $createParagraphNode().append(
          $createTextNode('After'),
        );
        $getRoot().append(paragraph);
        paragraph.selectStart();
      },
      {discrete: true},
    );
    editor.read(() => expect($isRangeSelection($getSelection())).toBe(true));
    expect(root.querySelectorAll('.selected-cell')).toHaveLength(0);
    expect(observer.tableSelection).toBe(null);
    expect(updates).toHaveBeenCalledTimes(2);
  },
);

test('includes newly inserted cells when synchronizing selection DOM', () => {
  const {editor, root} = mount();
  editor.update(
    () => {
      const table = $createTableNodeWithDimensions(1, 2);
      $getRoot().clear().append(table);
      table.selectStart();
    },
    {discrete: true},
  );
  const updates = vi.fn();
  editor.registerUpdateListener(updates);
  editor.update(
    () => {
      const table = $getRoot().getFirstChildOrThrow();
      assert($isTableNode(table));
      const row = $createTableRowNode();
      const firstNewCell = $createTableCellNode().append(
        $createParagraphNode(),
      );
      const lastNewCell = $createTableCellNode().append($createParagraphNode());
      row.append(firstNewCell, lastNewCell);
      table.append(row);
      const selection = $createRangeSelection();
      selection.anchor.set(firstNewCell.getKey(), 0, 'element');
      selection.focus.set(lastNewCell.getKey(), 0, 'element');
      $setSelection(selection);
    },
    {discrete: true},
  );
  expect(root.querySelectorAll('tr')).toHaveLength(2);
  expect(root.querySelectorAll('.selected-cell')).toHaveLength(2);
  expect(updates).toHaveBeenCalledTimes(1);
});
