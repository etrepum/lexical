/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  buildEditorFromExtensions,
  getExtensionDependencyFromEditor,
} from '@lexical/extension';
import {
  $createTableNodeWithDimensions,
  $createTableSelectionFrom,
  type TableCellNode,
  TableExtension,
  type TableNode,
  type TableRowNode,
} from '@lexical/table';
import {
  $getYSelection,
  YAwarenessExtension,
  YCursorsExtension,
  YExtension,
} from '@lexical/y';
import {YTableSelectionExtension} from '@lexical/y/table';
import {
  applyAwarenessUpdate,
  Awareness,
  encodeAwarenessUpdate,
} from '@y/protocols/awareness';
import * as Y from '@y/y';
import {
  $createNodeSelection,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $setSelection,
  configExtension,
  defineExtension,
  TextNode,
} from 'lexical';
import {expect, onTestFinished, test} from 'vitest';

test('renders remote selections, refreshes presence and removes overlays on disposal', () => {
  const a = new Y.Doc();
  const b = new Y.Doc();
  const aa = new Awareness(a);
  const ab = new Awareness(b);
  const create = (doc: Y.Doc, awareness: Awareness) => {
    const root = document.createElement('div');
    root.contentEditable = 'true';
    document.body.appendChild(root);
    const editor = buildEditorFromExtensions(
      defineExtension({
        dependencies: [
          configExtension(YExtension, {root: doc.get('root')}),
          configExtension(YAwarenessExtension, {
            awareness,
            user: {color: '#ff0000', name: 'Bob', textColor: '#ffffff'},
          }),
          YCursorsExtension,
        ],
        name: 'browser-test',
      }),
    );
    editor.setRootElement(root);
    onTestFinished(() => {
      editor.dispose();
      root.remove();
    });
    return editor;
  };
  onTestFinished(() => {
    aa.destroy();
    ab.destroy();
    a.destroy();
    b.destroy();
  });
  const ea = create(a, aa);
  ea.update(
    () =>
      $getRoot().append(
        $createParagraphNode().append($createTextNode('hello world')),
      ),
    {discrete: true},
  );
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a));
  const eb = create(b, ab);
  eb.update(() => ($getRoot().getFirstDescendant() as TextNode).select(1, 4), {
    discrete: true,
  });
  applyAwarenessUpdate(aa, encodeAwarenessUpdate(ab, [ab.clientID]), null);
  const caret = document.querySelector(
    `[data-client-id="${ab.clientID}"]`,
  ) as HTMLElement;
  expect(caret).not.toBeNull();
  expect(caret.textContent).toBe('Bob');
  expect(caret.getBoundingClientRect().height).toBeGreaterThan(0);
  const overlay = caret.parentElement!;
  expect(overlay.children.length).toBeGreaterThan(1);
  expect(overlay.getAttribute('aria-hidden')).toBe('true');
  const state = ab.getLocalState()!.lexical;
  ab.setLocalStateField('lexical', {
    ...state,
    user: {...state.user, color: '#0000ff', name: 'Robert'},
  });
  applyAwarenessUpdate(aa, encodeAwarenessUpdate(ab, [ab.clientID]), null);
  expect(overlay.textContent).toBe('Robert');
  expect(
    (overlay.querySelector('[data-client-id]') as HTMLElement).style
      .backgroundColor,
  ).toBe('rgb(0, 0, 255)');
  ea.dispose();
  expect(overlay.isConnected).toBe(false);
});

test('mutation listener updates and force-commit reads preserve collaboration order (#7709)', () => {
  const doc = new Y.Doc();
  const root = document.createElement('div');
  document.body.append(root);
  const editor = buildEditorFromExtensions(
    configExtension(YExtension, {root: doc.get('root')}),
  );
  editor.setRootElement(root);
  onTestFinished(() => {
    editor.dispose();
    root.remove();
    doc.destroy();
  });
  let nested = false;
  editor.registerMutationListener(
    TextNode,
    () => {
      if (!nested) {
        nested = true;
        editor.update(() =>
          ($getRoot().getFirstDescendant() as TextNode).setTextContent(
            'second',
          ),
        );
      }
    },
    {skipInitialization: true},
  );
  editor.registerMutationListener(TextNode, () => editor.read(() => {}), {
    skipInitialization: true,
  });
  editor.update(
    () =>
      $getRoot().append(
        $createParagraphNode().append($createTextNode('first')),
      ),
    {discrete: true},
  );
  const fresh = buildEditorFromExtensions(
    configExtension(YExtension, {root: doc.get('root')}),
  );
  onTestFinished(() => fresh.dispose());
  expect(editor.getEditorState().toJSON(true)).toEqual(
    fresh.getEditorState().toJSON(true),
  );
  expect(editor.read('latest', () => $getRoot().getTextContent())).toBe(
    'second',
  );
});

