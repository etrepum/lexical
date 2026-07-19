/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {buildEditorFromExtensions} from '@lexical/extension';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from '@lexical/mdast';
import {defineExtension, type LexicalEditor} from 'lexical';
import {describe, expect, onTestFinished, test} from 'vitest';

import {MdastEditorExtension} from '../../extensions/MdastEditorExtension';

/**
 * These tests mount the *actual* `MdastEditorExtension` — the assembled
 * extension the example ships — in a real browser, so they exercise the
 * example's real list configuration (`hasSemanticNesting`) end to end
 * rather than a stand-in extension set. The point under test is a DOM
 * shape (nested `<ul>` inside its preceding row's `<li>`, and a real
 * `<input type="checkbox">`) that only exists once the editor reconciles
 * to a live contenteditable, so it lives in the `browser` vitest project.
 */
function mountEditor(markdown: string): {
  editor: LexicalEditor;
  root: HTMLElement;
} {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const contentEditable = document.createElement('div');
  contentEditable.contentEditable = 'true';
  container.appendChild(contentEditable);

  const editor = buildEditorFromExtensions(
    defineExtension({
      $initialEditorState: () => {
        $convertFromMarkdownString(markdown);
      },
      dependencies: [MdastEditorExtension],
      name: '[mdast-editor-example-semantic-lists-test]',
    }),
  );
  editor.setRootElement(contentEditable);

  onTestFinished(() => {
    editor.setRootElement(null);
    document.body.removeChild(container);
  });

  return {editor, root: contentEditable};
}

function markdownOf(editor: LexicalEditor): string {
  return editor.read(() => $convertToMarkdownString());
}

function topLevelItems(root: HTMLElement): HTMLLIElement[] {
  const list = root.querySelector('ul, ol');
  expect(list).not.toBeNull();
  return Array.from(list!.children).filter(
    (el): el is HTMLLIElement => el.tagName === 'LI',
  );
}

describe('mdast-editor semantic list representation', () => {
  test('renders a nested list inside its preceding row, not a wrapper li', () => {
    const {root} = mountEditor('- parent\n  - child');

    // Semantic representation: the sub-list lives inside the "parent" row's
    // own <li>, so the top-level list has exactly ONE <li> (not a content
    // item followed by a dedicated empty wrapper <li>, which is the default
    // representation this example opts out of).
    const items = topLevelItems(root);
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain('parent');

    const nested = items[0].querySelector('ul');
    expect(nested).not.toBeNull();
    expect(nested!.textContent).toContain('child');
    // No dedicated wrapper li: every li in the tree carries visible text.
    for (const li of root.querySelectorAll('li')) {
      expect(li.textContent!.trim().length).toBeGreaterThan(0);
    }
  });

  test('renders a real checkbox input for check-list rows', () => {
    const {root} = mountEditor('- [ ] todo\n- [x] done');

    const items = topLevelItems(root);
    expect(items).toHaveLength(2);
    for (const li of items) {
      const input = li.querySelector<HTMLInputElement>(
        'input[type="checkbox"]',
      );
      expect(input).not.toBeNull();
    }
    // The first row is unchecked, the second checked.
    const inputs = root.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    expect(inputs[0].checked).toBe(false);
    expect(inputs[1].checked).toBe(true);
  });

  test('renders a mixed task list with a plain row that has no checkbox', () => {
    const {editor, root} = mountEditor('- [ ] todo\n- just a note\n- [x] done');

    const items = topLevelItems(root);
    expect(items).toHaveLength(3);
    // The task rows render a real checkbox; the plain middle row renders
    // none — no leftover box, no role/aria-checked emulation.
    expect(items[0].querySelector('input[type="checkbox"]')).not.toBeNull();
    expect(items[1].querySelector('input[type="checkbox"]')).toBeNull();
    expect(items[1].hasAttribute('aria-checked')).toBe(false);
    expect(items[1].hasAttribute('role')).toBe(false);
    expect(items[1].textContent).toContain('just a note');
    expect(items[2].querySelector('input[type="checkbox"]')).not.toBeNull();
    // And it survives the Markdown round-trip as a bare item.
    expect(markdownOf(editor)).toBe('- [ ] todo\n- just a note\n- [x] done');
  });

  test('round-trips a nested list back to the same Markdown', () => {
    const {editor} = mountEditor('- parent\n  - child\n- sibling');
    expect(markdownOf(editor)).toBe('- parent\n  - child\n- sibling');
  });

  test('round-trips a nested check list back to the same Markdown', () => {
    const {editor} = mountEditor('- [x] done\n  - [ ] subtask');
    expect(markdownOf(editor)).toBe('- [x] done\n  - [ ] subtask');
  });
});
