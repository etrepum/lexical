/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
// @vitest-environment node

import type {LexicalEditor} from 'lexical';

import {
  buildEditorFromExtensions,
  getExtensionDependencyFromEditor,
} from '@lexical/extension';
import {YExtension, YHistoryExtension} from '@lexical/y';
import * as Y from '@y/y';
import {
  $create,
  $createParagraphNode,
  $getRoot,
  $getState,
  $setState,
  configExtension,
  createState,
  defineExtension,
  ElementNode,
  nodeSchema,
  rawValue,
  REDO_COMMAND,
  TextNode,
  UNDO_COMMAND,
  withField,
} from 'lexical';
import {expect, onTestFinished, test} from 'vitest';

const valueConfig = {
  parse: (value: unknown) => (value instanceof Y.Node ? value : undefined),
  unparse: (value: Y.Node | undefined) => value && value.toJSON(),
};
const live = createState('live', valueConfig);
const flat = createState('flatLive', valueConfig);
const elementSchema = nodeSchema<SharedElement>()({
  value: withField(rawValue<Y.Node>(), {field: '__value'}),
});
class SharedElement extends ElementNode {
  __value: Y.Node | undefined;
  $config() {
    return this.config('shared-element', {
      extends: ElementNode,
      json: elementSchema,
      stateConfigs: [live, {flat: true, stateConfig: flat}],
    });
  }
}
const textSchema = nodeSchema<SharedText>()({
  value: withField(rawValue<Y.Node>(), {field: '__value'}),
});
class SharedText extends TextNode {
  __value: Y.Node | undefined;
  $config() {
    return this.config('shared-text', {
      extends: TextNode,
      json: textSchema,
      stateConfigs: [live, {flat: true, stateConfig: flat}],
    });
  }
}
function create(doc = new Y.Doc()) {
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(YExtension, {root: doc.get('root')}),
        YHistoryExtension,
      ],
      name: 'shared-test',
      nodes: [SharedElement, SharedText],
    }),
  );
  onTestFinished(() => editor.dispose());
  return {
    binding: getExtensionDependencyFromEditor(editor, YExtension).output
      .binding,
    doc,
    editor,
    history: getExtensionDependencyFromEditor(editor, YHistoryExtension).output
      .undoManager.value!,
  };
}
function update(editor: LexicalEditor, fn: () => void) {
  editor.update(fn, {discrete: true});
}
function send(a: Y.Doc, b: Y.Doc) {
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a));
}
function getValue(editor: LexicalEditor) {
  return editor.read(
    'latest',
    () => $getRoot().getFirstChildOrThrow<SharedElement>().__value!,
  );
}
function seed(editor: LexicalEditor, value = new Y.Node()) {
  update(editor, () => {
    const node = $create(SharedElement);
    node.getWritable().__value = value;
    $setState(node, live, value);
    $setState(node, flat, value);
    $getRoot().append(node);
  });
  return value;
}
function pair() {
  const a = create();
  seed(a.editor);
  const doc = new Y.Doc();
  send(a.doc, doc);
  return {a, b: create(doc)};
}

test('properties and regular/flat NodeState retain live identity, aliases, and survive persistence', () => {
  const {a, b} = pair();
  const av = getValue(a.editor);
  const bv = getValue(b.editor);
  expect(av).toBeInstanceOf(Y.Node);
  expect(bv).toBeInstanceOf(Y.Node);
  expect(av).not.toBe(bv);
  for (const {editor} of [a, b])
    editor.read('latest', () => {
      const node = $getRoot().getFirstChildOrThrow<SharedElement>();
      expect($getState(node, live)).toBe(node.__value);
      expect($getState(node, flat)).toBe(node.__value);
    });
  a.binding.transact(() => av.insert(0, 'shared'));
  send(a.doc, b.doc);
  expect(bv.toString()).toBe('shared');
  expect(getValue(b.editor)).toBe(bv);
  const reload = new Y.Doc();
  send(a.doc, reload);
  expect(getValue(create(reload).editor).toString()).toBe('shared');
  expect(() =>
    JSON.stringify(b.editor.getEditorState().toJSON()),
  ).not.toThrow();
});

