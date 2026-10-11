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
  $createTableNodeWithDimensions,
  $insertTableColumnAtNode,
  $insertTableRowAtNode,
  $mergeCells,
  registerTablePlugin,
  type TableCellNode,
  type TableNode,
  type TableRowNode,
} from '@lexical/table';
import {
  compareYCheckpoints,
  createYDocumentView,
  YAttributionExtension,
  YExtension,
  YHistoryExtension,
  YSuggestionsExtension,
  YVersionsExtension,
} from '@lexical/y';
import {YTableSelectionExtension} from '@lexical/y/table';
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
        YTableSelectionExtension,
        YVersionsExtension,
        configExtension(YAttributionExtension, {
          author: 'Alice',
          storage: doc.get('authors'),
        }),
      ],
      name: 'review-base',
      register: tableEditor => registerTablePlugin(tableEditor),
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
        configExtension(YAttributionExtension, {
          author: 'Reviewer',
          storage: view.doc.get('authors'),
        }),
        YHistoryExtension,
        YTableSelectionExtension,
      ],
      name: 'proposal',
      register: tableEditor => registerTablePlugin(tableEditor),
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
        configExtension(YAttributionExtension, {
          author: 'Reviewer',
          storage: view.doc.get('authors'),
        }),
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

test('individual text suggestions accept out of order, reject independently, and undo acceptance', () => {
  const {main, editor, suggestions} = proposal();
  editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(0, 0, 'first '),
  );
  editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(11, 0, ' last'),
  );
  const changes = suggestions.getSuggestions();
  expect(changes).toHaveLength(2);
  suggestions.accept(
    changes.find(change => change.insertedText === ' last')!.id,
  );
  expect(text(main.editor)).toBe('hello last');
  expect(text(editor)).toBe('first hello last');
  suggestions.reject(suggestions.getSuggestions()[0].id);
  expect(text(editor)).toBe('hello last');
  expect(suggestions.getSuggestions()).toHaveLength(0);
  main.history.undo();
  expect(text(main.editor)).toBe('hello');
});

test('individual structural suggestions include node stores, placements and shared references', () => {
  const {main, editor, suggestions} = proposal();
  editor.update(() =>
    $getRoot().append(
      $createParagraphNode().append($createTextNode('new paragraph')),
    ),
  );
  editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(
      0,
      0,
      'unrelated ',
    ),
  );
  const structural = suggestions
    .getSuggestions()
    .find(change => change.kind === 'structure')!;
  suggestions.accept(structural.id);
  expect(text(main.editor)).toBe('hello\n\nnew paragraph');
  expect(text(editor)).toBe('unrelated hello\n\nnew paragraph');
  expect(suggestions.getSuggestions()).toHaveLength(1);
  expect(main.binding.error.value).toBeNull();
});

test('inline delta identifies pending insertions and deletions by suggestion', () => {
  const {editor, suggestions} = proposal();
  editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(0, 2, 'HE'),
  );
  const delta = JSON.stringify(suggestions.getDelta());
  expect(delta).toContain('suggestion');
  expect(delta).toContain('delete');
  expect(delta).toContain('insert');
  for (const suggestion of suggestions.getSuggestions())
    expect(delta).toContain(suggestion.id);
});

test.each(['accept', 'reject'] as const)(
  'individual replacement %s preserves unrelated edits',
  action => {
    const {main, editor, suggestions} = proposal();
    editor.update(() =>
      ($getRoot().getFirstDescendant() as TextNode).spliceText(1, 2, 'EE'),
    );
    editor.update(() =>
      $getRoot().append(
        $createParagraphNode().append($createTextNode('separate')),
      ),
    );
    const replacement = suggestions
      .getSuggestions()
      .find(change => change.insertedText === 'EE')!;
    expect(replacement.deletedText).toBe('el');
    suggestions[action](replacement.id);
    expect(text(main.editor)).toBe(action === 'accept' ? 'hEElo' : 'hello');
    expect(text(editor)).toBe(
      (action === 'accept' ? 'hEElo' : 'hello') + '\n\nseparate',
    );
    expect(suggestions.getSuggestions()).toHaveLength(1);
  },
);

