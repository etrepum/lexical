/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
// @vitest-environment node

import type {Klass, LexicalEditor, LexicalNode, ParagraphNode} from 'lexical';

import {
  buildEditorFromExtensions,
  getExtensionDependencyFromEditor,
} from '@lexical/extension';
import {HistoryExtension} from '@lexical/history';
import {
  $createListItemNode,
  $createListNode,
  ListItemNode,
  ListNode,
} from '@lexical/list';
import {
  YAwarenessExtension,
  YExtension,
  YHistoryExtension,
  type YProvider,
  YProviderExtension,
} from '@lexical/y';
import {
  applyAwarenessUpdate,
  Awareness,
  encodeAwarenessUpdate,
} from '@y/protocols/awareness';
import * as Y from '@y/y';
import {
  $create,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $getSlot,
  $getState,
  $isRangeSelection,
  $setSlot,
  $setState,
  configExtension,
  createState,
  defineExtension,
  ElementNode,
  nodeSchema,
  numberValue,
  objectValue,
  REDO_COMMAND,
  TextNode,
  UNDO_COMMAND,
  withField,
} from 'lexical';
import {describe, expect, onTestFinished, test, vi} from 'vitest';

function storedChild(parent: Y.Node, index = 0): Y.Node {
  const edge = parent.get(index) as {id: string};
  const root = parent.doc!.get('root');
  return root.getAttr('tree:node:' + edge.id);
}
const metadata = createState('metadata', {parse: (v: unknown) => v});
const other = createState('other', {parse: (v: unknown) => v});
const flat = createState('flat', {parse: v => (typeof v === 'number' ? v : 0)});
const cardSchema = nodeSchema<CardNode>()({
  text: withField(objectValue({x: numberValue(), y: numberValue()}), {
    field: '__point',
  }),
});
class CardNode extends ElementNode {
  __point = {x: 0, y: 0};
  $config() {
    return this.config('card', {
      extends: ElementNode,
      json: cardSchema,
      stateConfigs: [{flat: true, stateConfig: flat}],
    });
  }
}

function create(root: Y.Node, extra = {}, nodes: Klass<LexicalNode>[] = []) {
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(YExtension, {root, ...extra}),
        YHistoryExtension,
        HistoryExtension,
      ],
      name: 'test',
      nodes,
    }),
  );
  onTestFinished(() => editor.dispose());
  return editor;
}
function update(editor: LexicalEditor, f: () => void) {
  editor.update(f, {discrete: true});
}
function content(editor: LexicalEditor) {
  return editor.getEditorState().toJSON(true);
}
function text(editor: LexicalEditor) {
  return editor.read('latest', () => $getRoot().getTextContent());
}
function seed(editor: LexicalEditor, value = 'hello') {
  update(editor, () =>
    $getRoot().append($createParagraphNode().append($createTextNode(value))),
  );
}
function copy(from: Y.Doc, to: Y.Doc) {
  Y.applyUpdate(to, Y.encodeStateAsUpdate(from));
}
function pair() {
  const a = new Y.Doc();
  const b = new Y.Doc();
  onTestFinished(() => {
    a.destroy();
    b.destroy();
  });
  const ea = create(a.get('root'));
  seed(ea);
  copy(a, b);
  const eb = create(b.get('root'));
  return {a, b, ea, eb};
}
function manager(editor: LexicalEditor) {
  return getExtensionDependencyFromEditor(editor, YHistoryExtension).output
    .undoManager.value!;
}

