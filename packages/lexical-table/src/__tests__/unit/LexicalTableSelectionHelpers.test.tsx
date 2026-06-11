/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {NodeKey} from 'lexical';

import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
  registerTableSelectionObserver,
  TableNode,
} from '@lexical/table';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import {initializeUnitTest} from 'lexical/src/__tests__/utils';
import {describe, expect, test} from 'vitest';

import {TableObservers} from '../../LexicalTableObserver';
import {$handleTableSelectionChangeCommand} from '../../LexicalTableSelectionHelpers';

function $createTestTable(): TableNode {
  const tableNode = $createTableNode();
  for (let row = 0; row < 2; row++) {
    const rowNode = $createTableRowNode();
    for (let col = 0; col < 2; col++) {
      rowNode.append(
        $createTableCellNode().append(
          $createParagraphNode().append($createTextNode(`${row}-${col}`)),
        ),
      );
    }
    tableNode.append(rowNode);
  }
  return tableNode;
}

describe('LexicalTableSelectionHelpers', () => {
  describe('regression #8670', () => {
    initializeUnitTest(testEnv => {
      test('selection change ignores a stale shouldCheckSelectionForTable key', () => {
        const {editor} = testEnv;
        const tableObservers = new TableObservers();
        let tableKey!: NodeKey;

        editor.update(
          () => {
            const paragraph = $createParagraphNode().append(
              $createTextNode('above'),
            );
            const tableNode = $createTestTable();
            $getRoot().clear().append(paragraph, tableNode);
            tableKey = tableNode.getKey();
            paragraph.selectEnd();
          },
          {discrete: true},
        );

        // Pressing ArrowDown above the table records the table key to
        // check on the next selection change (the Firefox workaround for
        // scrollable tables)
        tableObservers.setShouldCheckSelectionForTable(tableKey);

        // The table is removed before the next selection change occurs
        editor.update(
          () => {
            const root = $getRoot();
            root.getLastChildOrThrow().remove();
            root.selectEnd();
          },
          {discrete: true},
        );

        expect(() => {
          editor.update(
            () => {
              expect(
                $handleTableSelectionChangeCommand(tableObservers, editor),
              ).toBe(false);
            },
            {discrete: true},
          );
        }).not.toThrow();
      });

      test('selection change self-heals observers for tables removed while the root element was detached', () => {
        const {editor} = testEnv;
        const cleanup = registerTableSelectionObserver(editor);
        try {
          editor.update(
            () => {
              $getRoot()
                .clear()
                .append(
                  $createParagraphNode().append($createTextNode('above')),
                  $createTestTable(),
                );
            },
            {discrete: true},
          );

          // Removing the table while the root element is detached skips
          // reconciliation, so the TableNode destroyed mutation never
          // fires and the observers registry keeps a stale entry
          const rootElement = editor.getRootElement();
          expect(rootElement).not.toBeNull();
          editor.setRootElement(null);
          editor.update(
            () => {
              $getRoot().getLastChildOrThrow().remove();
            },
            {discrete: true},
          );
          editor.setRootElement(rootElement);

          // Without self-healing every subsequent selection change throws
          expect(() => {
            editor.dispatchCommand(SELECTION_CHANGE_COMMAND, undefined);
            editor.dispatchCommand(SELECTION_CHANGE_COMMAND, undefined);
          }).not.toThrow();

          // New tables still work after the registry healed itself
          editor.update(
            () => {
              $getRoot().append($createTestTable());
            },
            {discrete: true},
          );
          expect(() =>
            editor.dispatchCommand(SELECTION_CHANGE_COMMAND, undefined),
          ).not.toThrow();
        } finally {
          cleanup();
        }
      });
    });
  });
});