test('individual formatting changes preserve independent text and survive a concurrent base edit', () => {
  const {main, editor, suggestions} = proposal();
  editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).toggleFormat('bold'),
  );
  editor.update(() =>
    $getRoot().append(
      $createParagraphNode().append($createTextNode('separate')),
    ),
  );
  main.editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(5, 0, '!'),
  );
  const format = suggestions
    .getSuggestions()
    .find(change => change.kind === 'format')!;
  suggestions.accept(format.id);
  expect(
    main.editor.read('latest', () =>
      ($getRoot().getFirstDescendant() as TextNode).hasFormat('bold'),
    ),
  ).toBe(true);
  expect(text(main.editor)).toBe('hello!');
  expect(suggestions.getSuggestions()).toHaveLength(1);
  expect(() => suggestions.accept(format.id)).toThrow('no longer pending');
});

test('individual acceptance retains proposal authorship without accepting other content', () => {
  const {main, editor, suggestions} = proposal();
  editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(0, 0, 'reviewed '),
  );
  editor.update(() =>
    $getRoot().append(
      $createParagraphNode().append($createTextNode('pending')),
    ),
  );
  suggestions.accept(
    suggestions
      .getSuggestions()
      .find(change => change.insertedText === 'reviewed ')!.id,
  );
  expect(text(main.editor)).toBe('reviewed hello');
  expect(JSON.stringify(main.attribution.getDelta())).toContain('Reviewer');
  expect(suggestions.getSuggestions()).toHaveLength(1);
});

test('individual shared NodeState references include owned storage and survive acceptance undo', () => {
  const {main, editor, suggestions} = proposal();
  const state = createState('review-shared', {
    parse: (value: unknown) => (value instanceof Y.Node ? value : null),
  });
  const shared = new Y.Node();
  shared.insert(0, 'shared value');
  editor.update(() => {
    const paragraph = $createParagraphNode().append(
      $createTextNode('with state'),
    );
    $setState(paragraph, state, shared);
    $getRoot().append(paragraph);
  });
  editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(0, 0, 'pending '),
  );
  suggestions.accept(
    suggestions.getSuggestions().find(change => change.kind === 'structure')!
      .id,
  );
  main.editor.read('latest', () =>
    expect($getState($getRoot().getLastChildOrThrow(), state)!.toString()).toBe(
      'shared value',
    ),
  );
  expect(suggestions.getSuggestions()).toHaveLength(1);
  expect(main.binding.error.value).toBeNull();
  main.history.undo();
  expect(text(main.editor)).toBe('hello');
  main.history.redo();
  expect(text(main.editor)).toBe('hello\n\nwith state');
});

test('pending suggestions reconstruct from persisted proposal operations', () => {
  const {main, editor, suggestions, view} = proposal();
  editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(0, 0, 'first '),
  );
  editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(11, 0, ' last'),
  );
  const expected = suggestions.getSuggestions();
  const doc = new Y.Doc({gc: false, isSuggestionDoc: true});
  Y.applyUpdate(doc, Y.encodeStateAsUpdate(view.doc));
  const resumed = buildEditorFromExtensions(
    configExtension(YExtension, {root: doc.get('root')}),
    configExtension(YSuggestionsExtension, {base: main.binding}),
  );
  onTestFinished(() => {
    resumed.dispose();
    doc.destroy();
  });
  const review = getExtensionDependencyFromEditor(
    resumed,
    YSuggestionsExtension,
  ).output;
  expect(review.getSuggestions()).toEqual(expected);
  review.accept(expected.find(change => change.insertedText === ' last')!.id);
  expect(text(main.editor)).toBe('hello last');
  expect(text(resumed)).toBe('first hello last');
});

test('restored CRDT content after proposal undo can be accepted without changing text', () => {
  const {editor, history, suggestions} = proposal();
  editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(
      1,
      2,
      'replacement',
    ),
  );
  history.undo();
  expect(text(editor)).toBe('hello');
  for (const change of suggestions.getSuggestions())
    suggestions.accept(change.id);
  expect(text(editor)).toBe('hello');
  expect(suggestions.getSuggestions()).toHaveLength(0);
});

test('disjoint formatting runs in a text group can be reviewed separately', () => {
  const {main, editor, suggestions} = proposal();
  editor.update(() => {
    const [first, , last] = (
      $getRoot().getFirstDescendant() as TextNode
    ).splitText(1, 4);
    first.toggleFormat('bold');
    last.toggleFormat('italic');
  });
  expect(suggestions.getSuggestions()).toHaveLength(2);
  suggestions.accept(suggestions.getSuggestions()[0].id);
  expect(
    main.editor.read('latest', () =>
      ($getRoot().getFirstDescendant() as TextNode).hasFormat('bold'),
    ),
  ).toBe(true);
  expect(
    main.editor.read('latest', () =>
      ($getRoot().getLastDescendant() as TextNode).hasFormat('italic'),
    ),
  ).toBe(false);
  expect(suggestions.getSuggestions()).toHaveLength(1);
  suggestions.reject(suggestions.getSuggestions()[0].id);
  expect(text(main.editor)).toBe('hello');
  expect(suggestions.getSuggestions()).toHaveLength(0);
  expect(main.binding.error.value).toBeNull();
});

