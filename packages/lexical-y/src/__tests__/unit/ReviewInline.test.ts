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
import {$isLinkNode, $toggleLink, AutoLinkNode, LinkNode} from '@lexical/link';
import {$isMarkNode, $wrapSelectionInMarkNode, MarkNode} from '@lexical/mark';
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
  $create,
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $getState,
  $isElementNode,
  $isTextNode,
  $setSelection,
  $setState,
  configExtension,
  createState,
  defineExtension,
  ElementNode,
  type Klass,
  type LexicalEditor,
  type LexicalNode,
  type TextNode,
} from 'lexical';
import {expect, onTestFinished, test, vi} from 'vitest';

class ReviewCalloutNode extends ElementNode {
  $config() {
    return this.config('inline-review-callout', {extends: ElementNode});
  }
}

function $texts(node: LexicalNode): TextNode[] {
  return $isTextNode(node)
    ? [node]
    : $isElementNode(node)
      ? node.getChildren().flatMap($texts)
      : [];
}

function $select(start: number, end = start) {
  const nodes = $texts($getRoot());
  const selection = $createRangeSelection();
  const point = (offset: number) => {
    for (const node of nodes) {
      if (offset <= node.getTextContentSize()) return {node, offset};
      offset -= node.getTextContentSize();
    }
    throw new Error('Selection exceeds text');
  };
  const anchor = point(start);
  const focus = point(end);
  selection.anchor.set(anchor.node.getKey(), anchor.offset, 'text');
  selection.focus.set(focus.node.getKey(), focus.offset, 'text');
  $setSelection(selection);
  return selection;
}

function setup(initial?: () => void, baseNodes: Klass<LexicalNode>[] = []) {
  const doc = new Y.Doc({gc: true});
  const main = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(YExtension, {root: doc.get('root')}),
        YVersionsExtension,
        YHistoryExtension,
        configExtension(YAttributionExtension, {
          author: 'Alice',
          storage: doc.get('authors'),
        }),
      ],
      name: 'inline-review-base',
      nodes: [LinkNode, AutoLinkNode, MarkNode, ...baseNodes],
    }),
  );
  main.update(() => {
    $getRoot().append($createParagraphNode().append($createTextNode('hello')));
    initial?.();
  });
  const binding = getExtensionDependencyFromEditor(main, YExtension).output
    .binding;
  const versions = getExtensionDependencyFromEditor(
    main,
    YVersionsExtension,
  ).output;
  const history = getExtensionDependencyFromEditor(main, YHistoryExtension)
    .output.undoManager.value!;
  history.clear();
  const view = createYDocumentView(versions.capture(), true);
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(YExtension, {root: view.root}),
        configExtension(YSuggestionsExtension, {base: binding}),
        YHistoryExtension,
        YVersionsExtension,
        configExtension(YAttributionExtension, {
          author: 'Reviewer',
          storage: view.doc.get('authors'),
        }),
      ],
      name: 'inline-review-proposal',
      nodes: [LinkNode, AutoLinkNode, MarkNode],
    }),
  );
  const suggestions = getExtensionDependencyFromEditor(
    editor,
    YSuggestionsExtension,
  ).output;
  const proposalBinding = getExtensionDependencyFromEditor(editor, YExtension)
    .output.binding;
  onTestFinished(() => {
    editor.dispose();
    view.dispose();
    main.dispose();
    doc.destroy();
  });
  return {
    binding,
    doc,
    editor,
    history,
    main,
    proposalBinding,
    suggestions,
    versions,
    view,
  };
}

const text = (editor: LexicalEditor) =>
  editor.read('latest', () => $getRoot().getTextContent());
const links = (editor: LexicalEditor) =>
  editor.read('latest', () =>
    $texts($getRoot()).flatMap(node => {
      const parent = node.getParent();
      return $isLinkNode(parent)
        ? [{text: node.getTextContent(), url: parent.getURL()}]
        : [];
    }),
  );

