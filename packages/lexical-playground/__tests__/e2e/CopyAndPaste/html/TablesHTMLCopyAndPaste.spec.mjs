/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {
  assertHTML,
  assertTableSelectionCoordinates,
  focusEditor,
  html,
  initialize,
  insertTable,
  pasteFromClipboard,
  selectCellsFromTableCords,
  test,
} from '../../../utils/index.mjs';

test.skip(({isPlainText}) => isPlainText, 'Requires rich text');

test.describe('HTML Tables CopyAndPaste', () => {
  test.beforeEach(({isCollab, page}) =>
    initialize({isCollab, page, tableHorizontalScroll: false}),
  );

  test.describe(() => {
    test.fixme(
      ({isCollab}) => isCollab,
      'Table selection styles are not properly selected/deselected',
    );
    test('Copy + paste - Merge Grids', async ({page}) => {
      await focusEditor(page);
      await insertTable(page, 4, 4);

      const clipboard = {
        'text/html': `<meta charset='utf-8'><table class="PlaygroundEditorTheme__table"><colgroup><col><col><col><col><col></colgroup><tbody><tr><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="border: 1px solid black; width: 140px; vertical-align: top; text-align: start; background-color: rgb(242, 243, 245);"><p class="PlaygroundEditorTheme__paragraph"><span>a</span></p></th><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="border: 1px solid black; width: 140px; vertical-align: top; text-align: start; background-color: rgb(242, 243, 245);"><p class="PlaygroundEditorTheme__paragraph"><span>b</span></p></th></tr><tr><th class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader" style="border: 1px solid black; width: 140px; vertical-align: top; text-align: start; background-color: rgb(242, 243, 245);"><p class="PlaygroundEditorTheme__paragraph"><span>c</span></p></th><td class="PlaygroundEditorTheme__tableCell" style="border: 1px solid black; width: 140px; vertical-align: top; text-align: start;"><p class="PlaygroundEditorTheme__paragraph"><span>d</span></p></td></tr></tbody></table>`,
      };

      await selectCellsFromTableCords(
        page,
        {x: 0, y: 0},
        {x: 3, y: 3},
        true,
        false,
      );

      await pasteFromClipboard(page, clipboard);
      // Pasting preserves the whole-table selection, including cells whose
      // imported background color caused their DOM to be replaced.
      await assertTableSelectionCoordinates(page, {
        anchor: {x: 0, y: 0},
        focus: {x: 3, y: 3},
      });

      await assertHTML(
        page,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <br data-lexical-managed-linebreak="true" />
          </p>
          <table
            class="PlaygroundEditorTheme__table PlaygroundEditorTheme__tableSelection"
            dir="auto">
            <colgroup>
              <col style="width: 92px" />
              <col style="width: 92px" />
              <col style="width: 92px" />
              <col style="width: 92px" />
            </colgroup>
            <tr dir="auto">
              <th
                class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader PlaygroundEditorTheme__tableCellSelected"
                dir="auto"
                style="background-color: rgb(242, 243, 245)">
                <p class="PlaygroundEditorTheme__paragraph" dir="auto">
                  <span data-lexical-text="true">a</span>
                </p>
              </th>
              <th
                class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader PlaygroundEditorTheme__tableCellSelected"
                dir="auto"
                style="background-color: rgb(242, 243, 245)">
                <p class="PlaygroundEditorTheme__paragraph" dir="auto">
                  <span data-lexical-text="true">b</span>
                </p>
              </th>
              <th
                class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader PlaygroundEditorTheme__tableCellSelected"
                dir="auto">
                <p class="PlaygroundEditorTheme__paragraph" dir="auto">
                  <br data-lexical-managed-linebreak="true" />
                </p>
              </th>
              <th
                class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader PlaygroundEditorTheme__tableCellSelected"
                dir="auto">
                <p class="PlaygroundEditorTheme__paragraph" dir="auto">
                  <br data-lexical-managed-linebreak="true" />
                </p>
              </th>
            </tr>
            <tr dir="auto">
              <th
                class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader PlaygroundEditorTheme__tableCellSelected"
                dir="auto"
                style="background-color: rgb(242, 243, 245)">
                <p class="PlaygroundEditorTheme__paragraph" dir="auto">
                  <span data-lexical-text="true">c</span>
                </p>
              </th>
              <td
                class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellSelected"
                dir="auto">
                <p
                  class="PlaygroundEditorTheme__paragraph"
                  dir="auto"
                  style="text-align: start">
                  <span data-lexical-text="true">d</span>
                </p>
              </td>
              <td
                class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellSelected"
                dir="auto">
                <p class="PlaygroundEditorTheme__paragraph" dir="auto">
                  <br data-lexical-managed-linebreak="true" />
                </p>
              </td>
              <td
                class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellSelected"
                dir="auto">
                <p class="PlaygroundEditorTheme__paragraph" dir="auto">
                  <br data-lexical-managed-linebreak="true" />
                </p>
              </td>
            </tr>
            <tr dir="auto">
              <th
                class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader PlaygroundEditorTheme__tableCellSelected"
                dir="auto">
                <p class="PlaygroundEditorTheme__paragraph" dir="auto">
                  <br data-lexical-managed-linebreak="true" />
                </p>
              </th>
              <td
                class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellSelected"
                dir="auto">
                <p class="PlaygroundEditorTheme__paragraph" dir="auto">
                  <br data-lexical-managed-linebreak="true" />
                </p>
              </td>
              <td
                class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellSelected"
                dir="auto">
                <p class="PlaygroundEditorTheme__paragraph" dir="auto">
                  <br data-lexical-managed-linebreak="true" />
                </p>
              </td>
              <td
                class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellSelected"
                dir="auto">
                <p class="PlaygroundEditorTheme__paragraph" dir="auto">
                  <br data-lexical-managed-linebreak="true" />
                </p>
              </td>
            </tr>
            <tr dir="auto">
              <th
                class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellHeader PlaygroundEditorTheme__tableCellSelected"
                dir="auto">
                <p class="PlaygroundEditorTheme__paragraph" dir="auto">
                  <br data-lexical-managed-linebreak="true" />
                </p>
              </th>
              <td
                class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellSelected"
                dir="auto">
                <p class="PlaygroundEditorTheme__paragraph" dir="auto">
                  <br data-lexical-managed-linebreak="true" />
                </p>
              </td>
              <td
                class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellSelected"
                dir="auto">
                <p class="PlaygroundEditorTheme__paragraph" dir="auto">
                  <br data-lexical-managed-linebreak="true" />
                </p>
              </td>
              <td
                class="PlaygroundEditorTheme__tableCell PlaygroundEditorTheme__tableCellSelected"
                dir="auto">
                <p class="PlaygroundEditorTheme__paragraph" dir="auto">
                  <br data-lexical-managed-linebreak="true" />
                </p>
              </td>
            </tr>
          </table>
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <br data-lexical-managed-linebreak="true" />
          </p>
        `,
      );
    });
  });
});
