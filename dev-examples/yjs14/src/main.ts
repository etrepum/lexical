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
  effect,
  getExtensionDependencyFromEditor,
} from '@lexical/extension';
import {RichTextExtension} from '@lexical/rich-text';
import {$createTableNodeWithDimensions, TableExtension} from '@lexical/table';
import {
  compareYCheckpoints,
  createYDocumentView,
  YAttributionExtension,
  YAwarenessExtension,
  type YBinding,
  type YCheckpoint,
  YCursorsExtension,
  type YDocumentView,
  YExtension,
  YHistoryExtension,
  YSuggestionsExtension,
  YVersionsExtension,
} from '@lexical/y';
import {YTableSelectionExtension} from '@lexical/y/table';
import {
  applyAwarenessUpdate,
  Awareness,
  encodeAwarenessUpdate,
} from '@y/protocols/awareness';
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

import {renderReview} from './review';

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

function createEditor(
  doc: Y.Doc,
  mount: HTMLElement,
  editable = true,
  author = 'Reader',
  base: YBinding | null = null,
  awareness: Awareness | null = null,
) {
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        defineExtension({
          name: 'yjs14-example/mount',
          register: mountedEditor => {
            mount.contentEditable = String(editable);
            mountedEditor.setEditable(editable);
            mountedEditor.setRootElement(mount);
            return () => mountedEditor.setRootElement(null);
          },
        }),
        RichTextExtension,
        TableExtension,
        YTableSelectionExtension,
        YVersionsExtension,
        configExtension(YAttributionExtension, {
          author,
          storage: doc.get('authors'),
        }),
        ...(base ? [configExtension(YSuggestionsExtension, {base})] : []),
        configExtension(YExtension, {root: doc.get('root')}),
        YHistoryExtension,
        ...(awareness
          ? [
              configExtension(YAwarenessExtension, {
                awareness,
                user: {
                  color: author === 'Alice' ? '#2563eb' : '#be185d',
                  name: author,
                  textColor: '#fff',
                },
              }),
              YCursorsExtension,
            ]
          : []),
      ],
      name: 'yjs14-dev-example',
      theme: {
        tableCellSelected: 'table-cell-selected',
        tableScrollableWrapper: 'table-scroll',
        tableSelection: 'table-selection',
      },
    }),
  );
  return editor;
}

/** Apply the changed span so independent edits keep their CRDT identities. */
function textChange(before: string, after: string) {
  let start = 0;
  while (
    start < before.length &&
    start < after.length &&
    before[start] === after[start]
  )
    start++;
  let end = before.length;
  let nextEnd = after.length;
  while (
    end > start &&
    nextEnd > start &&
    before[end - 1] === after[nextEnd - 1]
  ) {
    end--;
    nextEnd--;
  }
  return {end, insert: after.slice(start, nextEnd), start};
}