test.each(['accept', 'reject'] as const)(
  'link wrapping %s is one review change and preserves concurrent base typing',
  action => {
    const {binding, editor, history, main, suggestions} = setup();
    editor.update(() => {
      $select(1, 4);
      $toggleLink('https://example.com', {target: '_blank'});
    });
    main.update(() => $select(2).insertText('!'));
    history.stopCapturing();
    expect(text(editor)).toBe('he!llo');
    expect(suggestions.getSuggestions()).toHaveLength(1);
    suggestions[action](suggestions.getSuggestions()[0].id);
    expect(text(main)).toBe('he!llo');
    expect(links(main)).toEqual(
      action === 'accept' ? [{text: 'e!ll', url: 'https://example.com'}] : [],
    );
    expect(suggestions.getSuggestions()).toHaveLength(0);
    expect(binding.error.value).toBeNull();
    if (action === 'accept') {
      history.undo();
      expect(text(main)).toBe('he!llo');
      expect(links(main)).toEqual([]);
      history.redo();
      expect(links(main)).toEqual([{text: 'e!ll', url: 'https://example.com'}]);
    }
  },
);

test.each(['accept', 'reject'] as const)(
  'unlink %s preserves concurrent base characters and removes all wrapper fields together',
  action => {
    const {binding, editor, main, suggestions} = setup(() => {
      $select(1, 4);
      $toggleLink('https://example.com');
    });
    editor.update(() => {
      $select(1, 4);
      $toggleLink(null);
    });
    main.update(() => $select(2).insertText('!'));
    expect(suggestions.getSuggestions()).toHaveLength(1);
    suggestions[action](suggestions.getSuggestions()[0].id);
    expect(text(main)).toBe('he!llo');
    expect(links(main)).toEqual(
      action === 'accept' ? [] : [{text: 'e!ll', url: 'https://example.com'}],
    );
    expect(suggestions.getSuggestions()).toHaveLength(0);
    expect(binding.error.value).toBeNull();
  },
);

test.each(['accept', 'reject'] as const)(
  'reviewing a text format %s keeps a concurrent independent format bit',
  action => {
    const {editor, main, suggestions} = setup();
    editor.update(() => $select(0, 5).formatText('bold'));
    main.update(() => $select(0, 5).formatText('italic'));
    expect(suggestions.getSuggestions()).toHaveLength(1);
    suggestions[action](suggestions.getSuggestions()[0].id);
    main.read('latest', () => {
      for (const node of $texts($getRoot())) {
        expect(node.hasFormat('bold')).toBe(action === 'accept');
        expect(node.hasFormat('italic')).toBe(true);
      }
    });
    expect(suggestions.getSuggestions()).toHaveLength(0);
  },
);

test.each(['accept', 'reject'] as const)(
  'reviewing one mark id with %s preserves a concurrent base mark id',
  action => {
    const {editor, main, suggestions} = setup();
    editor.update(() =>
      $wrapSelectionInMarkNode($select(1, 4), false, 'proposal'),
    );
    main.update(() => $wrapSelectionInMarkNode($select(1, 4), false, 'base'));
    expect(suggestions.getSuggestions()).toHaveLength(1);
    suggestions[action](suggestions.getSuggestions()[0].id);
    main.read('latest', () => {
      const marks = $texts($getRoot()).flatMap(node => {
        const parent = node.getParent();
        return $isMarkNode(parent) ? [parent.getIDs().sort()] : [];
      });
      expect(marks).toEqual([
        action === 'accept' ? ['base', 'proposal'] : ['base'],
      ]);
    });
    expect(text(main)).toBe('hello');
    expect(suggestions.getSuggestions()).toHaveLength(0);
  },
);

