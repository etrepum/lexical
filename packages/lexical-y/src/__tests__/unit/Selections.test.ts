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
  $createTableSelectionFrom,
  $deleteTableColumnAtSelection,
  $insertTableColumnAtNode,
  $insertTableRowAtNode,
  $isTableSelection,
  $mergeCells,
  $removeTableRowAtIndex,
  $unmergeCellNode,
  registerTablePlugin,
  type TableCellNode,
  type TableNode,
  type TableRowNode,
} from '@lexical/table';
import {
  $getYSelection,
  $resolveYSelection,
  YExtension,
  YHistoryExtension,
} from '@lexical/y';
import {YTableSelectionExtension} from '@lexical/y/table';
import * as Y from '@y/y';
import {
  $createNodeSelection,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  configExtension,
  defineExtension,
  type LexicalEditor,
  type ParagraphNode,
  type TextNode,
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
      name: 'selection-test',
      register: tableEditor => registerTablePlugin(tableEditor),
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
const $table = () => $getRoot().getFirstChildOrThrow<TableNode>();
const $cell = (r: number, c: number) =>
  $table().getChildAtIndex<TableRowNode>(r)!.getChildAtIndex<TableCellNode>(c)!;
const json = (editor: LexicalEditor) => editor.getEditorState().toJSON(true);
function pair() {
  const a = create();
  a.editor.update(() => {
    $getRoot().append($createTableNodeWithDimensions(3, 3));
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 3; col++)
        $cell(row, col)
          .getFirstChildOrThrow<ParagraphNode>()
          .append($createTextNode(`${row}:${col}`));
  });
  const doc = new Y.Doc();
  Y.applyUpdate(doc, Y.encodeStateAsUpdate(a.doc));
  const b = create(doc);
  a.history.clear();
  b.history.clear();
  onTestFinished(() => {
    a.doc.destroy();
    b.doc.destroy();
  });
  return {a, b};
}
function sync(a: ReturnType<typeof create>, b: ReturnType<typeof create>) {
  for (let i = 0; i < 3; i++) {
    Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(a.doc));
    Y.applyUpdate(a.doc, Y.encodeStateAsUpdate(b.doc));
  }
}

test('node selection follows moves, drops deleted members and survives undo', () => {
  const a = create();
  a.editor.update(() => {
    const one = $createParagraphNode().append($createTextNode('one'));
    const two = $createParagraphNode().append($createTextNode('two'));
    $getRoot().append(one, two);
    const selection = $createNodeSelection();
    selection.add(one.getKey());
    $setSelection(selection);
  });
  const bookmark = a.editor.read('latest', () => $getYSelection(a.binding))!;
  a.editor.update(() => $getRoot().append($getRoot().getFirstChildOrThrow()));
  a.editor.read('latest', () => {
    const selection = $resolveYSelection(a.binding, bookmark);
    expect($isNodeSelection(selection)).toBe(true);
    expect(selection!.getNodes()[0].getTextContent()).toBe('one');
  });
  a.history.clear();
  a.editor.update(() => $getRoot().getLastChildOrThrow().remove());
  expect(
    a.editor.read('latest', () => $resolveYSelection(a.binding, bookmark)),
  ).toBeNull();
  a.history.undo();
  a.editor.read('latest', () =>
    expect(
      $resolveYSelection(a.binding, bookmark, true)!
        .getNodes()[0]
        .getTextContent(),
    ).toBe('one'),
  );
});

test('node selection over text follows CRDT ranges through formatting splits', () => {
  const a = create();
  a.editor.update(() => {
    const text = $createTextNode('hello');
    $getRoot().append($createParagraphNode().append(text));
    const selection = $createNodeSelection();
    selection.add(text.getKey());
    $setSelection(selection);
  });
  const bookmark = a.editor.read('latest', () => $getYSelection(a.binding))!;
  a.editor.update(() => {
    const [, right] = ($getRoot().getFirstDescendant() as TextNode).splitText(
      2,
    );
    right.toggleFormat('bold');
  });
  a.editor.read('latest', () =>
    expect(
      $resolveYSelection(a.binding, bookmark)!
        .getNodes()
        .map(n => n.getTextContent()),
    ).toEqual(['he', 'llo']),
  );
});