test.each(['accept', 'reject'] as const)(
  'table row edits %s independently from existing cell content',
  action => {
    const {main, editor, suggestions} = proposal();
    main.editor.update(() =>
      $getRoot().append($createTableNodeWithDimensions(2, 2)),
    );
    editor.update(() => {
      const table = $getRoot().getLastChildOrThrow<TableNode>();
      const cell = table
        .getFirstChildOrThrow<TableRowNode>()
        .getFirstChildOrThrow<TableCellNode>();
      $insertTableRowAtNode(cell, true);
    });
    editor.update(() => {
      const table = $getRoot().getLastChildOrThrow<TableNode>();
      const cell = table
        .getLastChildOrThrow<TableRowNode>()
        .getLastChildOrThrow<TableCellNode>();
      cell
        .getFirstChildOrThrow<import('lexical').ParagraphNode>()
        .append($createTextNode('cell change'));
      ($getRoot().getFirstDescendant() as TextNode).spliceText(
        0,
        0,
        'unrelated ',
      );
    });
    const changes = suggestions.getSuggestions();
    expect(changes).toHaveLength(3);
    suggestions[action](
      changes.find(
        change => change.kind === 'structure' && change.insertedText === '',
      )!.id,
    );
    expect(
      main.editor.read('latest', () =>
        $getRoot().getLastChildOrThrow<TableNode>().getChildrenSize(),
      ),
    ).toBe(action === 'accept' ? 3 : 2);
    expect(text(main.editor)).not.toContain('cell change');
    expect(text(main.editor)).not.toContain('unrelated');
    expect(suggestions.getSuggestions()).toHaveLength(2);
    suggestions.accept(
      suggestions
        .getSuggestions()
        .find(change => change.insertedText === 'cell change')!.id,
    );
    expect(text(main.editor)).toContain('cell change');
    expect(main.binding.error.value).toBeNull();
  },
);

test('accepting a suggestion never resurrects canceled proposal characters used as origins', () => {
  const {main, editor, suggestions} = proposal();
  editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(2, 0, 'canceled'),
  );
  editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(10, 0, 'kept'),
  );
  editor.update(() =>
    ($getRoot().getFirstDescendant() as TextNode).spliceText(2, 8, ''),
  );
  expect(text(editor)).toBe('hekeptllo');
  expect(JSON.stringify(suggestions.getDelta())).not.toContain('canceled');
  for (const change of suggestions.getSuggestions())
    suggestions.accept(change.id);
  expect(text(main.editor)).toBe('hekeptllo');
  expect(text(editor)).toBe('hekeptllo');
  expect(suggestions.getSuggestions()).toHaveLength(0);
});

test.each(['accept', 'reject'] as const)(
  'disjoint format replacements %s independently against non-default base formatting',
  action => {
    const {main, editor, suggestions} = proposal();
    main.editor.update(() =>
      ($getRoot().getFirstDescendant() as TextNode).setFormat('bold'),
    );
    editor.update(() => {
      const [first, , last] = (
        $getRoot().getFirstDescendant() as TextNode
      ).splitText(1, 4);
      first.setFormat('italic');
      last.setFormat('underline');
    });
    expect(suggestions.getSuggestions()).toHaveLength(2);
    const first = suggestions.getSuggestions()[0];
    suggestions[action](first.id);
    expect(
      main.editor.read('latest', () =>
        ($getRoot().getFirstDescendant() as TextNode).hasFormat(
          action === 'accept' ? 'italic' : 'bold',
        ),
      ),
    ).toBe(true);
    expect(
      main.editor.read('latest', () =>
        ($getRoot().getLastDescendant() as TextNode).hasFormat('bold'),
      ),
    ).toBe(true);
    expect(suggestions.getSuggestions()).toHaveLength(1);
    suggestions.accept(suggestions.getSuggestions()[0].id);
    expect(
      main.editor.read('latest', () =>
        ($getRoot().getLastDescendant() as TextNode).hasFormat('underline'),
      ),
    ).toBe(true);
    expect(text(main.editor)).toBe('hello');
  },
);

