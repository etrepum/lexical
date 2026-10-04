/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {buildEditorFromExtensions} from '@lexical/extension';
import {RichTextExtension} from '@lexical/rich-text';
import {YExtension} from '@lexical/y';
import * as Y from '@y/y';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  configExtension,
  defineExtension,
  type LexicalEditor,
  type TextNode,
} from 'lexical';
import {expect, onTestFinished, test} from 'vitest';
import {userEvent} from 'vitest/browser';

import {
  compose,
  korean,
} from '../../../../lexical/src/__tests__/browser/utils/compose';
import {AutocompleteExtension} from '../../../../lexical-playground/src/plugins/AutocompleteExtension';

function create(doc: Y.Doc, autocomplete = false) {
  const root = document.createElement('div');
  root.contentEditable = 'true';
  document.body.append(root);
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        RichTextExtension,
        configExtension(YExtension, {root: doc.get('root')}),
        configExtension(AutocompleteExtension, {
          dictionaries: {
            en: async () => ({minPrefixLength: 1, query: () => ' world'}),
            ko: async () => ({minPrefixLength: 1, query: () => null}),
          },
          disabled: !autocomplete,
        }),
      ],
      name: 'y-interactions',
    }),
  );
  editor.setRootElement(root);
  onTestFinished(() => {
    editor.dispose();
    root.remove();
    doc.destroy();
  });
  return {editor, root};
}

function seed(editor: LexicalEditor) {
  editor.update(
    () =>
      $getRoot().append(
        $createParagraphNode().append($createTextNode('hello')),
      ),
    {discrete: true},
  );
}

// Runs in the configured Chromium/Firefox/WebKit browser matrix.
test('remote edits preserve local selection format and style (#7238)', () => {
  const a = new Y.Doc();
  const b = new Y.Doc();
  const local = create(a);
  seed(local.editor);
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a));
  const remote = create(b);
  local.root.focus();
  local.editor.update(
    () => {
      const selection = ($getRoot().getFirstDescendant() as TextNode).select(
        3,
        3,
      );
      selection.format = 1;
      selection.style = 'color: red;';
    },
    {discrete: true},
  );
  remote.editor.update(
    () => ($getRoot().getFirstDescendant() as TextNode).spliceText(0, 0, 'x'),
    {discrete: true},
  );
  Y.applyUpdate(a, Y.encodeStateAsUpdate(b));
  local.editor.read('latest', () => {
    const selection = $getSelection();
    expect($isRangeSelection(selection) && selection.format).toBe(1);
    expect($isRangeSelection(selection) && selection.style).toBe('color: red;');
    expect($isRangeSelection(selection) && selection.anchor.offset).toBe(4);
  });
});

test('autocomplete ghost stays local and only accepted text is shared (#6844)', async () => {
  const a = new Y.Doc();
  const b = new Y.Doc();
  const local = create(a, true);
  seed(local.editor);
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a));
  const remote = create(b, true);
  local.root.focus();
  const before = Y.encodeStateVector(a);
  local.editor.update(
    () => ($getRoot().getFirstDescendant() as TextNode).selectEnd(),
    {discrete: true},
  );
  await expect
    .poll(
      () => local.root.querySelector('[data-autocomplete-ghost]')?.textContent,
    )
    .toContain('world');
  expect(remote.root.querySelector('[data-autocomplete-ghost]')).toBeNull();
  expect(Y.encodeStateVector(a)).toEqual(before);
  await userEvent.keyboard('{Tab}');
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a));
  expect(remote.editor.read('latest', () => $getRoot().getTextContent())).toBe(
    'hello world',
  );
});

test('composition commits alongside a remote edit in another paragraph', async () => {
  const a = new Y.Doc();
  const b = new Y.Doc();
  const local = create(a);
  seed(local.editor);
  local.editor.update(
    () =>
      $getRoot().append(
        $createParagraphNode().append($createTextNode('remote')),
      ),
    {discrete: true},
  );
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a));
  const remote = create(b);
  local.root.focus();
  local.editor.update(
    () => ($getRoot().getFirstDescendant() as TextNode).selectEnd(),
    {discrete: true},
  );
  local.root.addEventListener(
    'compositionupdate',
    () => {
      remote.editor.update(
        () =>
          ($getRoot().getLastDescendant() as TextNode).spliceText(6, 0, '!'),
        {discrete: true},
      );
      Y.applyUpdate(a, Y.encodeStateAsUpdate(b));
    },
    {once: true},
  );
  await compose(
    {editor: local.editor, rootElement: local.root},
    korean(['ㅎ', '하', '한']),
  );
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a));
  expect(local.editor.read('latest', () => $getRoot().getTextContent())).toBe(
    'hello한\n\nremote!',
  );
  expect(remote.editor.getEditorState().toJSON(true)).toEqual(
    local.editor.getEditorState().toJSON(true),
  );
});
