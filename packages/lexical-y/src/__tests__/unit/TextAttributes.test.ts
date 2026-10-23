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
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $getState,
  $isTextNode,
  $setSelection,
  $setState,
  configExtension,
  createState,
  type TextFormatType,
  type TextNode,
} from 'lexical';
import {describe, expect, onTestFinished, test} from 'vitest';

import {getNodeByID} from '../../Topology';

const c1 = createState('mark:c1', {parse: v => v === true});
const c2 = createState('mark:c2', {parse: v => v === true});
const NETWORK = {};
const TEXT = 'Revenue grew by 4% in Q3.';

function create(doc: Y.Doc) {
  const editor = buildEditorFromExtensions(
    configExtension(YExtension, {root: doc.get('root')}),
  );
  onTestFinished(() => editor.dispose());
  return editor;
}
type Editor = ReturnType<typeof create>;

function peers(ids: number[], relay: boolean) {
  const clients = ids.map(clientID => {
    const doc = new Y.Doc({gc: false});
    doc.clientID = clientID;
    onTestFinished(() => doc.destroy());
    return {
      doc,
      editor: undefined as unknown as Editor,
      log: [] as Uint8Array[],
    };
  });
  clients[0].editor = create(clients[0].doc);
  clients[0].editor.update(
    () => {
      $getRoot().append($createParagraphNode().append($createTextNode(TEXT)));
    },
    {discrete: true},
  );
  for (const client of clients.slice(1)) {
    Y.applyUpdate(client.doc, Y.encodeStateAsUpdate(clients[0].doc));
    client.editor = create(client.doc);
  }
  for (const client of clients)
    client.doc.on('update', (update: Uint8Array, origin: unknown) => {
      if (origin !== NETWORK) client.log.push(update);
    });
  const received = clients.map(() => clients.map(() => 0));
  const sent = clients.map(() => 0);
  const relayLog: {from: number; update: Uint8Array}[] = [];
  const relayIndex = clients.map(() => 0);
  const sync = () => {
    let pending = true;
    let rounds = 0;
    while (pending) {
      expect(++rounds).toBeLessThan(30);
      pending = false;
      clients.forEach((client, i) => {
        if (relay) {
          while (sent[i] < client.log.length) {
            relayLog.push({from: i, update: client.log[sent[i]++]});
            pending = true;
          }
          while (relayIndex[i] < relayLog.length) {
            const {from, update} = relayLog[relayIndex[i]++];
            if (from !== i) Y.applyUpdate(client.doc, update, NETWORK);
            pending = true;
          }
        } else
          clients.forEach((sender, j) => {
            if (i === j) return;
            while (received[i][j] < sender.log.length) {
              Y.applyUpdate(client.doc, sender.log[received[i][j]++], NETWORK);
              pending = true;
            }
          });
      });
    }
  };
  return {clients, sync};
}

function $select(start: number, end = start) {
  const texts = $getRoot().getAllTextNodes();
  const point = (offset: number, next: boolean): [TextNode, number] => {
    for (let i = 0; i < texts.length; i++) {
      const size = texts[i].getTextContentSize();
      if (
        offset < size ||
        (offset === size && (!next || i === texts.length - 1))
      )
        return [texts[i], offset];
      offset -= size;
    }
    throw new Error('text offset out of range');
  };
  const [anchor, ao] = point(start, start !== end);
  const [focus, fo] = point(end, false);
  const selection = $createRangeSelection();
  selection.anchor.set(anchor.getKey(), ao, 'text');
  selection.focus.set(focus.getKey(), fo, 'text');
  $setSelection(selection);
  return selection;
}
function $format(
  start: number,
  end: number,
  format: TextFormatType,
  enabled = true,
) {
  for (const node of $select(start, end).extract())
    if ($isTextNode(node) && node.hasFormat(format) !== enabled)
      node.toggleFormat(format);
}
function $type(offset: number, value: string) {
  const selection = $select(offset);
  const node = selection.anchor.getNode() as TextNode;
  selection.format = node.getFormat();
  selection.style = node.getStyle();
  selection.insertText(value);
}
function runs(editor: Editor) {
  return editor.read('latest', () =>
    $getRoot()
      .getAllTextNodes()
      .flatMap(node =>
        Array.from(node.getTextContent(), char => ({
          c1: $getState(node, c1),
          c2: $getState(node, c2),
          char,
          format: node.getFormat(),
        })),
      ),
  );
}
function assertReload(clients: ReturnType<typeof peers>['clients']) {
  for (const client of clients) {
    expect(runs(client.editor)).toEqual(runs(clients[0].editor));
    expect(runs(create(client.doc))).toEqual(runs(client.editor));
  }
}

