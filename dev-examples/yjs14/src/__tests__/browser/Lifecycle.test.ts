/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
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
    action('alice-actions', 'Insert table');
    expect(element('bob').querySelector('table')).not.toBeNull();
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
