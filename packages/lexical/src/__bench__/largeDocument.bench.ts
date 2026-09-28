/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {describe, test} from 'vitest';

import {
  $create,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $setSelection,
  createEditor,
  ElementNode,
  type LexicalEditor,
  type TextNode,
} from '..';

class BenchmarkElementNode extends ElementNode {
  $config() {
    return this.config('benchmark-element', {extends: ElementNode});
  }
  createDOM() {
    return document.createElement('div');
  }
  updateDOM() {
    return false;
  }
}

let disposePrevious: (() => void) | undefined;

for (const size of [1000, 10000]) {
  describe(`size=${size} :: large document`, () => {
    for (const operation of [
      'edit first',
      'edit middle',
      'edit last',
      'replace 100 paragraphs',
      'replace document',
      'remove dirty nested subtree',
      'remove dirty broad subtree',
    ]) {
      const hasSubtree = operation.endsWith('subtree');
      const subtreeSize =
        operation === 'remove dirty broad subtree' ? 1000 : 100;
      const subtreeDepth = operation === 'remove dirty broad subtree' ? 2 : 32;
      test(operation, async ({bench}) => {
        let editor: LexicalEditor;
        let nodes: TextNode[];
        let subtree: ElementNode;
        let nested: ElementNode[];
        let cycle = 0;
        let host: HTMLElement | undefined;

        const $populate = () => {
          nodes = [];
          $getRoot().clear();
          for (let i = 0; i < size; i++) {
            const text = $createTextNode('original');
            nodes.push(text);
            $getRoot().append($createParagraphNode().append(text));
          }
        };
        const $createNested = () => {
          subtree = $create(BenchmarkElementNode);
          nested = [subtree];
          let parent = subtree;
          for (let i = 0; i < subtreeDepth; i++) {
            const next = $create(BenchmarkElementNode);
            parent.append(next);
            nested.push(next);
            parent = next;
          }
          for (let i = 0; i < subtreeSize; i++) {
            parent.append($createParagraphNode().append($createTextNode('x')));
          }
          return subtree;
        };
        const run = () => {
          editor.update(
            () => {
              cycle++;
              switch (operation) {
                case 'edit first':
                case 'edit middle':
                case 'edit last': {
                  const index =
                    operation === 'edit first'
                      ? 0
                      : operation === 'edit middle'
                        ? size / 2
                        : size - 1;
                  nodes[index] = nodes[index].setTextContent(
                    cycle % 2 ? 'changed' : 'original',
                  );
                  break;
                }
                case 'replace 100 paragraphs': {
                  const replacements = [];
                  for (let i = 0; i < 100; i++) {
                    replacements.push(
                      $createParagraphNode().append(
                        $createTextNode('original'),
                      ),
                    );
                  }
                  $getRoot().splice(size / 2, 100, replacements);
                  break;
                }
                case 'replace document':
                  $populate();
                  break;
                case 'remove dirty nested subtree':
                case 'remove dirty broad subtree': {
                  for (const node of nested) node.getWritable();
                  const previous = subtree;
                  previous.replace($createNested());
                  break;
                }
              }
            },
            {discrete: true},
          );
        };
        const verify = () => {
          editor.read(() => {
            const root = $getRoot();
            const expectedCount = size + (hasSubtree ? 1 : 0);
            if (root.getChildrenSize() !== expectedCount)
              throw new Error('Unexpected child count');
            const texts = root.getAllTextNodes();
            if (texts.length !== size + (hasSubtree ? subtreeSize : 0))
              throw new Error('Unexpected text count');
            const index =
              operation === 'edit first'
                ? 0
                : operation === 'edit middle'
                  ? size / 2
                  : size - 1;
            if (
              operation.startsWith('edit ') &&
              texts[index].getTextContent() !==
                (cycle % 2 ? 'changed' : 'original')
            )
              throw new Error('Edit did not change text');
            if (host) {
              if (host.children.length !== expectedCount)
                throw new Error('DOM child count mismatch');
              if (
                host.textContent !==
                texts.map(node => node.getTextContent()).join('')
              )
                throw new Error('DOM text mismatch');
              if (
                editor._keyToDOMMap.size !==
                editor.getEditorState()._nodeMap.size
              )
                throw new Error('DOM map leaked removed nodes');
            }
          });
        };
        await bench(
          operation,
          {
            afterAll: verify,
            beforeAll() {
              if (disposePrevious) disposePrevious();
              editor = createEditor({
                nodes: [BenchmarkElementNode],
                onError(error) {
                  throw error;
                },
              });
              if (typeof document !== 'undefined') {
                host = document.createElement('div');
                host.contentEditable = 'true';
                document.body.appendChild(host);
                editor.setRootElement(host);
              }
              disposePrevious = () => {
                editor.setRootElement(null);
                if (host) host.remove();
                editor.update(() => $getRoot().clear(), {discrete: true});
                nodes = [];
                nested = [];
              };
              cycle = 0;
              editor.update(
                () => {
                  $populate();
                  if (hasSubtree) $getRoot().append($createNested());
                  $setSelection(null);
                },
                {discrete: true},
              );
            },
          },
          run,
        ).run();
      });
    }
  });
}