test.each(['column', 'merge'] as const)(
  'table %s geometry excludes unrelated cell text and properties',
  operation => {
    const {main, editor, suggestions} = proposal();
    main.editor.update(() =>
      $getRoot().append($createTableNodeWithDimensions(2, 2)),
    );
    editor.update(() => {
      const row = $getRoot()
        .getLastChildOrThrow<TableNode>()
        .getFirstChildOrThrow<TableRowNode>();
      if (operation === 'column')
        $insertTableColumnAtNode(
          row.getFirstChildOrThrow<TableCellNode>(),
          true,
        );
      else $mergeCells(row.getChildren<TableCellNode>());
    });
    editor.update(() => {
      const cell = $getRoot()
        .getLastChildOrThrow<TableNode>()
        .getLastChildOrThrow<TableRowNode>()
        .getLastChildOrThrow<TableCellNode>();
      cell
        .getFirstChildOrThrow<import('lexical').ParagraphNode>()
        .append($createTextNode('independent'));
      cell.setBackgroundColor('red');
    });
    const changes = suggestions.getSuggestions();
    expect(changes).toHaveLength(3);
    const content = changes.find(
      change => change.insertedText === 'independent',
    )!;
    suggestions.accept(content.id);
    expect(text(main.editor)).toContain('independent');
    expect(
      main.editor.read('latest', () =>
        $getRoot()
          .getLastChildOrThrow<TableNode>()
          .getFirstChildOrThrow<TableRowNode>()
          .getChildrenSize(),
      ),
    ).toBe(2);
    const property = suggestions
      .getSuggestions()
      .find(change => change.kind === 'property')!;
    suggestions.reject(property.id);
    expect(suggestions.getSuggestions()).toHaveLength(1);
    suggestions.accept(suggestions.getSuggestions()[0].id);
    expect(
      main.editor.read('latest', () =>
        $getRoot()
          .getLastChildOrThrow<TableNode>()
          .getFirstChildOrThrow<TableRowNode>()
          .getChildrenSize(),
      ),
    ).toBe(operation === 'column' ? 3 : 1);
    expect(text(main.editor)).toContain('independent');
    expect(main.binding.error.value).toBeNull();
  },
);

test('separate complete table rows can be reviewed out of order with undo and redo', () => {
  const {main, editor, suggestions} = proposal();
  main.editor.update(() =>
    $getRoot().append($createTableNodeWithDimensions(2, 2)),
  );
  main.history.clear();
  editor.update(() => {
    const table = $getRoot().getLastChildOrThrow<TableNode>();
    $insertTableRowAtNode(
      table
        .getFirstChildOrThrow<TableRowNode>()
        .getFirstChildOrThrow<TableCellNode>(),
      false,
    );
    table
      .getFirstChildOrThrow<TableRowNode>()
      .getFirstChildOrThrow<TableCellNode>()
      .getFirstChildOrThrow<import('lexical').ParagraphNode>()
      .append($createTextNode('first row'));
  });
  editor.update(() => {
    const table = $getRoot().getLastChildOrThrow<TableNode>();
    $insertTableRowAtNode(
      table
        .getLastChildOrThrow<TableRowNode>()
        .getFirstChildOrThrow<TableCellNode>(),
      true,
    );
    table
      .getLastChildOrThrow<TableRowNode>()
      .getFirstChildOrThrow<TableCellNode>()
      .getFirstChildOrThrow<import('lexical').ParagraphNode>()
      .append($createTextNode('last row'));
  });
  expect(suggestions.getSuggestions()).toHaveLength(2);
  suggestions.accept(
    suggestions
      .getSuggestions()
      .find(change => change.insertedText === 'last row')!.id,
  );
  expect(text(main.editor)).toContain('last row');
  expect(text(main.editor)).not.toContain('first row');
  main.history.undo();
  expect(text(main.editor)).not.toContain('last row');
  main.history.redo();
  expect(text(main.editor)).toContain('last row');
  suggestions.reject(suggestions.getSuggestions()[0].id);
  expect(text(editor)).not.toContain('first row');
  expect(text(editor)).toBe(text(main.editor));
  expect(suggestions.getSuggestions()).toHaveLength(0);
});

