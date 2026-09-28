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
  $isTextNode,
  $selectAll,
  $setSelection,
  createEditor,
  type ElementNode,
  type RangeSelection,
  type TextNode,
} from '..';

for (const size of [100, 1000]) {
  describe(`size=${size} :: selection traversal`, () => {
    for (const nested of [false, true])
      test(nested ? 'nested' : 'flat', async ({bench}) => {
        const editor = createEditor();
        let selection: RangeSelection;
        const run = () =>
          editor.read(() => {
            for (let i = 0; i < 20; i++)
              if (selection.getNodes().length < size)
                throw new Error('Missing nodes');
          });
        await bench(
          nested ? 'nested' : 'flat',
          {
            afterAll() {
              editor.read(() => {
                const nodes = selection.getNodes();
                if (
                  nodes.filter($isTextNode).length !== size ||
                  new Set(nodes.map(n => n.getKey())).size !== nodes.length
                )
                  throw new Error('Invalid selection');
              });
            },
            beforeAll() {
              editor.update(
                () => {
                  const root = $getRoot();
                  root.clear();
                  let parent: ElementNode = root;
                  for (let i = 0; i < size; i++) {
                    if (nested && i % 10 === 0) {
                      parent = $createParagraphNode();
                      root.append(parent);
                    }
                    parent.append(
                      $createParagraphNode().append(
                        $createTextNode('original'),
                      ),
                    );
                  }
                  selection = $selectAll();
                },
                {discrete: true},
              );
              selection.setCachedNodes(null);
            },
          },
          run,
        ).run();
      });
  });
}

for (const size of [100, 1000])
  describe(`size=${size} :: partial formatting`, () => {
    test('last sibling', async ({bench}) => {
      const editor = createEditor();
      let tail: TextNode;
      const run = () =>
        editor.update(
          () => {
            const selection = tail.select(2, 6);
            selection.formatText('bold');
            tail = tail.getLatest();
            const middle = tail.getNextSibling() as TextNode;
            const end = middle.getNextSibling() as TextNode;
            if (middle.getTextContent() !== 'igin' || !middle.hasFormat('bold'))
              throw new Error('Incorrect format');
            tail = tail.mergeWithSibling(middle).mergeWithSibling(end);
            $setSelection(null);
          },
          {discrete: true},
        );
      await bench(
        'last sibling',
        {
          afterAll() {
            editor.read(() => {
              if (
                tail.getTextContent() !== 'original' ||
                tail.getParentOrThrow().getChildrenSize() !== size
              )
                throw new Error('Bad restoration');
            });
          },
          beforeAll() {
            editor.update(
              () => {
                const nodes = Array.from({length: size}, () =>
                  $createTextNode('original').toggleUnmergeable(),
                );
                tail = nodes[size - 1];
                $getRoot()
                  .clear()
                  .append($createParagraphNode().append(...nodes));
              },
              {discrete: true},
            );
          },
        },
        run,
      ).run();
    });
  });