test.each(['accept', 'reject'] as const)(
  'reviewing a link URL with %s preserves concurrent target and text changes',
  action => {
    const {editor, main, suggestions} = setup(() => {
      $select(1, 4);
      $toggleLink('https://original.example');
    });
    editor.update(() => {
      const link = $texts($getRoot())[1].getParentOrThrow();
      if ($isLinkNode(link)) link.setURL('https://proposal.example');
    });
    main.update(() => {
      const link = $texts($getRoot())[1].getParentOrThrow();
      if ($isLinkNode(link)) link.setTarget('_blank');
      $select(2).insertText('!');
    });
    expect(suggestions.getSuggestions()).toHaveLength(1);
    suggestions[action](suggestions.getSuggestions()[0].id);
    main.read('latest', () => {
      const link = $texts($getRoot())[1].getParentOrThrow();
      expect($isLinkNode(link)).toBe(true);
      if ($isLinkNode(link)) {
        expect(link.getURL()).toBe(
          action === 'accept'
            ? 'https://proposal.example'
            : 'https://original.example',
        );
        expect(link.getTarget()).toBe('_blank');
        expect(link.getTextContent()).toBe('e!ll');
      }
    });
    expect(suggestions.getSuggestions()).toHaveLength(0);
  },
);

test('pending inline wrapper changes can be resumed and reviewed independently of text', () => {
  const {binding, editor, main, suggestions, view} = setup();
  editor.update(() => {
    $select(1, 4);
    $toggleLink('https://example.com');
  });
  editor.update(() => $select(5).insertText(' pending'));
  const doc = new Y.Doc({gc: false, isSuggestionDoc: true});
  Y.applyUpdate(doc, Y.encodeStateAsUpdate(view.doc));
  const resumed = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        configExtension(YExtension, {root: doc.get('root')}),
        configExtension(YSuggestionsExtension, {base: binding}),
      ],
      name: 'inline-review-resumed',
      nodes: [LinkNode, MarkNode, AutoLinkNode],
    }),
  );
  onTestFinished(() => {
    resumed.dispose();
    doc.destroy();
  });
  const review = getExtensionDependencyFromEditor(
    resumed,
    YSuggestionsExtension,
  ).output;
  expect(review.getSuggestions()).toEqual(suggestions.getSuggestions());
  expect(review.getSuggestions()).toHaveLength(2);
  review.accept(
    review.getSuggestions().find(change => change.kind === 'format')!.id,
  );
  expect(text(main)).toBe('hello');
  expect(links(main)).toEqual([{text: 'ell', url: 'https://example.com'}]);
  expect(text(resumed)).toBe('hello pending');
  expect(review.getSuggestions()).toHaveLength(1);
  review.reject(review.getSuggestions()[0].id);
  expect(text(resumed)).toBe('hello');
  expect(links(resumed)).toEqual(links(main));
});

test.each(['accept', 'reject'] as const)(
  'reviewing known text with %s preserves opaque tree content and checkpoint metadata',
  action => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    onTestFinished(() => warning.mockRestore());
    const state = createState('private-metadata', {
      parse: (value: unknown) => value,
    });
    const {binding, editor, main, proposalBinding, suggestions, versions} =
      setup(() => {
        const node = $create(ReviewCalloutNode).append(
          $createParagraphNode().append($createTextNode('private content')),
        );
        $setState(node, state, {nested: ['preserve', 'all']});
        $getRoot().append(node);
      }, [ReviewCalloutNode]);
    expect(
      editor.read('latest', () => $getRoot().getLastChildOrThrow().getType()),
    ).toBe('@lexical/y/opaque');
    editor.update(() => $select(5).insertText(' reviewed'));
    expect(suggestions.getSuggestions()).toHaveLength(1);
    suggestions[action](suggestions.getSuggestions()[0].id);
    expect(text(main)).toBe(
      (action === 'accept' ? 'hello reviewed' : 'hello') +
        '\n\nprivate content',
    );
    main.read('latest', () =>
      expect($getState($getRoot().getLastChildOrThrow(), state)).toEqual({
        nested: ['preserve', 'all'],
      }),
    );
    const checkpoint = createYDocumentView(versions.capture());
    const reader = buildEditorFromExtensions(
      defineExtension({
        dependencies: [configExtension(YExtension, {root: checkpoint.root})],
        name: 'opaque-review-checkpoint',
        nodes: [ReviewCalloutNode],
      }),
    );
    onTestFinished(() => {
      reader.dispose();
      checkpoint.dispose();
    });
    expect(text(reader)).toBe(text(main));
    reader.read('latest', () =>
      expect($getState($getRoot().getLastChildOrThrow(), state)).toEqual({
        nested: ['preserve', 'all'],
      }),
    );
    expect(binding.error.value).toBeNull();
    expect(proposalBinding.error.value).toBeNull();
  },
);

