/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// @vitest-environment node

import {
  buildEditorFromExtensions,
  getExtensionDependencyFromEditor,
} from '@lexical/extension';
import {$createLinkNode, LinkNode} from '@lexical/link';
import {MarkNode} from '@lexical/mark';
import {YExtension} from '@lexical/y';
import * as Y from '@y/y';
import {
  $create,
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $setState,
  configExtension,
  createState,
  defineExtension,
  type Klass,
  type LexicalNode,
  type ParagraphNode,
  type TextNode,
} from 'lexical';
import {expect, onTestFinished, test} from 'vitest';

const live = createState('independent-audit-shared', {
  parse: (value: unknown) => value,
});

function create(
  extraNodes: Klass<LexicalNode>[] = [],
  inlineFormatTypes?: readonly string[],
) {
  const doc = new Y.Doc({gc: false});
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(YExtension, {
          root: doc.get('root'),
          ...(inlineFormatTypes ? {inlineFormatTypes} : {}),
        }),
      ],
      name: 'independent-binding-audit',
      nodes: [LinkNode, MarkNode, ...extraNodes],
    }),
  );
  onTestFinished(() => {
    editor.dispose();
    doc.destroy();
  });
  return {
    binding: getExtensionDependencyFromEditor(editor, YExtension).output
      .binding,
    doc,
    editor,
  };
}

function child(doc: Y.Doc, parent: Y.Node, index = 0): Y.Node {
  const edge = parent.get(index) as {id: string};
  return doc.get('root').getAttr('tree:node:' + edge.id);
}

test('unrelated text edits retain token boundaries after adjacent line breaks', () => {
  const {doc, editor} = create();
  editor.update(
    () => {
      $getRoot().append(
        $createParagraphNode().append(
          $createLineBreakNode(),
          $createLineBreakNode(),
          $createTextNode('one').setMode('token'),
          $createTextNode('two').setMode('token'),
          $createTextNode('tail'),
        ),
      );
    },
    {discrete: true},
  );
  const run = child(doc, child(doc, doc.get('root')));
  const boundaries = () =>
    Array.from(run.toDelta().children).flatMap(op =>
      'format' in op && op.format?.boundary ? [op.format.boundary] : [],
    );
  const before = boundaries();
  expect(before).toHaveLength(2);
  editor.update(
    () => {
      $getRoot()
        .getFirstChildOrThrow<ParagraphNode>()
        .getLastChildOrThrow<TextNode>()
        .spliceText(4, 0, '!');
    },
    {discrete: true},
  );
  expect(boundaries()).toEqual(before);
});

test.each(['constructor', 'toString', 'hasOwnProperty', '__proto__'])(
  'unknown property %s survives editing a known sibling property',
  property => {
    const {doc, editor} = create();
    editor.update(
      () => {
        $getRoot().append(
          $createParagraphNode().append($createTextNode('text')),
        );
      },
      {discrete: true},
    );
    const paragraph = child(doc, doc.get('root'));
    paragraph.setAttr('p:' + property, 'future-property');
    editor.update(
      () => {
        $getRoot().getFirstChildOrThrow<ParagraphNode>().setFormat('center');
      },
      {discrete: true},
    );
    expect(paragraph.getAttr('p:' + property)).toBe('future-property');
  },
);

test('mutating a live wrapper NodeState value dirties its owning wrapper', () => {
  const {binding, editor} = create();
  const value = new Y.Node();
  let key = '';
  editor.update(
    () => {
      const link = $createLinkNode('https://example.com').append(
        $createTextNode('link'),
      );
      $setState(link, live, value);
      key = link.getKey();
      $getRoot().append($createParagraphNode().append(link));
    },
    {discrete: true},
  );
  const dirty = new Set<string>();
  const remove = editor.registerUpdateListener(
    ({dirtyElements}) => {
      for (const dirtyKey of dirtyElements.keys()) dirty.add(dirtyKey);
    },
    {synchronous: true},
  );
  onTestFinished(remove);
  binding.transact(() => value.insert(0, 'new value'));
  expect(dirty.has(key)).toBe(true);
});

class NamespacedInlineNode extends LinkNode {
  $config() {
    return this.config('mark:id:independent-audit', {extends: LinkNode});
  }
}

test('custom inline type names cannot collide with mark identifiers', () => {
  const {editor} = create(
    [NamespacedInlineNode],
    ['mark', 'mark:id:independent-audit'],
  );
  editor.update(
    () => {
      $getRoot().append(
        $createParagraphNode().append(
          $create(NamespacedInlineNode)
            .setURL('https://example.com')
            .append($createTextNode('namespaced')),
        ),
      );
    },
    {discrete: true},
  );
  editor.read('latest', () => {
    const paragraph = $getRoot().getFirstChildOrThrow<ParagraphNode>();
    const wrapper = paragraph.getFirstChildOrThrow();
    expect(wrapper.getType()).toBe(NamespacedInlineNode.getType());
    expect(
      paragraph
        .getAllTextNodes()[0]
        .getParentOrThrow()
        .getParentOrThrow()
        .getType(),
    ).toBe('paragraph');
  });
});
