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
  $computeTableMapSkipCellCheck,
  $createTableNodeWithDimensions,
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $mergeCells,
  $unmergeCell,
  registerTablePlugin,
  type TableCellNode,
  type TableNode,
  type TableRowNode,
} from '@lexical/table';
import {YExtension, YHistoryExtension} from '@lexical/y';
import {YTableSelectionExtension} from '@lexical/y/table';
import * as Y from '@y/y';
import {
  $createParagraphNode,
  $getRoot,
  configExtension,
  defineExtension,
  type LexicalEditor,
  type ParagraphNode,
} from 'lexical';
import {expect, onTestFinished, test} from 'vitest';

function create(doc = new Y.Doc()) {
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(YExtension, {root: doc.get('root')}),
        YHistoryExtension,
        YTableSelectionExtension,
      ],
      name: 'table-test',
      register: tableEditor => registerTablePlugin(tableEditor),
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
    history: getExtensionDependencyFromEditor(editor, YHistoryExtension).output
      .undoManager.value!,
  };
}
type Peer = ReturnType<typeof create>;
const $table = () => $getRoot().getFirstChildOrThrow<TableNode>();
const $cell = (r: number, c: number) =>
  $table().getChildAtIndex<TableRowNode>(r)!.getChildAtIndex<TableCellNode>(c)!;
const $select = (r: number, c: number) =>
  $cell(r, c).getFirstChildOrThrow<ParagraphNode>().selectEnd();
const cells = (editor: LexicalEditor) =>
  editor.read('latest', () =>
    $table()
      .getChildren<TableRowNode>()
      .map(row => row.getChildren().map(cell => cell.getTextContent())),
  );
const json = (editor: LexicalEditor) => editor.getEditorState().toJSON(true);
function sync(peers: Peer[]) {
  for (let round = 0; round < 3; round++)
    for (const peer of peers)
      for (const other of peers)
        if (peer !== other)
          Y.applyUpdate(other.doc, Y.encodeStateAsUpdate(peer.doc));
}
function expectTable(peers: Peer[]) {
  const expected = json(peers[0].editor);
  for (const peer of peers) {
    expect(json(peer.editor)).toEqual(expected);
    peer.editor.read('latest', () => {
      const [map] = $computeTableMapSkipCellCheck($table(), null, null);
      const width = Math.max(...map.map(row => row.length));
      for (const row of map) {
        expect(row).toHaveLength(width);
        for (let col = 0; col < width; col++) expect(row[col]).toBeDefined();
      }
      for (const [r, row] of $table().getChildren<TableRowNode>().entries())
        for (const cell of row.getChildren<TableCellNode>()) {
          const entry = map[r].find(value => value?.cell.is(cell));
          expect(entry).toBeDefined();
          for (let dr = 0; dr < cell.getRowSpan(); dr++)
            for (let dc = 0; dc < cell.getColSpan(); dc++)
              expect(
                map[r + dr]?.[entry!.startColumn + dc]?.cell.is(cell),
              ).toBe(true);
        }
    });
  }
}
function group(rows = 3, columns = 3, count = 3) {
  const first = create();
  first.editor.update(() => {
    $getRoot().append(
      $createTableNodeWithDimensions(rows, columns, false),
      $createParagraphNode(),
    );
  });
  const peers = [first];
  while (peers.length < count) {
    const doc = new Y.Doc();
    Y.applyUpdate(doc, Y.encodeStateAsUpdate(first.doc));
    peers.push(create(doc));
  }
  for (const peer of peers) peer.history.clear();
  return peers;
}

test('look-alike rows retain cell identities across sequential three-peer edits', () => {
  const peers = group();
  const [a, b, c] = peers;
  for (let i = 0; i < 2; i++) {
    a.editor.update(() => {
      $select(0, 0);
      $insertTableRowAtSelection(true);
    });
    sync(peers);
  }
  b.editor.update(() => $select(1, 1).insertText('x'));
  sync(peers);
  c.editor.update(() => $select(4, 2).insertText('y'));
  sync(peers);
  expectTable(peers);
  expect(cells(a.editor)).toEqual([
    ['', '', ''],
    ['', 'x', ''],
    ['', '', ''],
    ['', '', ''],
    ['', '', 'y'],
  ]);
});

test('a concurrent insertion cannot take over the empty row a peer edits', () => {
  const peers = group();
  const [a, b] = peers;
  a.editor.update(() => {
    $select(0, 0);
    $insertTableRowAtSelection(true);
  });
  b.editor.update(() => $select(1, 1).insertText('x'));
  sync(peers);
  expectTable(peers);
  expect(cells(a.editor)).toEqual([
    ['', '', ''],
    ['', '', ''],
    ['', 'x', ''],
    ['', '', ''],
  ]);
});