describe('@lexical/y', () => {
  test.each([false, true])(
    'preserves local edits when a remote transaction arrives (skipTransforms: %s)',
    skipTransforms => {
      const {a, b, ea, eb} = pair();
      ea.update(
        () =>
          ($getRoot().getFirstDescendant() as TextNode).spliceText(0, 0, 'A'),
        {skipTransforms: skipTransforms || undefined},
      );
      update(eb, () =>
        ($getRoot().getFirstDescendant() as TextNode).spliceText(5, 0, 'B'),
      );
      copy(b, a);
      copy(a, b);
      expect(text(ea)).toBe('AhelloB');
      expect(content(ea)).toEqual(content(eb));
      expect(content(create(a.get('root')))).toEqual(content(ea));
    },
  );
  test('undo after backspace and a remote insertion survives reload (#6614)', () => {
    const {a, b, ea, eb} = pair();
    update(ea, () =>
      ($getRoot().getFirstDescendant() as TextNode).setTextContent(''),
    );
    copy(a, b);
    manager(ea).clear();
    update(ea, () =>
      $getRoot()
        .getFirstChildOrThrow<ParagraphNode>()
        .append($createTextNode('This is a')),
    );
    update(ea, () =>
      ($getRoot().getFirstDescendant() as TextNode).spliceText(8, 1, ''),
    );
    update(ea, () =>
      ($getRoot().getFirstDescendant() as TextNode).spliceText(
        8,
        0,
        'a test. ',
      ),
    );
    copy(a, b);
    update(eb, () =>
      ($getRoot().getFirstDescendant() as TextNode).spliceText(16, 0, 'Word'),
    );
    copy(b, a);
    while (manager(ea).undoStack.length) manager(ea).undo();
    copy(a, b);
    expect(text(ea)).toBe('Word');
    expect(content(ea)).toEqual(content(eb));
    expect(content(create(a.get('root')))).toEqual(content(ea));
  });
  test('recovers selection beside a remotely deleted paragraph (#5974)', () => {
    const {a, b, ea, eb} = pair();
    update(ea, () => {
      $getRoot().append(
        $createParagraphNode().append($createTextNode('middle')),
        $createParagraphNode().append($createTextNode('last')),
      );
      (
        $getRoot()
          .getChildAtIndex<ParagraphNode>(1)!
          .getFirstChildOrThrow() as TextNode
      ).select(2, 2);
    });
    copy(a, b);
    update(eb, () => $getRoot().getChildAtIndex(1)!.remove());
    copy(b, a);
    ea.read('latest', () => {
      const selection = $getSelection();
      expect($isRangeSelection(selection) && selection.anchor.key).toBe(
        $getRoot().getKey(),
      );
      expect($isRangeSelection(selection) && selection.anchor.offset).toBe(1);
    });
  });
  test.each(['automatic', 'filtered', 'manual'] as const)(
    'deleted document nodes participate in %s Yjs collection',
    mode => {
      const doc = new Y.Doc({
        gc: mode !== 'manual',
        gcFilter: () => mode !== 'filtered',
      });
      const editor = create(doc.get('root'));
      seed(editor);
      manager(editor).clear();
      const paragraph = storedChild(doc.get('root'));
      const key = paragraph._item!.parentSub!;
      update(editor, () => $getRoot().clear());
      expect(doc.get('root').getAttr(key)).toBeUndefined();
      expect(paragraph._item!.deleted).toBe(true);
      // UndoManager retains deleted content until its history is cleared.
      expect(paragraph._item!.keep).toBe(true);
      Y.gcIdSet(doc, Y.createDeleteSetFromStructStore(doc.store));
      expect(paragraph._item!.content.constructor.name).toBe('ContentType');
      manager(editor).undo();
      expect(text(editor)).toBe('hello');
      const restored = storedChild(doc.get('root'));
      manager(editor).redo();
      manager(editor).clear();
      Y.gcIdSet(doc, Y.createDeleteSetFromStructStore(doc.store));
      const deleted = restored._item!;
      expect(deleted.content.constructor.name).toBe(
        mode === 'filtered' ? 'ContentType' : 'ContentDeleted',
      );
      doc.destroy();
    },
  );
  test('a retained snapshot can render deleted nodes without changing the live document', () => {
    const doc = new Y.Doc({gc: false});
    const editor = create(doc.get('root'));
    seed(editor);
    const snapshot = Y.snapshot(doc);
    update(editor, () => $getRoot().clear());
    manager(editor).clear();
    const historicalDoc = Y.createDocFromSnapshot(doc, snapshot);
    expect(text(create(historicalDoc.get('root')))).toBe('hello');
    expect(text(editor)).toBe('');
  });
  test.each([false, true])(
    'deletion wins over a concurrent move (reverse delivery: %s)',
    reverse => {
      const {a, b, ea, eb} = pair();
      update(ea, () =>
        $getRoot().append(
          $createParagraphNode().append($createTextNode('last')),
        ),
      );
      copy(a, b);
      manager(ea).clear();
      update(ea, () => $getRoot().getFirstChildOrThrow().remove());
      update(eb, () => $getRoot().append($getRoot().getFirstChildOrThrow()));
      if (reverse) {
        copy(b, a);
        copy(a, b);
      } else {
        copy(a, b);
        copy(b, a);
      }
      expect(text(ea)).toBe('last');
      expect(content(ea)).toEqual(content(eb));
      // The peer may already have collected deleted content; undo sends restored content.
      Y.gcIdSet(b, Y.createDeleteSetFromStructStore(b.store));
      manager(ea).undo();
      copy(a, b);
      expect(text(ea)).toContain('hello');
      expect(content(ea)).toEqual(content(eb));
    },
  );
  test('automatic collection works without a history extension', () => {
    const doc = new Y.Doc();
    const editor = buildEditorFromExtensions(
      configExtension(YExtension, {root: doc.get('root')}),
    );
    onTestFinished(() => {
      editor.dispose();
      doc.destroy();
    });
    seed(editor);
    const paragraph = storedChild(doc.get('root'));
    update(editor, () => $getRoot().clear());
    expect(paragraph._item!.content.constructor.name).toBe('ContentDeleted');
  });
  test('moves retain shared identity and concurrent text edits', () => {
    const {a, b, ea, eb} = pair();
    update(ea, () =>
      $getRoot().append($createParagraphNode().append($createTextNode('last'))),
    );
    copy(a, b);
    const original = storedChild(a.get('root'));
    update(ea, () => $getRoot().append($getRoot().getFirstChildOrThrow()));
    update(eb, () =>
      ($getRoot().getFirstDescendant() as TextNode).spliceText(5, 0, '!'),
    );
    copy(b, a);
    copy(a, b);
    expect(storedChild(a.get('root'), 1)).toBe(original);
    expect(text(ea)).toBe('last\n\nhello!');
    expect(content(ea)).toEqual(content(eb));
    expect(content(create(a.get('root')))).toEqual(content(ea));
  });
  test('concurrent reparenting cycles recover deterministically without dropping content', () => {
    const {a, b, ea, eb} = pair();
    update(ea, () =>
      $getRoot().append($createParagraphNode().append($createTextNode('last'))),
    );
    copy(a, b);
    update(ea, () =>
      $getRoot()
        .getFirstChildOrThrow<ParagraphNode>()
        .append($getRoot().getLastChildOrThrow()),
    );
    update(eb, () =>
      $getRoot()
        .getLastChildOrThrow<ParagraphNode>()
        .append($getRoot().getFirstChildOrThrow()),
    );
    copy(b, a);
    copy(a, b);
    expect(content(ea)).toEqual(content(eb));
    expect(text(ea)).toContain('hello');
    expect(text(ea)).toContain('last');
    expect(content(create(a.get('root')))).toEqual(content(ea));
    manager(ea).clear();
    update(ea, () => $getRoot().clear());
    copy(a, b);
    expect(text(ea)).toBe('');
    expect(content(ea)).toEqual(content(eb));
    manager(ea).undo();
    copy(a, b);
    expect(text(ea)).toContain('hello');
    expect(text(ea)).toContain('last');
    expect(content(ea)).toEqual(content(eb));
  });
  test('undoing list indentation restores text selection (#7493)', () => {
    const doc = new Y.Doc();
    const editor = create(doc.get('root'), {}, [ListNode, ListItemNode]);
    update(editor, () => {
      const list = $createListNode('bullet');
      list.append(
        $createListItemNode().append($createTextNode('first')),
        $createListItemNode().append($createTextNode('second')),
      );
      $getRoot().append(list);
      list.getLastDescendant<TextNode>()!.select(2, 2);
    });
    manager(editor).clear();
    update(editor, () =>
      $getRoot()
        .getFirstChildOrThrow<ListNode>()
        .getLastChildOrThrow<ListItemNode>()
        .setIndent(1),
    );
    editor.dispatchCommand(UNDO_COMMAND, undefined);
    editor.read('latest', () => {
      const selection = $getSelection();
      expect(
        $isRangeSelection(selection) &&
          selection.anchor.getNode().getTextContent(),
      ).toBe('second');
      expect($isRangeSelection(selection) && selection.anchor.offset).toBe(2);
    });
    expect(
      content(create(doc.get('root'), {}, [ListNode, ListItemNode])),
    ).toEqual(content(editor));
  });
  test('rejects mismatched application schemas before writing', () => {
    const doc = new Y.Doc();
    const editor = create(doc.get('root'), {schemaId: 'one'});
    seed(editor);
    const before = Y.encodeStateAsUpdate(doc);
    expect(() => create(doc.get('root'), {schemaId: 'two'})).toThrow(
      /incompatible/,
    );
    expect(Y.encodeStateAsUpdate(doc)).toEqual(before);
  });
  test('provider replacement unsubscribes the old transport and retains the binding', () => {
    const makeProvider = (synced: boolean) => {
      const listeners = new Set<(value: boolean) => void>();
      return {
        listeners,
        off: (_event: 'sync', fn: (v: boolean) => void) => listeners.delete(fn),
        on: (_event: 'sync', fn: (v: boolean) => void) => listeners.add(fn),
        synced,
      };
    };
    const first = makeProvider(true);
    const second = makeProvider(false);
    const doc = new Y.Doc();
    const editor = buildEditorFromExtensions(
      defineExtension({
        dependencies: [
          configExtension(YExtension, {root: doc.get('root')}),
          configExtension(YProviderExtension, {provider: first}),
        ],
        name: 'replacement',
      }),
    );
    onTestFinished(() => editor.dispose());
    seed(editor);
    const output = getExtensionDependencyFromEditor(
      editor,
      YProviderExtension,
    ).output;
    output.provider.value = second;
    expect(first.listeners.size).toBe(0);
    expect(second.listeners.size).toBe(1);
    expect(output.synced.value).toBe(false);
    second.listeners.forEach(fn => fn(true));
    expect(output.synced.value).toBe(true);
    expect(text(editor)).toBe('hello');
  });
  test('late loading and remounting preserve application-owned document state', () => {
    const source = new Y.Doc();
    const target = new Y.Doc();
    const writer = create(source.get('root'));
    seed(writer);
    const reader = create(target.get('root'), {ready: false});
    expect(text(reader)).toBe('');
    copy(source, target);
    expect(content(reader)).toEqual(content(writer));
    reader.dispose();
    update(writer, () =>
      ($getRoot().getFirstDescendant() as TextNode).spliceText(5, 0, '!'),
    );
    copy(source, target);
    expect(text(create(target.get('root')))).toBe('hello!');
  });
  test('unknown remote node types suspend writes without deleting their shared data', () => {
    const source = new Y.Doc();
    const target = new Y.Doc();
    const writer = create(source.get('root'), {}, [CardNode]);
    const reader = create(target.get('root'));
    update(writer, () => $getRoot().append($create(CardNode)));
    expect(() => copy(source, target)).toThrow(/not registered/);
    const binding = getExtensionDependencyFromEditor(reader, YExtension).output
      .binding;
    expect(binding.error.value).not.toBeNull();
    const before = Y.encodeStateAsUpdate(target);
    seed(reader, 'cannot replace unknown content');
    expect(Y.encodeStateAsUpdate(target)).toEqual(before);
    expect(content(create(target.get('root'), {}, [CardNode]))).toEqual(
      content(writer),
    );
  });
  test.each([false, true])(
    'concurrent moves choose one placement in either delivery order (%s)',
    reverse => {
      const {a, b, ea, eb} = pair();
      update(ea, () =>
        $getRoot().append(
          $createParagraphNode().append($createTextNode('B')),
          $createParagraphNode().append($createTextNode('C')),
        ),
      );
      copy(a, b);
      update(ea, () =>
        $getRoot()
          .getChildAtIndex<ParagraphNode>(1)!
          .append($getRoot().getFirstChildOrThrow()),
      );
      update(eb, () =>
        $getRoot()
          .getLastChildOrThrow<ParagraphNode>()
          .append($getRoot().getFirstChildOrThrow()),
      );
      if (reverse) {
        copy(b, a);
        copy(a, b);
      } else {
        copy(a, b);
        copy(b, a);
      }
      expect(content(ea)).toEqual(content(eb));
      expect(text(ea).match(/hello/g)).toHaveLength(1);
      expect(content(create(a.get('root')))).toEqual(content(ea));
      expect(content(create(b.get('root')))).toEqual(content(eb));
    },
  );
  test('text modes retain their schema during remote updates', () => {
    const {a, b, ea, eb} = pair();
    update(ea, () =>
      ($getRoot().getFirstDescendant() as TextNode).setMode('token'),
    );
    copy(a, b);
    expect(content(ea)).toEqual(content(eb));
    update(ea, () =>
      ($getRoot().getFirstDescendant() as TextNode).setMode('segmented'),
    );
    copy(a, b);
    expect(content(ea)).toEqual(content(eb));
    expect(content(create(b.get('root')))).toEqual(content(eb));
  });
  test('ordinary remote text edits avoid scanning the retained node store and clean siblings', () => {
    const {a, b, ea, eb} = pair();
    update(ea, () =>
      $getRoot().append(
        $createParagraphNode().append($createTextNode('untouched')),
      ),
    );
    copy(a, b);
    const rootAttrs = vi.spyOn(b.get('root'), 'getAttrs');
    const siblingAttrs = vi.spyOn(storedChild(b.get('root'), 1), 'getAttrs');
    onTestFinished(() => {
      rootAttrs.mockRestore();
      siblingAttrs.mockRestore();
    });
    update(ea, () =>
      ($getRoot().getFirstDescendant() as TextNode).spliceText(5, 0, '!'),
    );
    copy(a, b);
    expect(text(eb)).toBe('hello!\n\nuntouched');
    expect(rootAttrs).not.toHaveBeenCalled();
    expect(siblingAttrs).not.toHaveBeenCalled();
  });
  test('bootstraps an empty projection even when losing placements remain', () => {
    const doc = new Y.Doc();
    const original = create(doc.get('root'));
    seed(original);
    storedChild(doc.get('root')).deleteAttr('tree:placement');
    expect(doc.get('root').length).toBe(1);
    const editor = create(doc.get('root'), {
      $initialState: () =>
        $getRoot().append(
          $createParagraphNode().append($createTextNode('initialized')),
        ),
    });
    expect(text(editor)).toBe('initialized');
    expect(manager(editor).undoStack).toHaveLength(0);
  });
  test('uses schema fields and resets deleted properties and flat state to defaults', () => {
    const a = new Y.Doc();
    const b = new Y.Doc();
    const ea = create(a.get('root'), {}, [CardNode]);
    const eb = create(b.get('root'), {}, [CardNode]);
    update(ea, () => {
      const card = $create(CardNode);
      card.getWritable().__point = {x: 1, y: 2};
      $setState(card, flat, 3);
      $getRoot().append(card);
    });
    copy(a, b);
    expect(content(ea)).toEqual(content(eb));
    expect(storedChild(a.get('root')).getAttr('p:text')).toEqual({x: 1, y: 2});
    b.transact(() => {
      const card = storedChild(b.get('root'));
      card.deleteAttr('p:text');
      card.deleteAttr('p:flat');
    });
    copy(b, a);
    ea.read('latest', () => {
      const card = $getRoot().getFirstChildOrThrow<CardNode>();
      expect(card.__point).toEqual({x: 0, y: 0});
      expect($getState(card, flat)).toBe(0);
    });
    expect(content(ea)).toEqual(content(eb));
  });
  test('rejects legacy custom nodes without their own static node configuration', () => {
    class LegacyNode extends TextNode {
      static getType() {
        return 'legacy';
      }
      static clone(node: LegacyNode) {
        return new LegacyNode(node.__text, node.__key);
      }
    }
    expect(() => create(new Y.Doc().get('root'), {}, [LegacyNode])).toThrow(
      /must declare \$config/,
    );
  });
  test('selection-only updates do not write CRDT operations or history', () => {
    const {a, ea} = pair();
    manager(ea).clear();
    const before = Y.encodeStateVector(a);
    update(ea, () =>
      ($getRoot().getFirstDescendant() as TextNode).select(2, 3),
    );
    expect(Y.encodeStateVector(a)).toEqual(before);
    expect(manager(ea).undoStack).toHaveLength(0);
  });
  test('synchronous bidirectional transports do not echo or lose edits', () => {
    const {a, b, ea, eb} = pair();
    a.on('update', (value: Uint8Array) => Y.applyUpdate(b, value));
    b.on('update', (value: Uint8Array) => Y.applyUpdate(a, value));
    update(ea, () =>
      ($getRoot().getFirstDescendant() as TextNode).spliceText(0, 0, 'A'),
    );
    update(eb, () =>
      ($getRoot().getFirstDescendant() as TextNode).spliceText(6, 0, 'B'),
    );
    expect(text(ea)).toBe('AhelloB');
    expect(content(ea)).toEqual(content(eb));
  });
  test('deleting the last text preserves a concurrent insertion into the run', () => {
    const {a, b, ea, eb} = pair();
    update(ea, () => $getRoot().getFirstDescendant()!.remove());
    update(eb, () =>
      ($getRoot().getFirstDescendant() as TextNode).spliceText(5, 0, '!'),
    );
    copy(a, b);
    copy(b, a);
    expect(text(ea)).toBe('!');
    expect(content(ea)).toEqual(content(eb));
  });
  test('splits and merges rich-text runs with structured state and null marks', () => {
    const {a, b, ea, eb} = pair();
    update(ea, () => {
      const parts = ($getRoot().getFirstDescendant() as TextNode).splitText(
        2,
        4,
      );
      parts[1].setFormat('bold');
      $setState(parts[1], metadata, null);
    });
    copy(a, b);
    expect(content(ea)).toEqual(content(eb));
    update(eb, () => {
      const p = $getRoot().getFirstChildOrThrow<ParagraphNode>();
      for (const child of p.getChildren<TextNode>()) {
        child.setFormat(0);
        $setState(child, metadata, undefined);
      }
    });
    copy(b, a);
    expect(content(ea)).toEqual(content(eb));
    ea.read('latest', () =>
      expect(
        $getRoot().getFirstChildOrThrow<ParagraphNode>().getChildrenSize(),
      ).toBe(1),
    );
  });
  test('presence is optional, validates remote state and clears only its own field', () => {
    const {a, b, ea} = pair();
    const local = new Awareness(a);
    const remote = new Awareness(b);
    onTestFinished(() => {
      local.destroy();
      remote.destroy();
    });
    const editor = buildEditorFromExtensions(
      defineExtension({
        dependencies: [
          configExtension(YExtension, {root: a.get('root')}),
          configExtension(YAwarenessExtension, {awareness: local}),
        ],
        name: 'presence',
      }),
    );
    local.setLocalStateField('other', 'preserve');
    const presence = getExtensionDependencyFromEditor(
      editor,
      YAwarenessExtension,
    ).output;
    remote.setLocalStateField('lexical', {
      selection: {anchor: null},
      user: {color: '#f00', name: 'Bob', textColor: '#fff'},
    });
    applyAwarenessUpdate(
      local,
      encodeAwarenessUpdate(remote, [remote.clientID]),
      null,
    );
    expect(presence.peers.value.size).toBe(0);
    remote.setLocalStateField('lexical', {
      selection: null,
      user: {color: '#f00', name: 'Bob', textColor: '#fff'},
    });
    applyAwarenessUpdate(
      local,
      encodeAwarenessUpdate(remote, [remote.clientID]),
      null,
    );
    expect(presence.peers.value.get(remote.clientID)!.user.name).toBe('Bob');
    update(editor, () =>
      ($getRoot().getFirstDescendant() as TextNode).select(2, 2),
    );
    expect(local.getLocalState()!.lexical.selection).not.toBeNull();
    expect(content(editor)).toEqual(content(ea));
    editor.dispose();
    expect(local.getLocalState()).toMatchObject({
      lexical: null,
      other: 'preserve',
    });
  });
  test('loads an already-populated document without a provider and preserves the BindingV2 text-run shape', () => {
    const {ea, eb, a} = pair();
    expect(content(eb)).toEqual(content(ea));
    const paragraph = storedChild(a.get('root')) as Y.Node;
    expect(paragraph.name).toBe('paragraph');
    expect(paragraph.length).toBe(1);
    expect((storedChild(paragraph) as Y.Node).name).toBe(null);
    expect(text(eb)).toBe('hello');
  });
  test('merges concurrent text edits and converges after reload', () => {
    const {a, b, ea, eb} = pair();
    update(ea, () =>
      ($getRoot().getFirstDescendant() as TextNode).spliceText(0, 0, 'A'),
    );
    update(eb, () =>
      ($getRoot().getFirstDescendant() as TextNode).spliceText(5, 0, 'B'),
    );
    copy(a, b);
    copy(b, a);
    expect(text(ea)).toBe('AhelloB');
    expect(content(ea)).toEqual(content(eb));
    expect(content(create(a.get('root')))).toEqual(content(ea));
  });
  test('round-trips formatting, structured NodeState, null, and independent state changes', () => {
    const {a, b, ea, eb} = pair();
    update(ea, () => {
      const p = $getRoot().getFirstChildOrThrow<ParagraphNode>();
      $setState(p, metadata, {comments: [{author: 'a', done: false}]});
      const t = p.getFirstDescendant() as TextNode;
      $setState(t, metadata, {marks: [1, 2]});
      t.setFormat('bold');
    });
    copy(a, b);
    expect(content(ea)).toEqual(content(eb));
    const yp = storedChild(a.get('root')) as Y.Node;
    expect(yp.getAttr('s:metadata')).toEqual({
      comments: [{author: 'a', done: false}],
    });
    update(ea, () =>
      $setState($getRoot().getFirstChildOrThrow(), metadata, null),
    );
    update(eb, () =>
      $setState($getRoot().getFirstChildOrThrow(), other, {n: 2}),
    );
    copy(a, b);
    copy(b, a);
    expect(content(ea)).toEqual(content(eb));
    ea.read('latest', () => {
      const p = $getRoot().getFirstChildOrThrow();
      expect($getState(p, metadata)).toBe(null);
      expect($getState(p, other)).toEqual({n: 2});
    });
  });
  test('preserves an existing shared paragraph when inserting a sibling', () => {
    const {ea, a} = pair();
    const original = storedChild(a.get('root'));
    update(ea, () =>
      $getRoot()
        .getFirstChildOrThrow()
        .insertBefore($createParagraphNode().append($createTextNode('before'))),
    );
    expect(storedChild(a.get('root'), 1)).toBe(original);
  });
  test('undo only undoes local edits and restores the shared document', () => {
    const {a, b, ea, eb} = pair();
    manager(ea).clear();
    manager(eb).clear();
    update(ea, () => {
      const t = $getRoot().getFirstDescendant() as TextNode;
      t.select(5, 5);
    });
    update(ea, () => {
      const t = $getRoot().getFirstDescendant() as TextNode;
      t.spliceText(5, 0, 'A');
      t.select(6, 6);
    });
    copy(a, b);
    update(eb, () =>
      ($getRoot().getFirstDescendant() as TextNode).spliceText(0, 0, 'B'),
    );
    copy(b, a);
    ea.dispatchCommand(UNDO_COMMAND, undefined);
    ea.read('latest', () => {});
    expect(text(ea)).toBe('Bhello');
    ea.read('latest', () => {
      const selection = $getSelection();
      expect($isRangeSelection(selection) && selection.anchor.offset).toBe(6);
    });
    copy(a, b);
    expect(content(eb)).toEqual(content(ea));
    ea.dispatchCommand(REDO_COMMAND, undefined);
    ea.read('latest', () => {});
    expect(text(ea)).toBe('BhelloA');
    ea.read('latest', () => {
      const selection = $getSelection();
      expect($isRangeSelection(selection) && selection.anchor.offset).toBe(7);
    });
  });
  test('binds independent nested roots in the same doc with separate undo scopes', () => {
    const doc = new Y.Doc();
    const container = doc.get('notes');
    container.setAttr('a', new Y.Node());
    container.setAttr('b', new Y.Node());
    const ea = create(container.getAttr('a'));
    const eb = create(container.getAttr('b'));
    seed(ea, 'first');
    seed(eb, 'second');
    ea.dispatchCommand(UNDO_COMMAND, undefined);
    ea.read('latest', () => {});
    expect(text(eb)).toBe('second');
  });
  test('syncs named slots independently, including their first concurrent creation', () => {
    const {a, b, ea, eb} = pair();
    update(ea, () =>
      $setSlot(
        $getRoot().getFirstChildOrThrow<ParagraphNode>(),
        'left',
        $createParagraphNode().append($createTextNode('L')),
      ),
    );
    update(eb, () =>
      $setSlot(
        $getRoot().getFirstChildOrThrow<ParagraphNode>(),
        'right',
        $createParagraphNode().append($createTextNode('R')),
      ),
    );
    copy(a, b);
    copy(b, a);
    expect(content(ea)).toEqual(content(eb));
    ea.read('latest', () => {
      const p = $getRoot().getFirstChildOrThrow();
      expect($getSlot(p, 'left')!.getTextContent()).toBe('L');
      expect($getSlot(p, 'right')!.getTextContent()).toBe('R');
    });
  });
  test.each([false, true])(
    'provider startup without awareness or connection methods (initially synced: %s)',
    initiallySynced => {
      const doc = new Y.Doc();
      const listeners = new Set<(value: boolean) => void>();
      const provider: YProvider = {
        off: (_event, cb) => listeners.delete(cb),
        on: (_event, cb) => listeners.add(cb),
        synced: initiallySynced,
      };
      const editor = buildEditorFromExtensions(
        defineExtension({
          dependencies: [
            configExtension(YExtension, {
              $initialState: () =>
                $getRoot().append(
                  $createParagraphNode().append($createTextNode('seed')),
                ),
              root: doc.get('root'),
            }),
            configExtension(YProviderExtension, {provider}),
            YHistoryExtension,
          ],
          name: 'provider',
        }),
      );
      expect(doc.get('root').length).toBe(initiallySynced ? 1 : 0);
      listeners.forEach(cb => cb(true));
      expect(text(editor)).toBe('seed');
      expect(manager(editor).undoStack).toHaveLength(0);
      editor.dispose();
      expect(listeners.size).toBe(0);
    },
  );
  test('binds a subdocument for the editor lifetime', () => {
    const parent = new Y.Doc();
    const subdoc = new Y.Doc();
    parent.get('documents').setAttr('editor', subdoc);
    const editor = create(subdoc.get('root'));
    seed(editor);
    const history = manager(editor);
    storedChild(storedChild(subdoc.get('root'))).insert(0, 'remote ');
    expect(text(editor)).toBe('remote hello');
    expect(manager(editor)).toBe(history);
    expect(history.undoStack).toHaveLength(1);
    editor.dispose();
    storedChild(storedChild(subdoc.get('root'))).insert(0, 'later ');
    expect(text(editor)).toBe('remote hello');
    parent.destroy();
  });
  test('disposing leaves application-owned data alive and stops synchronization', () => {
    const doc = new Y.Doc();
    const editor = create(doc.get('root'));
    seed(editor);
    editor.dispose();
    (storedChild(storedChild(doc.get('root'))) as Y.Node).insert(0, 'remote');
    expect(text(editor)).toBe('hello');
  });
});
