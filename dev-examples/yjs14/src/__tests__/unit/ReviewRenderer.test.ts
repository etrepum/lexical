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
  createYDocumentView,
  YExtension,
  YSuggestionsExtension,
  YVersionsExtension,
} from '@lexical/y';
import * as Y from '@y/y';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  configExtension,
  type TextNode,
} from 'lexical';
import {expect, onTestFinished, test} from 'vitest';

import {renderReview} from '../../review';

function create() {
  const doc = new Y.Doc({gc: false});
  const main = buildEditorFromExtensions(
    configExtension(YExtension, {root: doc.get('root')}),
    YVersionsExtension,
  );
  main.update(() =>
    $getRoot().append($createParagraphNode().append($createTextNode('hello'))),
  );
  const binding = getExtensionDependencyFromEditor(main, YExtension).output
    .binding;
  const view = createYDocumentView(
    getExtensionDependencyFromEditor(main, YVersionsExtension).output.capture(),
    true,
  );
  const editor = buildEditorFromExtensions(
    configExtension(YExtension, {root: view.root}),
    configExtension(YSuggestionsExtension, {base: binding}),
  );
  onTestFinished(() => {
    editor.dispose();
    view.dispose();
    main.dispose();
    doc.destroy();
  });
  const suggestions = getExtensionDependencyFromEditor(
    editor,
    YSuggestionsExtension,
  ).output;
  const container = document.createElement('div');
  const controls = document.createElement('ol');
  const render = () =>
    renderReview(
      container,
      controls,
      suggestions.getDelta(),
      suggestions.getSuggestions(),
      (id, accept) => {
        if (accept) suggestions.accept(id);
        else suggestions.reject(id);
      },
    );
  return {container, controls, editor, render};
}

test('review deltas resolve stored item IDs and show inserted and deleted text', () => {
  const {container, controls, editor, render} = create();
  editor.update(() => {
    ($getRoot().getFirstDescendant() as TextNode).spliceText(0, 2, 'REVIEW');
    $getRoot().append(
      $createParagraphNode().append($createTextNode('new paragraph')),
    );
  });
  render();
  expect(
    [...container.querySelectorAll('ins')]
      .map(node => node.textContent)
      .join(' '),
  ).toContain('REVIEW');
  expect(container.querySelector('del')!.textContent).toBe('he');
  expect(container.textContent).toContain('new paragraph');
  expect(controls.querySelectorAll('li')).toHaveLength(2);
});

test('review formats use independently encoded bits', () => {
  const {container, editor, render} = create();
  editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode)
      .toggleFormat('bold')
      .toggleFormat('italic'),
  );
  render();
  const text = [...container.querySelectorAll('span')].find(
    node => node.style.fontWeight === 'bold',
  )!;
  expect(text).toBeDefined();
  expect(text.textContent).toBe('hello');
  expect(text.style.fontWeight).toBe('bold');
  expect(text.style.fontStyle).toBe('italic');
});