test('three-client row and column edit sequence retains descendant mappings', () => {
  const peers = group(2, 2);
  const [a, b, c] = peers;
  const steps = [
    [a, 1, 0, () => $insertTableRowAtSelection(true)],
    [a, 0, 0, () => $insertTableColumnAtSelection(true)],
    [a, 1, 0, () => $insertTableRowAtSelection(true)],
    [c, 2, 2, () => $select(2, 2).insertText('x')],
    [b, 3, 0, () => $insertTableColumnAtSelection(true)],
  ] as const;
  for (const [peer, r, col, command] of steps) {
    peer.editor.update(() => {
      $select(r, col);
      command();
    });
    sync(peers);
    expectTable(peers);
  }
  expect(cells(a.editor)).toEqual([
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', 'x'],
    ['', '', '', ''],
  ]);
});

const commands = {
  'delete column': $deleteTableColumnAtSelection,
  'delete row': $deleteTableRowAtSelection,
  'insert column': () => $insertTableColumnAtSelection(true),
  'insert row': () => $insertTableRowAtSelection(true),
};
test.each(Object.entries(commands))(
  'concurrent row/column insertion remains rectangular through %s and reload',
  (_name, command) => {
    const peers = group();
    const [a, b, c] = peers;
    a.editor.update(() => {
      $select(1, 1);
      $insertTableRowAtSelection(true);
    });
    b.editor.update(() => {
      $select(1, 1);
      $insertTableColumnAtSelection(true);
    });
    sync(peers);
    expectTable(peers);
    c.editor.update(() => {
      $select(0, 2);
      command();
    });
    sync(peers);
    expectTable(peers);
    const doc = new Y.Doc();
    Y.applyUpdate(doc, Y.encodeStateAsUpdate(c.doc));
    expectTable([...peers, create(doc)]);
    c.history.undo();
    sync(peers);
    expectTable(peers);
    c.history.redo();
    sync(peers);
    expectTable(peers);
  },
);

test('span holes from concurrent merges are repaired before subsequent commands', () => {
  const peers = group(3, 4);
  const [a, b, c] = peers;
  a.editor.update(() => $mergeCells([$cell(0, 2), $cell(1, 2)]));
  b.editor.update(() => $mergeCells([$cell(1, 0), $cell(1, 1)]));
  sync(peers);
  expectTable(peers);
  c.editor.update(() => {
    $select(0, 2);
    $unmergeCell();
  });
  sync(peers);
  expectTable(peers);
});

test('overlapping vertical and horizontal merges do not overlap projected cells', () => {
  const peers = group(3, 4);
  const [a, b, c] = peers;
  a.editor.update(() => {
    for (let r = 0; r < 3; r++)
      for (let col = 0; col < 4; col++)
        $select(r, col).insertText(`<${r}:${col}>`);
  });
  sync(peers);
  a.editor.update(() => $mergeCells([$cell(0, 2), $cell(1, 2)]));
  b.editor.update(() =>
    $mergeCells([$cell(1, 0), $cell(1, 1), $cell(1, 2), $cell(1, 3)]),
  );
  sync(peers);
  expectTable(peers);
  const text = a.editor.read('latest', () => $table().getTextContent());
  for (let r = 0; r < 3; r++)
    for (let col = 0; col < 4; col++)
      expect(text.split(`<${r}:${col}>`)).toHaveLength(2);
  c.editor.update(() => {
    $select(0, 2);
    $insertTableColumnAtSelection(true);
  });
  sync(peers);
  expectTable(peers);
});

test('projection fills holes beside a row span without creating peer-specific cells', () => {
  const peers = group(2, 4);
  const [a] = peers;
  // Equivalent to independently merged cell lists arriving from a provider.
  // Keep table transforms out of this write so the binding has to repair it.
  a.editor.update(
    () => {
      $cell(0, 2).setRowSpan(2);
      for (const cell of $table()
        .getChildAtIndex<TableRowNode>(1)!
        .getChildren()
        .slice(1))
        cell.remove();
    },
    {skipTransforms: true},
  );
  a.binding.read();
  sync(peers);
  expectTable(peers);
  expect(cells(a.editor).flat()).toHaveLength(5);
  // A remote read is a projection; it must not manufacture extra CRDT nodes.
  const update = Y.encodeStateAsUpdate(a.doc);
  for (const peer of peers) peer.binding.read();
  expect(Y.encodeStateAsUpdate(a.doc)).toEqual(update);
});

