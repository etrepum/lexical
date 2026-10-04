/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $createTableSelectionFrom,
  type TableCellNode,
  type TableNode,
  type TableRowNode,
} from '@lexical/table';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $setSelection,
  getEditorPropertyFromDOMNode,
  type LexicalEditor,
} from 'lexical';
import {expect, onTestFinished, test} from 'vitest';

import html from '../../../index.html?raw';

test('standalone example supports review, tables, comparison and collection in every retention mode', async () => {
  const page = new DOMParser().parseFromString(html, 'text/html');
  const main = page.querySelector('main')!;
  document.body.append(main);
  const {disposeExample} = await import('../../main');
  onTestFinished(() => {
    disposeExample();
    main.remove();
  });
  const element = (id: string) => document.getElementById(id)!;
  const click = (id: string) => element(id).click();
  const editor = (id: string) =>
    getEditorPropertyFromDOMNode(element(id)) as LexicalEditor;
  const text = (id: string) =>
    editor(id).read('latest', () => $getRoot().getTextContent());
  const append = (id: string, value: string) =>
    editor(id).update(() =>
      $getRoot().append($createParagraphNode().append($createTextNode(value))),
    );
  const action = (id: string, label: string) =>
    [...element(id).querySelectorAll('button')]
      .find(button => button.textContent === label)!
      .click();
  for (const mode of ['automatic', 'filtered', 'manual']) {
    (element('mode') as HTMLSelectElement).value = mode;
    click('reset');
    expect(element('alice').isContentEditable).toBe(true);
    expect(element('bob').isContentEditable).toBe(true);
    expect(text('alice')).toBe(text('bob'));
    const aliceValue = element('alice-shared-value') as HTMLTextAreaElement;
    const bobValue = element('bob-shared-value') as HTMLTextAreaElement;
    const editValue = (input: HTMLTextAreaElement, value: string) => {
      input.value = value;
      input.dispatchEvent(
        new InputEvent('input', {bubbles: true, inputType: 'insertText'}),
      );
    };
    expect(aliceValue.disabled).toBe(true);
    action('alice-actions', 'Add shared value');
    expect(aliceValue.value).toBe('Shared text');
    expect(bobValue.value).toBe('Shared text');
    expect(bobValue.disabled).toBe(false);
    editValue(aliceValue, 'Shared text!');
    expect(bobValue.value).toBe('Shared text!');
    action('alice-actions', 'Undo');
    expect(aliceValue.value).toBe('Shared text');
    expect(bobValue.value).toBe('Shared text');
    action('alice-actions', 'Redo');
    expect(bobValue.value).toBe('Shared text!');
    click('connection');
    editValue(aliceValue, 'Alice Shared text!');
    editValue(bobValue, 'Shared text! Bob');
    expect(aliceValue.value).toBe('Alice Shared text!');
    click('connection');
    expect(aliceValue.value).toBe('Alice Shared text! Bob');
    expect(bobValue.value).toBe(aliceValue.value);
    action('alice-actions', 'Release shared value');
    expect(aliceValue.disabled).toBe(true);
    expect(bobValue.value).toBe('');
    action('alice-actions', 'Undo');
    expect(bobValue.disabled).toBe(false);
    expect(bobValue.value).toBe('Alice Shared text! Bob');
    action('alice-actions', 'Insert table');
    expect(element('bob').querySelector('table')).not.toBeNull();
    editor('alice').update(() => {
      const table = $getRoot().getLastChildOrThrow<TableNode>();
      const first = table
        .getFirstChildOrThrow<TableRowNode>()
        .getFirstChildOrThrow<TableCellNode>();
      const last = table
        .getLastChildOrThrow<TableRowNode>()
        .getLastChildOrThrow<TableCellNode>();
      $setSelection($createTableSelectionFrom(table, first, last));
    });
    expect(
      element('alice').querySelectorAll('.table-cell-selected'),
    ).toHaveLength(9);
    const selectedCell = element('alice').querySelector(
      '.table-cell-selected',
    )!;
    expect(getComputedStyle(selectedCell).backgroundColor).toBe(
      'rgb(199, 221, 255)',
    );
    click('propose');
    expect(element('proposal').querySelector('table')).not.toBeNull();
    append('proposal', 'proposed');
    expect(text('alice')).not.toContain('proposed');
    append('alice', 'accepted concurrently');
    expect(text('proposal')).toContain('accepted concurrently');
    click('accept');
    expect(text('bob')).toContain('proposed');
    action('alice-actions', 'Undo');
    expect(text('alice')).not.toContain('proposed');
    expect(text('alice')).toContain('accepted concurrently');
    click('propose');
    append('proposal', 'rejected');
    click('reject');
    expect(text('proposal')).not.toContain('rejected');
    expect(text('proposal')).toBe(text('alice'));
    expect(element('attribution').textContent).toContain('Alice');
    const saved = text('alice');
    click('capture');
    action('alice-actions', 'Delete first');
    click('compare');
    expect(element('comparison').textContent).toContain('Edit here');
    click('clear-history');
    (element('allow-gc') as HTMLInputElement).checked = true;
    click('collect');
    click('show');
    expect(text('historical')).toBe(saved);
    expect(element('historical').isContentEditable).toBe(false);
    expect(text('alice')).toBe(text('bob'));
  }
});
