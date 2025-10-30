/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {buildEditorFromExtensions} from '@lexical/extension';
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $isParagraphNode,
  LexicalNode,
} from 'lexical';
import {describe, expect, test} from 'vitest';

import {$createChildEmitter, $createRootEmitter} from '../../EmitterState';

describe('$createRootEmitter', () => {
  test('Can emit a series of inline nodes', () => {
    const editor = buildEditorFromExtensions();
    editor.update(
      () => {
        const inlines = [
          $createTextNode('hello'),
          $createLineBreakNode(),
          $createTextNode('world'),
        ];
        const emitter = $createRootEmitter();
        for (const node of inlines) {
          emitter.$emitNode(node);
        }
        const list = emitter.close();
        expect(list).toEqual(inlines);
      },
      {discrete: true},
    );
  });
  test('Can emit a series of mixed nodes', () => {
    const editor = buildEditorFromExtensions();
    editor.update(
      () => {
        const mixed = [
          $createTextNode('hello'),
          $createLineBreakNode(),
          $createTextNode('world'),
          $createParagraphNode(),
        ];
        const emitter = $createRootEmitter();
        for (const node of mixed) {
          emitter.$emitNode(node);
        }
        const list = emitter.close();
        expect(list).toEqual(mixed);
      },
      {discrete: true},
    );
  });
  test('Explicit paragraphs are not mixed up with implicit paragraphs', () => {
    const editor = buildEditorFromExtensions();
    editor.update(
      () => {
        const nodes: [parent: LexicalNode | null, children: LexicalNode[]][] = [
          [$createParagraphNode(), []],
          [null, [$createTextNode('soft break after')]],
          [
            null,
            [
              $createTextNode('soft break before'),
              $createLineBreakNode(),
              $createTextNode('world'),
            ],
          ],
          [$createParagraphNode(), [$createTextNode('paragraph')]],
        ];
        const emitter = $createRootEmitter();
        for (const [parent, children] of nodes) {
          if (parent) {
            emitter.$emitNode(parent);
          }
          const childEmitter = $createChildEmitter(
            emitter,
            parent,
            parent ? undefined : 'softBreak',
          );
          for (const child of children) {
            childEmitter.$emitNode(child);
          }
          childEmitter.close();
        }
        const list = emitter.close();
        const expectedTopLevel = nodes.flatMap(([parent, children]) =>
          parent ? [parent] : children,
        );
        expectedTopLevel.splice(2, 0, list[2]); // Add the soft break
        expect(list).toEqual(expectedTopLevel);
        expect(
          list[0] && $isParagraphNode(list[0]) && list[0].getChildren(),
        ).toEqual([]);
        expect(
          list[list.length - 1] &&
            $isParagraphNode(list[list.length - 1]) &&
            list[list.length - 1].getTextContent(),
        ).toEqual('paragraph');
      },
      {discrete: true},
    );
  });
  // test('$softBreak creates a newline between inline nodes', () => {
  //   const editor = buildEditorFromExtensions();
  //   editor.update(
  //     () => {
  //       const [hello, world] = [
  //         $createTextNode('hello'),
  //         $createTextNode('world'),
  //       ];
  //       const emitter = $createRootEmitter();
  //       emitter.$softBreak();
  //       emitter.$emitNode(hello);
  //       emitter.$softBreak();
  //       emitter.$emitNode(world);
  //       emitter.$softBreak();
  //       const list = emitter.close();
  //       assert($isParagraphNode(list[0]), 'list has a ParagraphNode');
  //       expect(list).toHaveLength(1);
  //       const children = list[0].getChildren();
  //       expect(children[0]).toBe(hello);
  //       assert($isLineBreakNode(children[1]), '$isLineBreakNode');
  //       expect(children[2]).toBe(world);
  //       expect(children).toHaveLength(3);
  //     },
  //     {discrete: true},
  //   );
  // });
  // test('$emitNode returns a block emitter', () => {
  //   const editor = buildEditorFromExtensions();
  //   editor.update(() => {
  //     const emitter = $createRootEmitter();
  //     const pEmitter = emitter.$emitNode($createParagraphNode());
  //     pEmitter.$emitNode($createTextNode('this is in p0'));
  //     pEmitter.$softBreak();
  //     pEmitter.$emitNode($createTextNode('has soft break'));
  //     emitter.$emitNode($createTextNode('lifted to p1'));
  //     const list = emitter.close();
  //     assert($isParagraphNode(list[0]), 'list[0] is a ParagraphNode');
  //     assert($isParagraphNode(list[1]), 'list[1] is a ParagraphNode');
  //     expect(list.map((n) => n.getTextContent())).toEqual([
  //       'this is in p0\nhas soft break',
  //       'lifted to p1',
  //     ]);
  //   });
  // });
  // test('$emitNode returns a shadow root emitter', () => {
  //   const editor = buildEditorFromExtensions({
  //     name: 'root',
  //     nodes: [TestShadowRootNode],
  //   });
  //   editor.update(
  //     () => {
  //       const emitter = $createRootEmitter();
  //       const sEmitter = emitter.$emitNode($createTestShadowRootNode());
  //       const pEmitter = sEmitter.$emitNode($createParagraphNode());
  //       pEmitter.$emitNode($createTextNode('this is in p0'));
  //       pEmitter.$emitNode($createTestShadowRootNode());
  //       pEmitter.$emitNode($createTextNode('p0 got split into p1'));
  //       sEmitter.$emitNode($createTextNode('lifted to p2'));
  //       const list = emitter.close();
  //       assert(
  //         list[0] instanceof TestShadowRootNode,
  //         'list[0] is a TestShadowRootNode',
  //       );
  //       expect(list).toHaveLength(1);
  //       const shadowList = list[0].getChildren();
  //       assert(
  //         $isParagraphNode(shadowList[0]),
  //         'shadowList[0] is a ParagraphNode',
  //       );
  //       assert(
  //         shadowList[1] instanceof TestShadowRootNode,
  //         'shadowList[1] is a TestShadowRootNode',
  //       );
  //       assert(
  //         $isParagraphNode(shadowList[2]),
  //         'shadowList[2] is a ParagraphNode',
  //       );
  //       assert(
  //         $isParagraphNode(shadowList[3]),
  //         'shadowList[2] is a ParagraphNode',
  //       );
  //       expect(shadowList.map((n) => n.getTextContent())).toEqual([
  //         'this is in p0',
  //         '', // shadow
  //         'p0 got split into p1',
  //         'lifted to p2',
  //       ]);
  //     },
  //     {discrete: true},
  //   );
  // });
});