test('valid row and column spans are preserved without writing repair updates', () => {
  const peers = group(3, 4);
  const [a] = peers;
  a.editor.update(() =>
    $mergeCells([$cell(0, 0), $cell(0, 1), $cell(1, 0), $cell(1, 1)]),
  );
  const expected = json(a.editor);
  sync(peers);
  expectTable(peers);
  expect(json(a.editor)).toEqual(expected);
  for (const peer of peers) {
    const update = Y.encodeStateAsUpdate(peer.doc);
    peer.binding.read();
    peer.binding.read();
    expect(Y.encodeStateAsUpdate(peer.doc)).toEqual(update);
    expect(json(peer.editor)).toEqual(expected);
  }
});

function random(seed: number) {
  let value = seed + 1;
  return (max: number) => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return (value >>> 0) % max;
  };
}

test.each(Array.from({length: 30}, (_, seed) => seed))(
  'three-client sequential table edits retain mapping (seed %i)',
  seed => {
    const peers = group(2, 2);
    const next = random(seed);
    for (let step = 0; step < 12; step++) {
      const peer = peers[next(peers.length)];
      peer.editor.update(() => {
        const rows = $table().getChildren<TableRowNode>();
        const r = next(rows.length);
        const c = next(rows[r].getChildrenSize());
        const width = rows[0].getChildrenSize();
        const op = next(5);
        $select(r, c);
        if (op === 0 && rows.length < 6) $insertTableRowAtSelection(true);
        else if (op === 1 && width < 6) $insertTableColumnAtSelection(true);
        else if (op === 2 && rows.length > 1) $deleteTableRowAtSelection();
        else if (op === 3 && width > 1) $deleteTableColumnAtSelection();
        else $select(r, c).insertText(`${seed}:${step}`);
      });
      sync(peers);
      expectTable(peers);
    }
    const doc = new Y.Doc();
    Y.applyUpdate(doc, Y.encodeStateAsUpdate(peers[0].doc));
    expectTable([...peers, create(doc)]);
  },
);

test('table repairs preserve concurrent cell properties, row height and text', () => {
  const peers = group();
  const [a, b, c] = peers;
  a.editor.update(() => {
    $select(1, 1);
    $insertTableRowAtSelection(true);
  });
  b.editor.update(() => {
    $select(1, 1);
    $insertTableColumnAtSelection(true);
  });
  sync(peers);
  a.editor.update(() => $cell(2, 0).setBackgroundColor('red'));
  b.editor.update(() =>
    $table().getChildAtIndex<TableRowNode>(2)!.setHeight(28),
  );
  c.editor.update(() => $select(2, 1).insertText('retained'));
  sync(peers);
  expectTable(peers);
  a.editor.read('latest', () => {
    expect($cell(2, 0).getBackgroundColor()).toBe('red');
    expect($table().getChildAtIndex<TableRowNode>(2)!.getHeight()).toBe(28);
    expect($cell(2, 1).getTextContent()).toBe('retained');
  });
});

test('concurrent removal of all rows removes the empty table projection', () => {
  const peers = group(2, 2);
  const [a, b] = peers;
  a.editor.update(() => {
    $select(0, 0);
    $deleteTableRowAtSelection();
  });
  b.editor.update(() => {
    $select(1, 0);
    $deleteTableRowAtSelection();
  });
  sync(peers);
  for (const peer of peers)
    expect(
      peer.editor.read('latest', () =>
        $getRoot()
          .getChildren()
          .map(n => n.getType()),
      ),
    ).toEqual(['paragraph']);
});

test.each(Array.from({length: 20}, (_, seed) => seed))(
  'three-client concurrent insertions and merges have stable geometry (seed %i)',
  seed => {
    const peers = group();
    const next = random(seed);
    for (let round = 0; round < 2; round++) {
      for (const peer of peers)
        peer.editor.update(() => {
          const rows = $table().getChildren<TableRowNode>();
          const row = rows[next(rows.length)];
          const cellsInRow = row.getChildren<TableCellNode>();
          const cell = cellsInRow[next(cellsInRow.length)];
          cell.getFirstChildOrThrow<ParagraphNode>().selectEnd();
          const op = next(3);
          if (op === 0) $insertTableRowAtSelection(true);
          else if (op === 1) $insertTableColumnAtSelection(true);
          else if (cellsInRow.length > 1) $mergeCells(cellsInRow.slice(0, 2));
        });
      sync(peers);
      expectTable(peers);
    }
    for (const peer of peers) peer.binding.read();
    expectTable(peers);
    const doc = new Y.Doc();
    Y.applyUpdate(doc, Y.encodeStateAsUpdate(peers[0].doc));
    expectTable([...peers, create(doc)]);
  },
);