describe('text attribute concurrency (#9381, #9383)', () => {
  const orders = [
    [1, 2, 3],
    [1, 3, 2],
    [2, 1, 3],
    [2, 3, 1],
    [3, 1, 2],
    [3, 2, 1],
  ];
  for (const relay of [false, true])
    for (const ids of orders) {
      test(`removed formatting stays removed, ${relay ? 'relay' : 'per-sender'} ${ids}`, () => {
        const {clients, sync} = peers(ids, relay);
        const [a, b, c] = clients;
        a.editor.update(
          () => {
            $format(8, 17, 'italic');
            $format(12, 21, 'bold');
          },
          {discrete: true},
        );
        sync();
        a.editor.update(() => $format(8, 17, 'italic', false), {
          discrete: true,
        });
        b.editor.update(() => $type(14, 'XX'), {discrete: true});
        c.editor.update(() => $type(0, 'Z'), {discrete: true});
        sync();
        assertReload(clients);
        const actual = runs(a.editor);
        expect(actual.map(p => p.char).join('')).toBe(
          'ZRevenue grew bXXy 4% in Q3.',
        );
        expect(actual.every(p => !(p.format & 2))).toBe(true);
        expect(actual.slice(-3).every(p => p.format === 0)).toBe(true);
      });
      test(`removed NodeState does not spread overlap, ${relay ? 'relay' : 'per-sender'} ${ids}`, () => {
        const {clients, sync} = peers(ids, relay);
        const [a, b, c] = clients;
        a.editor.update(
          () => {
            for (const n of $select(8, 17).extract())
              if ($isTextNode(n)) $setState(n, c1, true);
            for (const n of $select(12, 21).extract())
              if ($isTextNode(n)) $setState(n, c2, true);
          },
          {discrete: true},
        );
        sync();
        a.editor.update(
          () => {
            for (const n of $getRoot().getAllTextNodes())
              $setState(n, c1, false);
          },
          {discrete: true},
        );
        b.editor.update(() => $type(14, 'XX'), {discrete: true});
        c.editor.update(() => $type(0, 'Z'), {discrete: true});
        sync();
        assertReload(clients);
        const actual = runs(a.editor);
        expect(actual.every(p => !p.c1)).toBe(true);
        expect(actual.slice(-3).every(p => !p.c2)).toBe(true);
        expect(
          actual
            .filter(p => p.c2)
            .map(p => p.char)
            .join(''),
        ).toBe(' bXXy 4% in');
      });
    }
  test.each([
    [1, 2],
    [2, 1],
  ])('overlapping bold and italic merge independently (%s,%s)', (aID, bID) => {
    const {clients, sync} = peers([aID, bID], true);
    clients[0].editor.update(() => $format(8, 17, 'bold'), {discrete: true});
    clients[1].editor.update(() => $format(12, 21, 'italic'), {discrete: true});
    sync();
    assertReload(clients);
    const actual = runs(clients[0].editor);
    expect(actual.slice(8, 12).every(p => p.format === 1)).toBe(true);
    expect(actual.slice(12, 17).every(p => p.format === 3)).toBe(true);
    expect(actual.slice(17, 21).every(p => p.format === 2)).toBe(true);
  });
  test('typing does not rewrite existing format items or remove unknown writer keys', () => {
    const {
      clients: [a],
    } = peers([1], true);
    a.editor.update(() => $format(8, 17, 'bold'), {discrete: true});
    const root = a.doc.get('root');
    const paragraph = getNodeByID(root, root.get(0).id) as Y.Node;
    const run = getNodeByID(root, paragraph.get(0).id) as Y.Node;
    run.format(8, 9, {
      'future:annotation': ['value'],
      'p:new-property': ['preserve'],
    });
    const before = new Set<Y.Item>();
    for (let item = run._start; item; item = item.right)
      if (!item.deleted && item.content instanceof Y.ContentFormat)
        before.add(item);
    a.editor.update(() => $type(0, 'Z'), {discrete: true});
    const added: string[] = [];
    for (let item = run._start; item; item = item.right)
      if (item.content instanceof Y.ContentFormat && !before.has(item))
        added.push(item.content.key);
    expect(added).toEqual([]);
    expect(
      [...run.toDelta().children].some(
        op => 'format' in op && op.format?.['future:annotation'],
      ),
    ).toBe(true);
    expect(
      [...run.toDelta().children].some(
        op => 'format' in op && op.format?.['p:new-property'],
      ),
    ).toBe(true);
  });
  test.each(['token', 'unmergeable'] as const)(
    'adjacent equal %s leaves retain their boundaries after remote edits and reload',
    mode => {
      const {clients, sync} = peers([1, 2], true);
      clients[0].editor.update(
        () => {
          const paragraph = $createParagraphNode();
          for (const text of ['first', 'second']) {
            const node = $createTextNode(text);
            if (mode === 'token') node.setMode('token');
            else node.toggleUnmergeable();
            paragraph.append(node);
          }
          $getRoot().clear().append(paragraph);
        },
        {discrete: true},
      );
      sync();
      clients[1].editor.update(
        () => {
          $getRoot().getAllTextNodes()[1].setTextContent('SECOND');
        },
        {discrete: true},
      );
      sync();
      for (const client of clients) {
        const values = (editor: Editor) =>
          editor.read('latest', () =>
            $getRoot()
              .getAllTextNodes()
              .map(node => node.getTextContent()),
          );
        expect(values(client.editor)).toEqual(['first', 'SECOND']);
        expect(values(create(client.doc))).toEqual(['first', 'SECOND']);
      }
    },
  );
});