test('cell content in a new row stays with that row while old cell content remains independent', () => {
  const {main, editor, suggestions} = proposal();
  main.editor.update(() =>
    $getRoot().append($createTableNodeWithDimensions(2, 2)),
  );
  editor.update(() => {
    const table = $getRoot().getLastChildOrThrow<TableNode>();
    $insertTableRowAtNode(
      table
        .getFirstChildOrThrow<TableRowNode>()
        .getFirstChildOrThrow<TableCellNode>(),
      false,
    );
  });
  editor.update(() => {
    const table = $getRoot().getLastChildOrThrow<TableNode>();
    for (const [row, content] of [
      [table.getFirstChildOrThrow<TableRowNode>(), 'new row'],
      [table.getLastChildOrThrow<TableRowNode>(), 'existing row'],
    ] as const) {
      row
        .getFirstChildOrThrow<TableCellNode>()
        .getFirstChildOrThrow<import('lexical').ParagraphNode>()
        .append($createTextNode(content));
    }
  });
  expect(suggestions.getSuggestions()).toHaveLength(2);
  suggestions.reject(
    suggestions
      .getSuggestions()
      .find(change => change.insertedText === 'new row')!.id,
  );
  expect(text(editor)).not.toContain('new row');
  expect(text(editor)).toContain('existing row');
  suggestions.accept(suggestions.getSuggestions()[0].id);
  expect(text(main.editor)).toContain('existing row');
  expect(main.binding.error.value).toBeNull();
});

test.each(['accept', 'reject'] as const)(
  'row insertion through a proposed rowspan keeps its geometry atomic on %s',
  action => {
    const {main, editor, suggestions} = proposal();
    main.editor.update(() =>
      $getRoot().append($createTableNodeWithDimensions(2, 2)),
    );
    editor.update(() => {
      const table = $getRoot().getLastChildOrThrow<TableNode>();
      $mergeCells([
        table
          .getFirstChildOrThrow<TableRowNode>()
          .getFirstChildOrThrow<TableCellNode>(),
        table
          .getLastChildOrThrow<TableRowNode>()
          .getFirstChildOrThrow<TableCellNode>(),
      ]);
      $insertTableRowAtNode(
        table
          .getFirstChildOrThrow<TableRowNode>()
          .getLastChildOrThrow<TableCellNode>(),
        true,
      );
    });
    editor.update(() =>
      $getRoot()
        .getLastChildOrThrow<TableNode>()
        .getLastChildOrThrow<TableRowNode>()
        .getLastChildOrThrow<TableCellNode>()
        .getFirstChildOrThrow<import('lexical').ParagraphNode>()
        .append($createTextNode('separate cell')),
    );
    expect(suggestions.getSuggestions()).toHaveLength(2);
    suggestions[action](
      suggestions.getSuggestions().find(change => !change.insertedText)!.id,
    );
    expect(
      main.editor.read('latest', () =>
        $getRoot().getLastChildOrThrow<TableNode>().getChildrenSize(),
      ),
    ).toBe(action === 'accept' ? 3 : 2);
    expect(
      main.editor.read('latest', () =>
        $getRoot()
          .getLastChildOrThrow<TableNode>()
          .getFirstChildOrThrow<TableRowNode>()
          .getFirstChildOrThrow<TableCellNode>()
          .getRowSpan(),
      ),
    ).toBe(action === 'accept' ? 3 : 1);
    suggestions.accept(suggestions.getSuggestions()[0].id);
    expect(text(main.editor)).toContain('separate cell');
    expect(text(editor)).toBe(text(main.editor));
    expect(main.binding.error.value).toBeNull();
  },
);

test('application shared-text boundary formatting remains a complete review run', () => {
  const {main, editor, suggestions} = proposal();
  const state = createState('custom-formatted-shared', {
    parse: (value: unknown) => (value instanceof Y.Node ? value : null),
  });
  const shared = new Y.Node();
  shared.insert(0, 'hello');
  main.editor.update(() => $setState($getRoot(), state, shared));
  const value = editor.read('latest', () => $getState($getRoot(), state)!);
  const binding = getExtensionDependencyFromEditor(editor, YExtension).output
    .binding;
  binding.transact(() => value.format(1, 2, {boundary: 'emphasis'}));
  expect(suggestions.getSuggestions()).toHaveLength(1);
  suggestions.accept(suggestions.getSuggestions()[0].id);
  expect(shared.toDelta()).toEqual(value.toDelta());
  expect(suggestions.getSuggestions()).toHaveLength(0);
});
