/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  buildEditorFromExtensions,
  getExtensionDependencyFromEditor,
} from '@lexical/extension';
import {
  $generateHtmlFromNodes,
  $generateNodesFromDOM,
  DOMImportExtension,
} from '@lexical/html';
import {
  $createTableNodeWithDimensions,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  TableCellHeaderStates,
  TableExtension,
} from '@lexical/table';
import {$getRoot, defineExtension, type LexicalEditor} from 'lexical';
import {assert, describe, expect, test} from 'vitest';

function importTable(editor: LexicalEditor, html: string, pipeline: string) {
  editor.update(
    () => {
      const dom = new DOMParser().parseFromString(html, 'text/html');
      const nodes =
        pipeline === 'legacy'
          ? $generateNodesFromDOM(editor, dom)
          : getExtensionDependencyFromEditor(
              editor,
              DOMImportExtension,
            ).output.$generateNodesFromDOM(dom);
      $getRoot()
        .clear()
        .append(...nodes);
    },
    {discrete: true},
  );
}

function $headers() {
  const table = $getRoot().getFirstChild();
  assert($isTableNode(table));
  return table.getChildren().map(row => {
    assert($isTableRowNode(row));
    return row.getChildren().map(cell => {
      assert($isTableCellNode(cell));
      return cell.getHeaderStyles();
    });
  });
}

describe.each(['legacy', 'extension'])(
  '%s table header serialization',
  pipeline => {
    test.each([
      false,
      {columns: false, rows: true},
      {columns: true, rows: false},
      true,
    ])('round trips header configuration %j', headers => {
      using editor = buildEditorFromExtensions(
        defineExtension({
          dependencies: [TableExtension],
          name: 'header-round-trip',
          theme: {tableScrollableWrapper: ''},
        }),
      );
      editor.update(
        () => {
          $getRoot()
            .clear()
            .append($createTableNodeWithDimensions(2, 2, headers));
        },
        {discrete: true},
      );
      const expected = editor.read($headers);
      for (let i = 0; i < 2; i++) {
        const html = editor.read(() => $generateHtmlFromNodes(editor));
        importTable(editor, html, pipeline);
        expect(editor.read($headers)).toEqual(expected);
      }
    });

    test('scope names the cells described by the header, not its own axis', () => {
      using editor = buildEditorFromExtensions(
        defineExtension({
          dependencies: [TableExtension],
          name: 'header-scope',
          theme: {tableScrollableWrapper: ''},
        }),
      );
      importTable(
        editor,
        '<table><tr><th scope="col">column heading</th><th scope="row">row heading</th><th scope="colgroup">column group</th><th scope="rowgroup">row group</th></tr></table>',
        pipeline,
      );
      expect(editor.read($headers)).toEqual([
        [
          TableCellHeaderStates.ROW,
          TableCellHeaderStates.COLUMN,
          TableCellHeaderStates.ROW,
          TableCellHeaderStates.COLUMN,
        ],
      ]);
    });

    test.each([
      TableCellHeaderStates.ROW,
      TableCellHeaderStates.COLUMN,
      TableCellHeaderStates.BOTH,
    ])(
      'preserves header state %i outside the first row and column',
      headerState => {
        using editor = buildEditorFromExtensions(
          defineExtension({
            dependencies: [TableExtension],
            name: 'interior-header',
            theme: {tableScrollableWrapper: ''},
          }),
        );
        editor.update(
          () => {
            const table = $createTableNodeWithDimensions(2, 2, false);
            const row = table.getLastChild();
            assert($isTableRowNode(row));
            const cell = row.getLastChild();
            assert($isTableCellNode(cell));
            cell.setHeaderStyles(headerState);
            $getRoot().clear().append(table);
          },
          {discrete: true},
        );
        const html = editor.read(() => $generateHtmlFromNodes(editor));
        importTable(editor, html, pipeline);
        expect(editor.read($headers)).toEqual([
          [0, 0],
          [0, headerState],
        ]);
      },
    );
  },
);