test('concurrent nested mutations merge and mark owning Lexical nodes dirty', () => {
  const {a, b} = pair();
  let key = '';
  b.editor.read('latest', () => {
    key = $getRoot().getFirstChildOrThrow().getKey();
  });
  let dirty = false;
  const off = b.editor.registerUpdateListener(({dirtyElements}) => {
    dirty ||= dirtyElements.has(key);
  });
  a.binding.transact(() => getValue(a.editor).setAttr('a', 1));
  b.binding.transact(() => getValue(b.editor).setAttr('b', 2));
  send(a.doc, b.doc);
  send(b.doc, a.doc);
  expect(getValue(a.editor).getAttrs()).toEqual({a: 1, b: 2});
  expect(getValue(b.editor).getAttrs()).toEqual({a: 1, b: 2});
  expect(dirty).toBe(true);
  dirty = false;
  a.binding.transact(() => getValue(a.editor).setAttr('nested', new Y.Node()));
  send(a.doc, b.doc);
  dirty = false;
  a.binding.transact(() =>
    getValue(a.editor).getAttr('nested').insert(0, 'deep'),
  );
  send(a.doc, b.doc);
  expect(dirty).toBe(true);
  off();
});

test('shared values work in text formatting and survive splitting into separate runs', () => {
  const a = create();
  const value = new Y.Node();
  update(a.editor, () => {
    const p = $create(SharedElement);
    const t = $create(SharedText).setTextContent('hello');
    t.getWritable().__value = value;
    $setState(t, live, value);
    $setState(t, flat, value);
    p.append(t);
    $getRoot().append(p);
  });
  const doc = new Y.Doc();
  send(a.doc, doc);
  const b = create(doc);
  b.editor.read('latest', () => {
    const t = $getRoot().getFirstDescendant() as SharedText;
    expect(t.__value).toBeInstanceOf(Y.Node);
    expect($getState(t, live)).toBe(t.__value);
    expect($getState(t, flat)).toBe(t.__value);
  });
  update(a.editor, () => {
    const t = $getRoot().getFirstDescendant() as SharedText;
    const [left, right] = t.splitText(2);
    left.setFormat('bold');
    left.insertAfter($create(SharedElement));
    expect($getState(right, live)).toBe(value);
  });
  send(a.doc, b.doc);
  a.binding.transact(() => value.insert(0, 'payload'));
  send(a.doc, b.doc);
  b.editor.read('latest', () => {
    const texts = $getRoot().getAllTextNodes();
    expect(texts).toHaveLength(2);
    expect($getState(texts[0], live)).toBe($getState(texts[1], live));
    expect($getState(texts[1], live)!.toString()).toBe('payload');
  });
});

test('shared mutations participate in local undo without undoing concurrent remote work', () => {
  const {a, b} = pair();
  a.history.clear();
  b.history.clear();
  a.binding.transact(() => getValue(a.editor).setAttr('a', 1));
  b.binding.transact(() => getValue(b.editor).setAttr('b', 2));
  send(a.doc, b.doc);
  send(b.doc, a.doc);
  a.editor.dispatchCommand(UNDO_COMMAND, undefined);
  a.editor.read('force-commit', () => {});
  expect(getValue(a.editor).getAttrs()).toEqual({b: 2});
  a.editor.dispatchCommand(REDO_COMMAND, undefined);
  a.editor.read('force-commit', () => {});
  expect(getValue(a.editor).getAttrs()).toEqual({a: 1, b: 2});
});

test('external same-document types are observed, included in local history, and remain application-owned', () => {
  const a = create();
  const external = a.doc.get('application');
  seed(a.editor, external);
  a.history.clear();
  let updated = 0;
  const off = a.editor.registerUpdateListener(() => updated++);
  a.binding.transact(() => external.insert(0, 'local'));
  expect(updated).toBeGreaterThan(0);
  a.editor.dispatchCommand(UNDO_COMMAND, undefined);
  a.editor.read('force-commit', () => {});
  expect(external.toString()).toBe('');
  off();
  a.editor.dispose();
  external.insert(0, 'still live');
  expect(external.toString()).toBe('still live');
});