test('table selection uses cell identity, expands with inserted rows, recovers deleted endpoints', () => {
  const {a, b} = pair();
  a.editor.update(() =>
    $setSelection(
      $createTableSelectionFrom($table(), $cell(0, 0), $cell(2, 2)),
    ),
  );
  const bookmark = a.editor.read('latest', () => $getYSelection(a.binding))!;
  b.editor.update(() => {
    $insertTableRowAtNode($cell(0, 0));
  });
  sync(a, b);
  a.editor.read('latest', () => {
    const selection = $resolveYSelection(a.binding, bookmark);
    expect($isTableSelection(selection)).toBe(true);
    expect(
      selection!.getNodes().filter(n => n.getType() === 'tablecell'),
    ).toHaveLength(12);
  });
  b.editor.update(() => {
    $removeTableRowAtIndex($table(), 0);
  });
  sync(a, b);
  a.editor.read('latest', () => {
    const selection = $getSelection();
    expect($isTableSelection(selection)).toBe(true);
    expect(
      selection!.getNodes().filter(n => n.getType() === 'tablecell'),
    ).toHaveLength(9);
  });
});

test.each([
  'row/row',
  'column/column',
  'delete/edit',
  'merge/edit',
  'merge/merge',
] as const)('table convergence under concurrent %s', scenario => {
  const {a, b} = pair();
  a.editor.update(() => {
    if (scenario === 'row/row') $insertTableRowAtNode($cell(0, 0));
    else if (scenario === 'column/column')
      $insertTableColumnAtNode($cell(0, 0));
    else if (scenario === 'delete/edit') $removeTableRowAtIndex($table(), 0);
    else $mergeCells([$cell(0, 0), $cell(0, 1)]);
  });
  b.editor.update(() => {
    if (scenario === 'row/row') $insertTableRowAtNode($cell(1, 0));
    else if (scenario === 'column/column')
      $insertTableColumnAtNode($cell(0, 1));
    else if (scenario === 'merge/merge')
      $mergeCells([$cell(0, 1), $cell(0, 2)]);
    else
      $cell(0, 1)
        .getFirstChildOrThrow<ParagraphNode>()
        .append($createTextNode('concurrent'));
  });
  sync(a, b);
  expect(json(a.editor)).toEqual(json(b.editor));
  a.editor.read('latest', () => {
    const [grid] = $computeTableMapSkipCellCheck($table(), null, null);
    const width = Math.max(...grid.map(row => row.length));
    for (const row of grid) expect(row.filter(Boolean)).toHaveLength(width);
  });
  if (scenario === 'merge/edit')
    expect(
      a.editor.read('latest', () => $getRoot().getTextContent()),
    ).toContain('concurrent');
  const reload = create(a.doc);
  expect(json(reload.editor)).toEqual(json(a.editor));
  a.history.undo();
  sync(a, b);
  expect(json(a.editor)).toEqual(json(b.editor));
  a.history.redo();
  sync(a, b);
  expect(json(a.editor)).toEqual(json(b.editor));
});

test('merged cells, column deletion and unmerge preserve convergence', () => {
  const {a, b} = pair();
  a.editor.update(() => {
    $mergeCells([$cell(0, 0), $cell(0, 1)]);
  });
  sync(a, b);
  a.editor.update(() => {
    $unmergeCellNode($cell(0, 0));
  });
  b.editor.update(() => {
    $cell(2, 2).selectStart();
    $deleteTableColumnAtSelection();
  });
  sync(a, b);
  expect(json(a.editor)).toEqual(json(b.editor));
  expect(json(create(a.doc).editor)).toEqual(json(a.editor));
});

test('unknown and malformed selection payloads are ignored', () => {
  const a = create();
  a.editor.read('latest', () => {
    expect(
      $resolveYSelection(a.binding, {data: {}, kind: 'unknown'}),
    ).toBeNull();
    expect(
      $resolveYSelection(a.binding, {data: [{}], kind: 'node'}),
    ).toBeNull();
    expect($resolveYSelection(a.binding, {data: {}, kind: 'table'})).toBeNull();
    expect($resolveYSelection(a.binding, {data: {}, kind: 'range'})).toBeNull();
  });
});