test.each([
  'none',
  'translate(40px, 30px) scale(1.5)',
  'rotate(12deg) scale(0.8)',
])('custom cursor geometry and cleanup with mount transform %s', transform => {
  const doc = new Y.Doc();
  const awareness = new Awareness(doc);
  const root = document.createElement('div');
  root.contentEditable = 'true';
  const mount = document.createElement('div');
  Object.assign(mount.style, {
    height: '200px',
    margin: '40px',
    transform,
    width: '300px',
  });
  document.body.append(root, mount);
  let renders = 0;
  let cleanups = 0;
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(YExtension, {root: doc.get('root')}),
        configExtension(YAwarenessExtension, {awareness}),
        configExtension(YCursorsExtension, {
          className: 'custom-cursors',
          container: () => mount,
          renderCursor: ({container, rects, presence}) => {
            renders++;
            expect(rects.length).toBeGreaterThan(0);
            const label = container.ownerDocument.createElement('span');
            label.textContent = presence.user.name;
            container.append(label);
            const rect = rects[0];
            const highlight = container.ownerDocument.createElement('div');
            Object.assign(highlight.style, {
              height: `${rect.height}px`,
              left: `${rect.left}px`,
              position: 'absolute',
              top: `${rect.top}px`,
              width: `${rect.width}px`,
            });
            container.append(highlight);
            const actual = highlight.getBoundingClientRect();
            expect(Math.abs(actual.left - rect.left)).toBeLessThan(1);
            expect(Math.abs(actual.top - rect.top)).toBeLessThan(1);
            expect(Math.abs(actual.width - rect.width)).toBeLessThan(1);
            expect(Math.abs(actual.height - rect.height)).toBeLessThan(1);
            return () => {
              cleanups++;
              label.remove();
            };
          },
          zIndex: 12,
        }),
      ],
      name: 'custom-cursors',
    }),
  );
  editor.setRootElement(root);
  onTestFinished(() => {
    editor.dispose();
    awareness.destroy();
    doc.destroy();
    root.remove();
    mount.remove();
  });
  editor.update(
    () => {
      $getRoot().append(
        $createParagraphNode().append($createTextNode('hello')),
      );
      ($getRoot().getFirstDescendant() as TextNode).select(1, 3);
    },
    {discrete: true},
  );
  const output = getExtensionDependencyFromEditor(
    editor,
    YAwarenessExtension,
  ).output;
  const selection = editor.read('latest', () =>
    $getYSelection(
      getExtensionDependencyFromEditor(editor, YExtension).output.binding,
    ),
  );
  output.peers.value = new Map([
    [
      123,
      {selection, user: {color: '#f00', name: 'Custom', textColor: '#fff'}},
    ],
  ]);
  expect(mount.textContent).toBe('Custom');
  expect((mount.firstElementChild as HTMLElement).style.zIndex).toBe('12');
  output.peers.value = new Map();
  expect(cleanups).toBe(renders);
  expect(mount.textContent).toBe('');
  editor.dispose();
  expect(mount.childElementCount).toBe(0);
});

test.each(['node', 'table'])(
  'renders %s highlights for a restored table and clears them on deletion',
  kind => {
    const doc = new Y.Doc();
    const seed = buildEditorFromExtensions(
      defineExtension({
        dependencies: [
          configExtension(YExtension, {root: doc.get('root')}),
          YTableSelectionExtension,
        ],
        name: 'seed-table',
      }),
    );
    seed.update(() => $getRoot().append($createTableNodeWithDimensions(2, 2)));
    seed.dispose();
    const awareness = new Awareness(doc);
    const root = document.createElement('div');
    root.contentEditable = 'true';
    document.body.append(root);
    const editor = buildEditorFromExtensions(
      defineExtension({
        dependencies: [
          defineExtension({
            name: 'mount-first',
            register: mounted => {
              mounted.setRootElement(root);
              return () => mounted.setRootElement(null);
            },
          }),
          TableExtension,
          YTableSelectionExtension,
          configExtension(YExtension, {root: doc.get('root')}),
          configExtension(YAwarenessExtension, {awareness}),
          YCursorsExtension,
        ],
        name: 'restored-table',
      }),
    );
    onTestFinished(() => {
      editor.dispose();
      awareness.destroy();
      doc.destroy();
      root.remove();
    });
    const binding = getExtensionDependencyFromEditor(editor, YExtension).output
      .binding;
    const peers = getExtensionDependencyFromEditor(editor, YAwarenessExtension)
      .output.peers;
    editor.update(() => {
      const table = $getRoot().getFirstChildOrThrow<TableNode>();
      if (kind === 'node') {
        const selection = $createNodeSelection();
        selection.add(table.getKey());
        $setSelection(selection);
      } else {
        const first = table
          .getFirstChildOrThrow<TableRowNode>()
          .getFirstChildOrThrow<TableCellNode>();
        const last = table
          .getLastChildOrThrow<TableRowNode>()
          .getLastChildOrThrow<TableCellNode>();
        $setSelection($createTableSelectionFrom(table, first, last));
      }
    });
    peers.value = new Map([
      [
        123,
        {
          selection: editor.read('latest', () => $getYSelection(binding)),
          user: {color: '#f00', name: 'Peer', textColor: '#fff'},
        },
      ],
    ]);
    expect(document.querySelectorAll('.lexical-y-highlight')).toHaveLength(
      kind === 'node' ? 1 : 4,
    );
    expect(
      document.querySelector('.lexical-y-selection-label')!.textContent,
    ).toBe('Peer');
    for (const highlight of document.querySelectorAll('.lexical-y-highlight'))
      expect(highlight.getBoundingClientRect().width).toBeGreaterThan(0);
    editor.update(() => $getRoot().clear());
    expect(document.querySelectorAll('.lexical-y-highlight')).toHaveLength(0);
  },
);