test('replacement and deletion do not destroy aliased values and are undoable', () => {
  const {a, b} = pair();
  const original = getValue(a.editor);
  a.history.clear();
  update(a.editor, () => {
    $getRoot().getFirstChildOrThrow<SharedElement>().getWritable().__value =
      new Y.Node();
  });
  send(a.doc, b.doc);
  expect(getValue(a.editor)).not.toBe(original);
  a.editor.dispatchCommand(UNDO_COMMAND, undefined);
  a.editor.read('force-commit', () => {});
  expect(getValue(a.editor)).toBe(original);
  a.history.stopCapturing();
  update(a.editor, () => {
    $getRoot().getFirstChildOrThrow<SharedElement>().getWritable().__value =
      undefined;
  });
  send(a.doc, b.doc);
  b.editor.read('latest', () => {
    const n = $getRoot().getFirstChildOrThrow<SharedElement>();
    expect(n.__value).toBeUndefined();
    expect($getState(n, live)).toBeInstanceOf(Y.Node);
  });
});

test('rejects cross-document live values instead of silently cloning them', () => {
  const a = create();
  const external = new Y.Doc().get('external');
  expect(() => seed(a.editor, external)).toThrow(/binding document/);
});

test('deleting an externally owned subtree clears its references and invalidates owners', () => {
  const a = create();
  const parent = a.doc.get('external');
  const child = new Y.Node();
  parent.setAttr('child', child);
  seed(a.editor, child);
  parent.deleteAttr('child');
  a.editor.read('latest', () => {
    const node = $getRoot().getFirstChildOrThrow<SharedElement>();
    expect(node.__value).toBeUndefined();
    expect($getState(node, live)).toBeUndefined();
    expect($getState(node, flat)).toBeUndefined();
  });
});

test('concurrent first shared values on independent fields do not replace each other', () => {
  const a = create();
  update(a.editor, () => $getRoot().append($create(SharedElement)));
  const doc = new Y.Doc();
  send(a.doc, doc);
  const b = create(doc);
  const av = new Y.Node();
  av.insert(0, 'a');
  const bv = new Y.Node();
  bv.insert(0, 'b');
  update(a.editor, () => {
    $getRoot().getFirstChildOrThrow<SharedElement>().getWritable().__value = av;
  });
  update(b.editor, () => {
    $setState($getRoot().getFirstChildOrThrow(), live, bv);
  });
  send(a.doc, b.doc);
  send(b.doc, a.doc);
  for (const {editor} of [a, b])
    editor.read('latest', () => {
      const node = $getRoot().getFirstChildOrThrow<SharedElement>();
      expect(node.__value!.toString()).toBe('a');
      expect($getState(node, live)!.toString()).toBe('b');
    });
});

test('one shared type can be referenced from independent editor roots in the same doc', () => {
  const a = create();
  const value = seed(a.editor);
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(YExtension, {root: a.doc.get('second')}),
        YHistoryExtension,
      ],
      name: 'second-root',
      nodes: [SharedElement],
    }),
  );
  onTestFinished(() => editor.dispose());
  seed(editor, value);
  a.history.clear();
  const second = getExtensionDependencyFromEditor(editor, YExtension).output
    .binding;
  second.transact(() => value.insert(0, 'second'));
  expect(a.history.undoStack).toHaveLength(0);
  expect(getValue(a.editor)).toBe(getValue(editor));
  editor.dispatchCommand(UNDO_COMMAND, undefined);
  editor.read('force-commit', () => {});
  expect(value.toString()).toBe('');
});

test('undo and redo creation restore references to the revived shared type', () => {
  const a = create();
  const value = new Y.Node();
  value.insert(0, 'original');
  seed(a.editor, value);
  a.editor.dispatchCommand(UNDO_COMMAND, undefined);
  a.editor.read('force-commit', () => {});
  a.editor.read('latest', () => expect($getRoot().getChildrenSize()).toBe(0));
  a.editor.dispatchCommand(REDO_COMMAND, undefined);
  a.editor.read('force-commit', () => {});
  expect(getValue(a.editor).toString()).toBe('original');
  a.binding.transact(() => getValue(a.editor).insert(0, 'revived '));
  expect(getValue(a.editor).toString()).toBe('revived original');
});

test('empty external roots resolve on peers before their first content update', () => {
  const a = create();
  const value = a.doc.get('empty-external');
  seed(a.editor, value);
  const doc = new Y.Doc();
  send(a.doc, doc);
  const b = create(doc);
  expect(getValue(b.editor)).toBe(doc.get('empty-external'));
  let updated = false;
  const off = b.editor.registerUpdateListener(() => {
    updated = true;
  });
  a.binding.transact(() => value.insert(0, 'first'));
  send(a.doc, b.doc);
  expect(updated).toBe(true);
  expect(getValue(b.editor).toString()).toBe('first');
  off();
});

