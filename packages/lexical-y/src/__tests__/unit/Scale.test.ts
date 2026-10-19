/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
// @vitest-environment node

import {buildEditorFromExtensions} from '@lexical/extension';
import {YExtension} from '@lexical/y';
import * as Y from '@y/y';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  configExtension,
  defineExtension,
  type ParagraphNode,
  type TextNode,
} from 'lexical';
import {expect, onTestFinished, test, vi} from 'vitest';

import {getNodeByID, getNodeStore} from '../../Topology';

function create(doc = new Y.Doc()) {
  const root = doc.get('root');
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [configExtension(YExtension, {root})],
      name: 'scale-test',
    }),
  );
  onTestFinished(() => editor.dispose());
  return {doc, editor, root};
}

test('a keystroke never reads the root sequence or unrelated attributes at 2,000 blocks', () => {
  const {doc, editor, root} = create();
  editor.update(() => {
    for (let i = 0; i < 2000; i++)
      $getRoot().append(
        $createParagraphNode().append($createTextNode('para ' + i)),
      );
  });
  const encoded = Y.encodeStateAsUpdate(doc).byteLength;
  expect(encoded).toBeLessThan(900000);
  const store = getNodeStore(root)!;
  const last = getNodeByID(root, root.get(root.length - 1).id)!;
  const rootRead = vi.spyOn(root, 'toArray');
  const storeRead = vi.spyOn(store, 'toArray');
  const unrelated = vi.spyOn(last, 'getAttrs');
  onTestFinished(() => {
    vi.restoreAllMocks();
  });
  editor.update(() => {
    $getRoot()
      .getFirstChildOrThrow<ParagraphNode>()
      .getFirstChildOrThrow<TextNode>()
      .setTextContent('x');
  });
  expect(rootRead).not.toHaveBeenCalled();
  expect(storeRead).not.toHaveBeenCalled();
  expect(unrelated).not.toHaveBeenCalled();
});

test('remote Enter updates touched containers without reading unrelated attributes or rescanning storage', () => {
  const a = create();
  a.editor.update(() => {
    for (let i = 0; i < 2000; i++)
      $getRoot().append(
        $createParagraphNode().append($createTextNode('para ' + i)),
      );
  });
  const b = create();
  Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(a.doc));
  const last = getNodeByID(b.root, b.root.get(b.root.length - 1).id)!;
  const attrs = vi.spyOn(last, 'getAttrs');
  const scan = vi.spyOn(getNodeStore(b.root)!, 'toArray');
  onTestFinished(() => {
    vi.restoreAllMocks();
  });
  const before = Y.encodeStateVector(b.doc);
  a.editor.update(() => {
    $getRoot().getFirstChildOrThrow().insertAfter($createParagraphNode());
  });
  Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(a.doc, before));
  expect(b.editor.getEditorState().toJSON()).toEqual(
    a.editor.getEditorState().toJSON(),
  );
  expect(attrs).not.toHaveBeenCalled();
  expect(scan).not.toHaveBeenCalled();
});

test('deleted node storage never accumulates per-node map keys', () => {
  const {doc, editor, root} = create();
  editor.update(() => $getRoot().append($createParagraphNode()));
  const keys = Object.keys(root.getAttrs()).sort();
  const before = Y.encodeStateAsUpdate(doc).byteLength;
  for (let i = 0; i < 100; i++) {
    editor.update(() => $getRoot().append($createParagraphNode()));
    editor.update(() => $getRoot().getLastChildOrThrow().remove());
  }
  Y.gcIdSet(doc, Y.createDeleteSetFromStructStore(doc.store));
  expect(Object.keys(root.getAttrs()).sort()).toEqual(keys);
  expect(getNodeStore(root)!.length).toBe(1);
  expect(Y.encodeStateAsUpdate(doc).byteLength - before).toBeLessThan(5000);
});

test('remote keystrokes never scan the unchanged root or node store', () => {
  const a = create();
  a.editor.update(() => {
    for (let i = 0; i < 2000; i++)
      $getRoot().append(
        $createParagraphNode().append($createTextNode('para ' + i)),
      );
  });
  const b = create();
  Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(a.doc));
  const rootRead = vi.spyOn(b.root, 'toArray');
  const storeRead = vi.spyOn(getNodeStore(b.root)!, 'toArray');
  onTestFinished(() => {
    vi.restoreAllMocks();
  });
  const before = Y.encodeStateVector(b.doc);
  a.editor.update(() =>
    $getRoot()
      .getFirstChildOrThrow<ParagraphNode>()
      .getFirstChildOrThrow<TextNode>()
      .spliceText(0, 0, 'x'),
  );
  Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(a.doc, before));
  expect(b.editor.getEditorState().toJSON()).toEqual(
    a.editor.getEditorState().toJSON(),
  );
  expect(rootRead).not.toHaveBeenCalled();
  expect(storeRead).not.toHaveBeenCalled();
});
