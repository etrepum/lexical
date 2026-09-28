/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {describe, test} from 'vitest';

import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $setSelection,
  createEditor,
  type ElementNode,
  type TextNode,
} from '..';

for (const size of [100, 1000]) {
  describe(`size=${size} :: sibling splice`, () => {
    test('delete and restore middle', async ({bench}) => {
      const editor = createEditor();
      let parent: ElementNode;
      let middle: TextNode[];
      await bench(
        'delete and restore middle',
        {
          afterAll() {
            editor.read(() => {
              const children = parent.getChildren();
              if (
                children.length !== size + 2 ||
                parent.getTextContent() !== 'x'.repeat(size + 2)
              )
                throw new Error('Invalid restored children');
              for (let i = 1; i < children.length; i++) {
                const previous = children[i].getPreviousSibling();
                if (previous === null || !previous.is(children[i - 1]))
                  throw new Error('Invalid sibling links');
              }
            });
          },
          beforeAll() {
            editor.update(
              () => {
                const nodes = Array.from({length: size + 2}, () =>
                  $createTextNode('x').toggleUnmergeable(),
                );
                middle = nodes.slice(1, -1);
                parent = $createParagraphNode().append(...nodes);
                $getRoot().clear().append(parent);
                $setSelection(null);
              },
              {discrete: true},
            );
          },
        },
        () =>
          editor.update(
            () => {
              parent.splice(1, size, []);
              if (parent.getChildrenSize() !== 2)
                throw new Error('Invalid deletion');
              parent.splice(1, 0, middle);
            },
            {discrete: true},
          ),
      ).run();
    });
  });
}