test('out-of-order references survive local edits and resolve when their external type arrives', () => {
  const externalDoc = new Y.Doc();
  const child = new Y.Node();
  child.insert(0, 'delayed');
  externalDoc.get('external').setAttr('child', child);
  const a = create();
  send(externalDoc, a.doc);
  seed(a.editor, a.doc.get('external').getAttr('child'));
  // The reference was authored by a different client than its target.
  const doc = new Y.Doc();
  Y.applyUpdate(
    doc,
    Y.encodeStateAsUpdate(a.doc, Y.encodeStateVector(externalDoc)),
  );
  const b = create(doc);
  expect(getValue(b.editor)).toBeUndefined();
  update(b.editor, () =>
    $getRoot().getFirstChildOrThrow<SharedElement>().setIndent(1),
  );
  send(externalDoc, doc);
  expect(getValue(b.editor).toString()).toBe('delayed');
  b.editor.read('latest', () =>
    expect($getState($getRoot().getFirstChildOrThrow(), live)).toBe(
      getValue(b.editor),
    ),
  );
});

test('shared-value undo and redo converge on peers across repeated cycles', () => {
  const {a, b} = pair();
  a.history.clear();
  const next = new Y.Node();
  next.insert(0, 'replacement');
  update(a.editor, () => {
    $getRoot().getFirstChildOrThrow<SharedElement>().getWritable().__value =
      next;
  });
  send(a.doc, b.doc);
  for (let i = 0; i < 3; i++) {
    a.editor.dispatchCommand(UNDO_COMMAND, undefined);
    a.editor.read('force-commit', () => {});
    send(a.doc, b.doc);
    expect(getValue(b.editor).toString()).toBe('');
    a.editor.dispatchCommand(REDO_COMMAND, undefined);
    a.editor.read('force-commit', () => {});
    send(a.doc, b.doc);
    expect(getValue(a.editor).toString()).toBe('replacement');
    expect(getValue(b.editor).toString()).toBe('replacement');
  }
});

test('releases unreferenced shared values through Yjs deletion and undo', () => {
  const {binding, editor, history, doc} = create(new Y.Doc({gc: false}));
  const value = seed(editor);
  binding.transact(() => value.insert(0, 'retained'));
  expect(() => binding.releaseSharedType(value)).toThrow(/references/);
  history.clear();
  // Group removal and release so undo restores both the reference and value.
  update(editor, () => $getRoot().clear());
  binding.releaseSharedType(value);
  const key = value._item!.parentSub!;
  expect(binding.root.getAttr(key)).toBeUndefined();
  history.undo();
  expect(getValue(editor).toString()).toBe('retained');
  const restored = getValue(editor);
  history.redo();
  history.clear();
  Y.gcIdSet(doc, Y.createDeleteSetFromStructStore(doc.store));
  expect(restored._item!.content.constructor.name).toBe('ContentDeleted');
});

test('release checks references on text formats and other loaded roots', () => {
  const {binding, editor, doc} = create();
  const value = seed(editor);
  update(editor, () => {
    $getRoot().clear();
    const node = $create(SharedText);
    node.setTextContent('alias');
    node.getWritable().__value = value;
    $getRoot().append($createParagraphNode().append(node));
  });
  expect(() => binding.releaseSharedType(value)).toThrow(/references/);
  // Copy the encoded reference to an application-owned root.
  const stored = Object.entries(binding.root.getAttrs()).find(
    ([key, item]) =>
      key.startsWith('tree:node:') &&
      item instanceof Y.Node &&
      item.name === null &&
      item.length > 0,
  )![1] as Y.Node;
  const op = Array.from(stored.toDelta().children)[0];
  if (!('format' in op)) throw new Error('Expected text formatting');
  const reference = op.format!['ref:p:value'];
  doc.get('other').setAttr('ref:p:value', reference);
  update(editor, () => $getRoot().clear());
  expect(() => binding.releaseSharedType(value)).toThrow(/references/);
  doc.get('other').deleteAttr('ref:p:value');
  binding.releaseSharedType(value);
  expect(value._item!.deleted).toBe(true);
});

test('release never deletes application-owned shared types', () => {
  const {binding, doc} = create();
  const external = new Y.Node();
  doc.get('application').setAttr('value', external);
  expect(() => binding.releaseSharedType(external)).toThrow(/stored shared/);
  expect(doc.get('application').getAttr('value')).toBe(external);
});
