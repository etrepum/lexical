/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {buildEditorFromExtensions} from '@lexical/extension';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  TextNode,
} from 'lexical';
import {expect, onTestFinished, test} from 'vitest';

test('nested mutation updates and reads notify committed states in order (#7709)', () => {
  const editor = buildEditorFromExtensions({name: 'ordering'});
  const root = document.createElement('div');
  document.body.append(root);
  editor.setRootElement(root);
  onTestFinished(() => {
    editor.dispose();
    root.remove();
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
  const seen: string[] = [];
  editor.registerUpdateListener(({editorState}) => {
    seen.push(editorState.read(() => $getRoot().getTextContent()));
  });
  editor.update(
    () =>
      $getRoot()
        .clear()
        .append($createParagraphNode().append($createTextNode('first'))),
    {discrete: true},
  );
  editor.read(() => {});
  expect(seen).toEqual(['first', 'second']);
});