function startSession() {
  disposeSession();
  for (const id of [
    'proposal',
    'tracked-changes',
    'suggestion-list',
    'proposal-delta',
    'historical',
    'comparison',
  ])
    element(id).replaceChildren();
  allowGC.checked = false;
  const selectedMode = mode.value;
  const docs = [0, 1].map(
    () =>
      new Y.Doc({
        gc: selectedMode !== 'manual',
        gcFilter: () => selectedMode !== 'filtered' || allowGC.checked,
      }),
  );
  const awareness = docs.map(doc => new Awareness(doc));
  const alice = createEditor(
    docs[0],
    element('alice'),
    true,
    'Alice',
    null,
    awareness[0],
  );
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
  const bob = createEditor(
    docs[1],
    element('bob'),
    true,
    'Bob',
    null,
    awareness[1],
  );
  const editors = [alice, bob];
  const histories = editors.map(
    editor =>
      getExtensionDependencyFromEditor(editor, YHistoryExtension).output
        .undoManager.value!,
  );
  histories.forEach(history => history.clear());
  let connected = true;
  const awarenessListeners = awareness.map((local, i) => {
    const listener = (
      {
        added,
        updated,
        removed,
      }: {added: number[]; updated: number[]; removed: number[]},
      origin: unknown,
    ) => {
      if (connected && origin !== transportOrigin)
        applyAwarenessUpdate(
          awareness[1 - i],
          encodeAwarenessUpdate(local, [...added, ...updated, ...removed]),
          transportOrigin,
        );
    };
    local.on('update', listener);
    return listener;
  });
  const syncPresence = () =>
    awareness.forEach((local, i) =>
      applyAwarenessUpdate(
        awareness[1 - i],
        encodeAwarenessUpdate(local, [local.clientID]),
        transportOrigin,
      ),
    );
  syncPresence();
  const versions = getExtensionDependencyFromEditor(
    alice,
    YVersionsExtension,
  ).output;
  const attribution = getExtensionDependencyFromEditor(
    alice,
    YAttributionExtension,
  ).output;
  let checkpoint: YCheckpoint | null = null;
  let proposalEditor: ReturnType<typeof createEditor> | null = null;
  let proposalView: YDocumentView | null = null;
  let stopReview = () => {};
  const stopAttribution = effect(() => {
    void attribution.revision.value;
    element('attribution').textContent = JSON.stringify(
      attribution.getDelta(),
      null,
      2,
    );
  });
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
  const sharedValueCleanups: (() => void)[] = [];
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
    button('Insert table', () =>
      editor.update(() =>
        $getRoot().append($createTableNodeWithDimensions(3, 3)),
      ),
    );
    const peer = i === 0 ? 'alice' : 'bob';
    const input = element<HTMLTextAreaElement>(`${peer}-shared-value`);
    const sharedStatus = element(`${peer}-shared-status`);
    const renderSharedValue = () => {
      const value = getNote();
      input.disabled = !value;
      const text = value ? value.toString() : '';
      if (input.value !== text) {
        const {start, end, insert} = textChange(input.value, text);
        input.setRangeText(insert, start, end, 'preserve');
      }
      sharedStatus.textContent = value
        ? 'Live shared text. Edits synchronize with the other peer; Undo and Redo apply here too.'
        : 'No shared value attached.';
    };
    input.oninput = () =>
      report(() => {
        const value = getNote();
        if (!value) return;
        const {start, end, insert} = textChange(value.toString(), input.value);
        binding.transact(() => {
          if (end > start) value.delete(start, end - start);
          if (insert) value.insert(start, insert);
        });
      });
    input.onfocus = input.onblur = () => histories[i].stopCapturing();
    input.onkeydown = event => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key !== 'z' && key !== 'y') return;
      event.preventDefault();
      editor.dispatchCommand(
        key === 'y' || event.shiftKey ? REDO_COMMAND : UNDO_COMMAND,
        undefined,
      );
    };
    sharedValueCleanups.push(
      editor.registerUpdateListener(renderSharedValue),
      () => {
        input.oninput = input.onfocus = input.onblur = input.onkeydown = null;
      },
    );
    renderSharedValue();
    button('Add shared value', () => {
      if (getNote())
        throw new Error('This document already has a shared value.');
      histories[i].stopCapturing();
      const value = new Y.Node();
      value.insert(0, 'Shared text');
      editor.update(() => $setState($getRoot(), noteState, value));
      histories[i].stopCapturing();
    });
    button('Release shared value', () => {
      const value = getNote();
      if (!value) throw new Error('Add a shared value first.');
      histories[i].stopCapturing();
      editor.update(() => $setState($getRoot(), noteState, undefined));
      binding.releaseSharedType(value);
      histories[i].stopCapturing();
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
      syncPresence();
    }
    element('connection').textContent = connected
      ? 'Disconnect peers'
      : 'Reconnect peers';
    status.textContent = connected
      ? 'Peers connected.'
      : 'Peers disconnected. Both editors remain active.';
  });
  action('capture', () => {
    checkpoint = versions.capture();
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
    Y.applyUpdate(doc, checkpoint.update);
    show(doc);
  });
  action('snapshot', () => {
    if (!snapshot)
      throw new Error(
        'Select manual retention, start a fresh session, and save a checkpoint first.',
      );
    show(Y.createDocFromSnapshot(docs[0], snapshot));
  });
  action('compare', () => {
    if (!checkpoint) throw new Error('Save a checkpoint first.');
    const comparison = compareYCheckpoints(checkpoint, versions.capture());
    try {
      element('comparison').textContent = JSON.stringify(
        comparison.getDelta(),
        null,
        2,
      );
    } finally {
      comparison.dispose();
    }
  });
  action('propose', () => {
    stopReview();
    if (proposalEditor) proposalEditor.dispose();
    if (proposalView) proposalView.dispose();
    proposalView = createYDocumentView(versions.capture(), true);
    proposalEditor = createEditor(
      proposalView.doc,
      element('proposal'),
      true,
      'Reviewer',
      getExtensionDependencyFromEditor(alice, YExtension).output.binding,
    );
    const review = getExtensionDependencyFromEditor(
      proposalEditor,
      YSuggestionsExtension,
    ).output;
    stopReview = effect(() => {
      void review.revision.value;
      const delta = review.getDelta();
      element('proposal-delta').textContent = JSON.stringify(delta, null, 2);
      renderReview(
        element('tracked-changes'),
        element('suggestion-list'),
        delta,
        review.getSuggestions(),
        (id, accept) => {
          histories[0].stopCapturing();
          if (accept) review.accept(id);
          else review.reject(id);
        },
      );
    });
    action('accept', () => {
      histories[0].stopCapturing();
      review.accept();
    });
    action('reject', () => review.reject());
    status.textContent =
      'Edit the proposal below. Alice and Bob keep accepted content until you accept.';
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
    sharedValueCleanups.forEach(cleanup => cleanup());
    stopAttribution();
    stopReview();
    if (proposalEditor) proposalEditor.dispose();
    if (proposalView) proposalView.dispose();
    docs.forEach((doc, i) => doc.off('update', listeners[i]));
    if (historical) historical.dispose();
    if (historicalDoc) historicalDoc.destroy();
    editors.forEach(editor => editor.dispose());
    awareness.forEach((local, i) => {
      local.off('update', awarenessListeners[i]);
      local.destroy();
    });
    docs.forEach(doc => doc.destroy());
  };
}
element('reset').onclick = startSession;
startSession();
export function disposeExample() {
  disposeSession();
}
if (import.meta.hot) import.meta.hot.dispose(disposeExample);