test('reviewed wrapper shared state retains its storage, attribution and checkpoint contents', () => {
  const {
    binding,
    doc,
    editor,
    history,
    main,
    proposalBinding,
    suggestions,
    versions,
  } = setup();
  const state = createState('link-shared', {
    parse: (value: unknown) => (value instanceof Y.Node ? value : null),
  });
  const shared = new Y.Node();
  shared.insert(0, 'link metadata');
  const before = versions.capture();
  editor.update(() => {
    $select(1, 4);
    $toggleLink('https://example.com');
    const link = $texts($getRoot())[1].getParentOrThrow();
    expect($isLinkNode(link)).toBe(true);
    $setState(link, state, shared);
  });
  editor.update(() => $select(5).insertText(' pending'));
  expect(suggestions.getSuggestions()).toHaveLength(2);
  const wrapper = suggestions
    .getSuggestions()
    .find(change => change.kind === 'structure')!;
  expect(wrapper).toBeDefined();
  suggestions.accept(wrapper.id);
  expect(text(main)).toBe('hello');
  const value = main.read('latest', () =>
    $getState($texts($getRoot())[1].getParentOrThrow(), state),
  )!;
  expect(value.toString()).toBe('link metadata');
  const attribution = getExtensionDependencyFromEditor(
    main,
    YAttributionExtension,
  ).output;
  expect(JSON.stringify(attribution.getDelta())).toContain('Reviewer');
  expect(() => binding.releaseSharedType(value)).toThrow('references');
  expect(suggestions.getSuggestions()).toHaveLength(1);
  history.undo();
  expect(links(main)).toEqual([]);
  history.redo();
  expect(links(main)).toEqual([{text: 'ell', url: 'https://example.com'}]);
  const after = versions.capture();
  const comparison = compareYCheckpoints(before, after);
  onTestFinished(() => comparison.dispose());
  expect(JSON.stringify(comparison.getDelta())).toContain('inline:link');
  const restored = new Y.Doc();
  Y.applyUpdate(restored, Y.encodeStateAsUpdate(doc));
  const reader = buildEditorFromExtensions(
    defineExtension({
      dependencies: [configExtension(YExtension, {root: restored.get('root')})],
      name: 'inline-review-reload',
      nodes: [LinkNode, MarkNode, AutoLinkNode],
    }),
  );
  onTestFinished(() => {
    reader.dispose();
    restored.destroy();
  });
  expect(links(reader)).toEqual(links(main));
  reader.read('latest', () =>
    expect(
      $getState($texts($getRoot())[1].getParentOrThrow(), state)!.toString(),
    ).toBe('link metadata'),
  );
  const retained = main.read('latest', () =>
    $getState($texts($getRoot())[1].getParentOrThrow(), state),
  )!;
  main.update(() => {
    $select(1, 4);
    $toggleLink(null);
  });
  binding.releaseSharedType(retained);
  history.clear();
  Y.gcIdSet(doc, Y.createDeleteSetFromStructStore(doc.store));
  expect(links(main)).toEqual([]);
  const checkpoint = createYDocumentView(after);
  const historical = buildEditorFromExtensions(
    defineExtension({
      dependencies: [configExtension(YExtension, {root: checkpoint.root})],
      name: 'inline-review-historical',
      nodes: [LinkNode, MarkNode, AutoLinkNode],
    }),
  );
  onTestFinished(() => {
    historical.dispose();
    checkpoint.dispose();
  });
  expect(links(historical)).toEqual([
    {text: 'ell', url: 'https://example.com'},
  ]);
  historical.read('latest', () =>
    expect(
      $getState($texts($getRoot())[1].getParentOrThrow(), state)!.toString(),
    ).toBe('link metadata'),
  );
  expect(binding.error.value).toBeNull();
  expect(proposalBinding.error.value).toBeNull();
});
