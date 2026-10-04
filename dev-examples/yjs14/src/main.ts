/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import './style.css';

import {
  buildEditorFromExtensions,
  getExtensionDependencyFromEditor,
} from '@lexical/extension';
import {RichTextExtension} from '@lexical/rich-text';
import {YExtension, YHistoryExtension} from '@lexical/y';
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
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical';

const element = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const mode = element<HTMLSelectElement>('mode');
const allowGC = element<HTMLInputElement>('allow-gc');
const status = element('status');
const transportOrigin = {};
const noteState = createState('sharedNote', {
  parse: (value: unknown) => (value instanceof Y.Node ? value : undefined),
  unparse: (value: Y.Node | undefined) => value && value.toJSON(),
});
let disposeSession = () => {};

function createEditor(doc: Y.Doc, mount: HTMLElement, editable = true) {
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        RichTextExtension,
        configExtension(YExtension, {root: doc.get('root')}),
        YHistoryExtension,
      ],
      name: 'yjs14-dev-example',
    }),
  );
  editor.setRootElement(mount);
  editor.setEditable(editable);
  return editor;
}

function start() {
  disposeSession();
  allowGC.checked = false;
  const selectedMode = mode.value;
  const docs = [0, 1].map(
    () =>
      new Y.Doc({
        gc: selectedMode !== 'manual',
        gcFilter: () => selectedMode !== 'filtered' || allowGC.checked,
      }),
  );
  const alice = createEditor(docs[0], element('alice'));
  // Initialize once and copy the encoded state, rather than inserting twice.
  alice.update(() =>
    $getRoot().append(
      $createParagraphNode().append(
        $createTextNode('Edit here, disconnect, and merge.'),
      ),
      $createParagraphNode().append(
        $createTextNode('Move or delete this paragraph.'),
      ),
    ),
  );
  Y.applyUpdate(docs[1], Y.encodeStateAsUpdate(docs[0]), transportOrigin);
  const bob = createEditor(docs[1], element('bob'));
  const editors = [alice, bob];
  const histories = editors.map(
    editor =>
      getExtensionDependencyFromEditor(editor, YHistoryExtension).output
        .undoManager.value!,
  );
  histories.forEach(history => history.clear());
  let connected = true;
  let checkpoint: Uint8Array | null = null;
  let snapshot: Y.Snapshot | null = null;
  let historical: ReturnType<typeof createEditor> | null = null;
  let historicalDoc: Y.Doc | null = null;
  const refresh = () => {
    element('storage').textContent = docs
      .map((doc, i) => {
        const attrs = Object.keys(doc.get('root').getAttrs());
        return `${i === 0 ? 'Alice' : 'Bob'}: ${Y.encodeStateAsUpdate(doc).length} encoded bytes; ${attrs.filter(key => key.startsWith('tree:node:')).length} live stored nodes; ${attrs.filter(key => key.startsWith('shared:')).length} live shared values; ${histories[i].undoStack.length} undo entries`;
      })
      .join('\n');
  };
  const listeners = docs.map((doc, i) => {
    const listener = (update: Uint8Array, origin: unknown) => {
      if (connected && origin !== transportOrigin)
        Y.applyUpdate(docs[1 - i], update, transportOrigin);
      refresh();
    };
    doc.on('update', listener);
    return listener;
  });
  const report = (action: () => void) => {
    try {
      action();
      refresh();
    } catch (error) {
      status.textContent =
        error instanceof Error ? error.message : String(error);
    }
  };
  const action = (id: string, callback: () => void) => {
    element(id).onclick = () => report(callback);
  };
  editors.forEach((editor, i) => {
    const binding = getExtensionDependencyFromEditor(editor, YExtension).output
      .binding;
    const getNote = () =>
      editor.read('latest', () => $getState($getRoot(), noteState));
    const actions = element(i === 0 ? 'alice-actions' : 'bob-actions');
    actions.replaceChildren();
    const button = (label: string, callback: () => void) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.onclick = () => report(callback);
      actions.append(b);
    };
    button('Add shared note', () => {
      if (getNote())
        throw new Error('This document already has a shared note.');
      const value = new Y.Node();
      value.insert(0, 'Shared note');
      editor.update(() => $setState($getRoot(), noteState, value));
    });
    button('Edit shared note', () => {
      const value = getNote();
      if (!value) throw new Error('Add a shared note first.');
      binding.transact(() => value.insert(value.length, '!'));
      status.textContent = value.toString();
    });
    button('Release shared note', () => {
      const value = getNote();
      if (!value) throw new Error('Add a shared note first.');
      histories[i].stopCapturing();
      editor.update(() => $setState($getRoot(), noteState, undefined));
      binding.releaseSharedType(value);
      status.textContent =
        'Reference removed and shared value released. Undo restores both.';
    });
    button('Undo', () => {
      editor.dispatchCommand(UNDO_COMMAND, undefined);
    });
    button('Redo', () => {
      editor.dispatchCommand(REDO_COMMAND, undefined);
    });
    button('Move first to end', () =>
      editor.update(() => {
        const first = $getRoot().getFirstChild();
        if (first) $getRoot().append(first);
      }),
    );
    button('Delete first', () =>
      editor.update(() => {
        const first = $getRoot().getFirstChild();
        if (first) first.remove();
      }),
    );
  });
  action('connection', () => {
    connected = !connected;
    if (connected) {
      const updates = docs.map(doc => Y.encodeStateAsUpdate(doc));
      Y.applyUpdate(docs[0], updates[1], transportOrigin);
      Y.applyUpdate(docs[1], updates[0], transportOrigin);
    }
    element('connection').textContent = connected
      ? 'Disconnect peers'
      : 'Reconnect peers';
    status.textContent = connected
      ? 'Peers connected.'
      : 'Peers disconnected. Both editors remain active.';
  });
  action('capture', () => {
    checkpoint = Y.encodeStateAsUpdate(docs[0]);
    snapshot = selectedMode === 'manual' ? Y.snapshot(docs[0]) : null;
    status.textContent = 'Checkpoint saved from Alice.';
  });
  const show = (doc: Y.Doc) => {
    if (historical) historical.dispose();
    if (historicalDoc) historicalDoc.destroy();
    historicalDoc = doc;
    historical = createEditor(doc, element('historical'), false);
    status.textContent =
      'Viewing historical content; the live editors are unchanged.';
  };
  action('show', () => {
    if (!checkpoint) throw new Error('Save a checkpoint first.');
    const doc = new Y.Doc();
    Y.applyUpdate(doc, checkpoint);
    show(doc);
  });
  action('snapshot', () => {
    if (!snapshot)
      throw new Error(
        'Select manual retention, start a fresh session, and save a checkpoint first.',
      );
    show(Y.createDocFromSnapshot(docs[0], snapshot));
  });
  action('clear-history', () => histories.forEach(history => history.clear()));
  action('collect', () => {
    docs.forEach(doc =>
      Y.gcIdSet(doc, Y.createDeleteSetFromStructStore(doc.store)),
    );
    status.textContent =
      'Collected eligible deleted content. Lightweight snapshots may no longer be reconstructible; the separate checkpoint is preserved.';
  });
  status.textContent = 'Peers connected.';
  element('connection').textContent = 'Disconnect peers';
  refresh();
  disposeSession = () => {
    docs.forEach((doc, i) => doc.off('update', listeners[i]));
    if (historical) historical.dispose();
    if (historicalDoc) historicalDoc.destroy();
    editors.forEach(editor => editor.dispose());
    docs.forEach(doc => doc.destroy());
  };
}
element('reset').onclick = start;
start();
if (import.meta.hot) import.meta.hot.dispose(() => disposeSession());
