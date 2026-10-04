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
import {
  compareYCheckpoints,
  createYDocumentView,
  YAttributionExtension,
  YExtension,
  YHistoryExtension,
  YSuggestionsExtension,
  YVersionsExtension,
} from '@lexical/y';
import * as Y from '@y/y';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getState,
  $setState,
  configExtension,
  createState,
  defineExtension,
  type LexicalEditor,
  type TextNode,
} from 'lexical';
import {expect, onTestFinished, test} from 'vitest';

const text = (editor: LexicalEditor) =>
  editor.read('latest', () => $getRoot().getTextContent());
function base(gc = false) {
  const doc = new Y.Doc({gc});
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(YExtension, {root: doc.get('root')}),
        YHistoryExtension,
        YVersionsExtension,
        configExtension(YAttributionExtension, {
          author: 'Alice',
          storage: doc.get('authors'),
        }),
      ],
      name: 'review-base',
    }),
  );
  onTestFinished(() => {
    editor.dispose();
    doc.destroy();
  });
  editor.update(() =>
    $getRoot().append($createParagraphNode().append($createTextNode('hello'))),
  );
  const binding = getExtensionDependencyFromEditor(editor, YExtension).output
    .binding;
  const versions = getExtensionDependencyFromEditor(
    editor,
    YVersionsExtension,
  ).output;
  const history = getExtensionDependencyFromEditor(editor, YHistoryExtension)
    .output.undoManager.value!;
  const attribution = getExtensionDependencyFromEditor(
    editor,
    YAttributionExtension,
  ).output;
  history.clear();
  return {attribution, binding, doc, editor, history, versions};
}
function proposal(gc = false) {
  const main = base(gc);
  const view = createYDocumentView(main.versions.capture(), true);
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(YExtension, {root: view.root}),
        configExtension(YSuggestionsExtension, {base: main.binding}),
        YHistoryExtension,
      ],
      name: 'proposal',
    }),
  );
  onTestFinished(() => {
    editor.dispose();
    view.dispose();
  });
  const suggestions = getExtensionDependencyFromEditor(
    editor,
    YSuggestionsExtension,
  ).output;
  const history = getExtensionDependencyFromEditor(editor, YHistoryExtension)
    .output.undoManager.value!;
  return {editor, history, main, suggestions, view};
}

test('proposal edits remain separate, merge base edits, and accept with undo', () => {
  const {main, editor, suggestions} = proposal();
  editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(
      5,
      0,
      ' suggestion',
    ),
  );
  expect(text(main.editor)).toBe('hello');
  main.editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(0, 0, 'remote '),
  );
  expect(text(editor)).toBe('remote hello suggestion');
  main.history.stopCapturing();
  suggestions.accept();
  expect(text(main.editor)).toBe('remote hello suggestion');
  main.history.undo();
  expect(text(main.editor)).toBe('remote hello');
  expect(text(editor)).toBe('remote hello');
});

test.each([false, true])(
  'reject restores deleted content and preserves concurrent base edits (base gc=%s)',
  gc => {
    const {main, editor, suggestions} = proposal(gc);
    editor.update(() => $getRoot().clear());
    main.editor.update(() =>
      $getRoot().append(
        $createParagraphNode().append($createTextNode('remote')),
      ),
    );
    suggestions.reject();
    expect(text(main.editor)).toBe('hello\n\nremote');
    expect(text(editor)).toBe(text(main.editor));
  },
);

test('proposal undo, formatting, structural acceptance, and live shared state', () => {
  const {main, editor, suggestions, history} = proposal();
  const state = createState('value', {
    parse: (v: unknown) => (v instanceof Y.Node ? v : undefined),
  });
  const shared = new Y.Node();
  shared.insert(0, 'shared');
  editor.update(() => {
    const paragraph = $createParagraphNode().append(
      $createTextNode('new').toggleFormat('bold'),
    );
    $setState(paragraph, state, shared);
    $getRoot().append(paragraph);
  });
  history.undo();
  expect(text(editor)).toBe('hello');
  history.redo();
  expect(text(editor)).toBe('hello\n\nnew');
  suggestions.accept();
  expect(text(main.editor)).toBe(text(editor));
  main.editor.read('latest', () => {
    const node = $getRoot().getLastChildOrThrow();
    expect($getState(node, state)!.toString()).toBe('shared');
    expect(($getRoot().getLastDescendant() as TextNode).hasFormat('bold')).toBe(
      true,
    );
  });
});

test('attribution persists CRDT identities across peers and undo', () => {
  const {doc, editor, attribution, history, versions} = base();
  editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(5, 0, '!'),
  );
  history.undo();
  expect(attribution.getAttributions().inserts.clients.size).toBeGreaterThan(0);
  expect(attribution.getAttributions().deletes.clients.size).toBeGreaterThan(0);
  const fork = createYDocumentView(versions.capture());
  onTestFinished(() => fork.dispose());
  expect(fork.doc.get('authors').getAttrs()).toEqual(
    doc.get('authors').getAttrs(),
  );
  expect(() => attribution.getDelta()).not.toThrow();
});

test('checkpoint comparison survives live GC and never changes the live document', () => {
  const {doc, editor, versions, history} = base();
  const before = versions.capture();
  editor.update(() => $getRoot().clear());
  history.clear();
  Y.gcIdSet(doc, Y.createDeleteSetFromStructStore(doc.store));
  const after = versions.capture();
  const encoded = Y.encodeStateAsUpdate(doc);
  const comparison = compareYCheckpoints(before, after);
  expect(JSON.stringify(comparison.getDelta())).toContain('hello');
  const reader = buildEditorFromExtensions(
    configExtension(YExtension, {root: comparison.before.root}),
  );
  expect(text(reader)).toBe('hello');
  expect(text(editor)).toBe('');
  reader.dispose();
  comparison.dispose();
  expect(Y.encodeStateAsUpdate(doc)).toEqual(encoded);
});

test('resumed proposals include accepted edits missed while offline and detach on disposal', () => {
  const main = base(true);
  const view = createYDocumentView(main.versions.capture(), true);
  const offline = buildEditorFromExtensions(
    configExtension(YExtension, {root: view.root}),
  );
  offline.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(5, 0, ' proposal'),
  );
  offline.dispose();
  main.editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(0, 0, 'accepted '),
  );
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(YExtension, {root: view.root}),
        configExtension(YSuggestionsExtension, {base: main.binding}),
      ],
      name: 'resumed-proposal',
    }),
  );
  expect(text(editor)).toBe('accepted hello proposal');
  expect(text(main.editor)).toBe('accepted hello');
  editor.dispose();
  const saved = Y.encodeStateAsUpdate(view.doc);
  main.editor.update(() => $getRoot().clear());
  expect(Y.encodeStateAsUpdate(view.doc)).toEqual(saved);
  view.dispose();
});
