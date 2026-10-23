/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {buildEditorFromExtensions} from '@lexical/extension';
import {YExtension} from '@lexical/y';
import * as Y from '@y/y';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  configExtension,
  TextNode,
} from 'lexical';
import {expect, onTestFinished, test} from 'vitest';

test('mutation listener updates and force-commit reads preserve collaboration order (#7709)', () => {
  const doc = new Y.Doc();
  const root = document.createElement('div');
  document.body.append(root);
  const editor = buildEditorFromExtensions(
    configExtension(YExtension, {root: doc.get('root')}),
  );
  editor.setRootElement(root);
  onTestFinished(() => {
    editor.dispose();
    root.remove();
    doc.destroy();
  });
  let nested = false;
  editor.registerMutationListener(
    TextNode,
    () => {
      if (!nested) {
        nested = true;
        editor.update(() =>
          ($getRoot().getFirstDescendant() as TextNode).setTextContent(
            'second',
          ),
        );
      }
    },
    {skipInitialization: true},
  );
  editor.registerMutationListener(TextNode, () => editor.read(() => {}), {
    skipInitialization: true,
  });
  editor.update(
    () =>
      $getRoot().append(
        $createParagraphNode().append($createTextNode('first')),
      ),
    {discrete: true},
  );
  const fresh = buildEditorFromExtensions(
    configExtension(YExtension, {root: doc.get('root')}),
  );
  onTestFinished(() => fresh.dispose());
  expect(editor.getEditorState().toJSON(true)).toEqual(
    fresh.getEditorState().toJSON(true),
  );
  expect(editor.read('latest', () => $getRoot().getTextContent())).toBe(
    'second',
  );
});
