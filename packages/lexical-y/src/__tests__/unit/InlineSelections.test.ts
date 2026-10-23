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
import {$createLinkNode, AutoLinkNode, LinkNode} from '@lexical/link';
import {$createMarkNode, MarkNode} from '@lexical/mark';
import {$getYSelection, $resolveYSelection, YExtension} from '@lexical/y';
import * as Y from '@y/y';
import {
  $create,
  $createLineBreakNode,
  $createNodeSelection,
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isLineBreakNode,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  configExtension,
  defineExtension,
  ElementNode,
  type LexicalNode,
  type ParagraphNode,
  type PointType,
  type TextNode,
} from 'lexical';
import {expect, onTestFinished, test} from 'vitest';

class StoredInlineNode extends ElementNode {
  $config() {
    return this.config('selection-stored-inline', {extends: ElementNode});
  }

  isInline(): boolean {
    return true;
  }
}

function create(doc = new Y.Doc()) {
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [configExtension(YExtension, {root: doc.get('root')})],
      name: 'inline-selection-regressions',
      nodes: [LinkNode, AutoLinkNode, MarkNode, StoredInlineNode],
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
  };
}

function copy(from: Y.Doc, to: Y.Doc) {
  Y.applyUpdate(to, Y.encodeStateAsUpdate(from));
}

const $paragraph = () => $getRoot().getFirstChildOrThrow<ParagraphNode>();
const $link = () => $paragraph().getChildAtIndex<LinkNode>(1)!;

function pair() {
  const a = create();
  a.editor.update(() => {
    $getRoot().append(
      $createParagraphNode().append(
        $createTextNode('a'),
        $createLinkNode('https://example.com').append(
          $createTextNode('b').toggleFormat('bold'),
          $createMarkNode(['review']).append(
            $createTextNode('c').toggleFormat('italic'),
          ),
          $createLineBreakNode(),
          $createTextNode('d'),
        ),
        $createTextNode('e'),
      ),
    );
  });
  const doc = new Y.Doc();
  copy(a.doc, doc);
  return {a, b: create(doc)};
}

/** Character offset within the paragraph, independent of wrapper splitting. */
function $offset(point: PointType): number {
  let node: LexicalNode = point.getNode();
  let offset =
    point.type === 'element' && $isElementNode(node)
      ? node
          .getChildren()
          .slice(0, point.offset)
          .reduce((sum, child) => sum + child.getTextContentSize(), 0)
      : point.offset;
  while (node.getParent() && node.getParent()!.getType() !== 'root') {
    for (const previous of node.getPreviousSiblings())
      offset += previous.getTextContentSize();
    node = node.getParentOrThrow();
  }
  return offset;
}

const boundaries = [
  ['paragraph before link', () => $paragraph(), 1, 1],
  ['paragraph after link', () => $paragraph(), 2, 5],
  ['link before nested mark', () => $link(), 1, 2],
  ['link after line break', () => $link(), 3, 4],
  ['mark end', () => $link().getChildAtIndex<MarkNode>(1)!, 1, 3],
] as const;

test.each(boundaries)(
  '%s element points survive remote edits within a flattened run',
  (_name, $node, childOffset, expected) => {
    const {a, b} = pair();
    b.editor.update(() => {
      const selection = $createRangeSelection();
      selection.anchor.set($node().getKey(), childOffset, 'element');
      selection.focus.set($node().getKey(), childOffset, 'element');
      $setSelection(selection);
    });
    const bookmark = b.editor.read('latest', () => $getYSelection(b.binding))!;
    expect(bookmark).not.toBeNull();
    a.editor.update(() =>
      $paragraph().getFirstChildOrThrow<TextNode>().spliceText(0, 0, 'X'),
    );
    copy(a.doc, b.doc);
    b.editor.read('latest', () => {
      const selection = $resolveYSelection(b.binding, bookmark);
      expect($isRangeSelection(selection)).toBe(true);
      if (!$isRangeSelection(selection)) return;
      expect($offset(selection.anchor)).toBe(expected + 1);
      expect($offset(selection.focus)).toBe(expected + 1);
      const current = $getSelection();
      expect($isRangeSelection(current)).toBe(true);
      if ($isRangeSelection(current))
        expect($offset(current.anchor)).toBe(expected + 1);
    });
  },
);

test('line-break positions resolve to valid parent element points', () => {
  const {a, b} = pair();
  a.editor.update(() => {
    const selection = $createRangeSelection();
    selection.anchor.set($link().getKey(), 2, 'element');
    selection.focus.set($link().getKey(), 3, 'element');
    $setSelection(selection);
  });
  const bookmark = a.editor.read('latest', () => $getYSelection(a.binding))!;
  b.editor.read('latest', () => {
    const selection = $resolveYSelection(b.binding, bookmark);
    expect($isRangeSelection(selection)).toBe(true);
    if (!$isRangeSelection(selection)) return;
    expect($offset(selection.anchor)).toBe(3);
    expect($offset(selection.focus)).toBe(4);
    expect(selection.focus.type).toBe('element');
    expect($isElementNode(selection.focus.getNode())).toBe(true);
    expect(selection.getTextContent()).toBe('\n');
  });
});

test('root boundaries count projected children rather than inline leaves', () => {
  const {a, b} = pair();
  a.editor.update(() => {
    $getRoot().append($createParagraphNode().append($createTextNode('last')));
    const selection = $createRangeSelection();
    selection.anchor.set('root', 1, 'element');
    selection.focus.set('root', 2, 'element');
    $setSelection(selection);
  });
  copy(a.doc, b.doc);
  const bookmark = a.editor.read('latest', () => $getYSelection(a.binding))!;
  b.editor.read('latest', () => {
    const selection = $resolveYSelection(b.binding, bookmark);
    expect($isRangeSelection(selection)).toBe(true);
    if (!$isRangeSelection(selection)) return;
    expect(selection.anchor).toMatchObject({key: 'root', offset: 1});
    expect(selection.focus).toMatchObject({key: 'root', offset: 2});
  });
});

test('node selections include line breaks and clear when their characters disappear', () => {
  const {a, b} = pair();
  b.editor.update(() => {
    const selection = $createNodeSelection();
    selection.add($link().getChildAtIndex(2)!.getKey());
    $setSelection(selection);
  });
  const bookmark = b.editor.read('latest', () => $getYSelection(b.binding))!;
  b.editor.read('latest', () => {
    const selection = $resolveYSelection(b.binding, bookmark);
    expect($isNodeSelection(selection)).toBe(true);
    expect(selection!.getNodes()).toHaveLength(1);
    expect($isLineBreakNode(selection!.getNodes()[0])).toBe(true);
  });
  a.editor.update(() => $link().getChildAtIndex(2)!.remove());
  copy(a.doc, b.doc);
  b.editor.read('latest', () =>
    expect($resolveYSelection(b.binding, bookmark)).toBeNull(),
  );
});

test('text node selection follows characters when a remote mark wraps them', () => {
  const {a, b} = pair();
  b.editor.update(() => {
    const selection = $createNodeSelection();
    selection.add($paragraph().getLastChildOrThrow().getKey());
    $setSelection(selection);
  });
  const bookmark = b.editor.read('latest', () => $getYSelection(b.binding))!;
  a.editor.update(() => {
    const text = $paragraph().getLastChildOrThrow();
    const mark = $createMarkNode(['second']);
    text.insertBefore(mark);
    mark.append(text);
  });
  copy(a.doc, b.doc);
  b.editor.read('latest', () => {
    const selection = $resolveYSelection(b.binding, bookmark);
    expect($isNodeSelection(selection)).toBe(true);
    expect(selection!.getNodes().map(node => node.getTextContent())).toEqual([
      'e',
    ]);
    expect(selection!.getNodes()[0].getParent()).toBeInstanceOf(MarkNode);
  });
});

test('removed inline content recovers a range at its surviving block boundary', () => {
  const {a, b} = pair();
  b.editor.update(() => {
    const selection = $createRangeSelection();
    selection.anchor.set($link().getKey(), 1, 'element');
    selection.focus.set($link().getKey(), 1, 'element');
    $setSelection(selection);
  });
  const bookmark = b.editor.read('latest', () => $getYSelection(b.binding))!;
  a.editor.update(() => $paragraph().clear());
  copy(a.doc, b.doc);
  b.editor.read('latest', () => {
    const selection = $resolveYSelection(b.binding, bookmark);
    expect($isRangeSelection(selection)).toBe(true);
    if (!$isRangeSelection(selection)) return;
    expect(selection.anchor).toMatchObject({
      key: $paragraph().getKey(),
      offset: 0,
      type: 'element',
    });
  });
});

test('deleted text node references do not select adjacent surviving characters', () => {
  const a = create();
  a.editor.update(() => {
    const selected = $createTextNode('deleted').toggleFormat('bold');
    $getRoot().append(
      $createParagraphNode().append(
        $createTextNode('before'),
        selected,
        $createTextNode('after'),
      ),
    );
    const selection = $createNodeSelection();
    selection.add(selected.getKey());
    $setSelection(selection);
  });
  const bookmark = a.editor.read('latest', () => $getYSelection(a.binding))!;
  a.editor.update(() => $paragraph().getChildAtIndex(1)!.remove());
  a.editor.read('latest', () =>
    expect($resolveYSelection(a.binding, bookmark)).toBeNull(),
  );
});

test('placement boundaries count wrappers instead of each projected text leaf', () => {
  const {a} = pair();
  a.editor.update(() => {
    $paragraph()
      .getLastChildOrThrow()
      .insertBefore(
        $create(StoredInlineNode).append($createTextNode('stored')),
      );
  });
  a.editor.read('latest', () => {
    const type = a.binding.mapping.types.get($paragraph().getKey())!;
    expect(type.length).toBe(3);
    const selection = $resolveYSelection(a.binding, {
      data: {
        anchor: Y.createRelativePositionFromTypeIndex(type, 1),
        focus: Y.createRelativePositionFromTypeIndex(type, 2),
        format: 0,
        style: '',
      },
      kind: 'range',
    });
    expect($isRangeSelection(selection)).toBe(true);
    if (!$isRangeSelection(selection)) return;
    expect(selection.anchor).toMatchObject({
      key: $paragraph().getKey(),
      offset: 2,
      type: 'element',
    });
    expect(selection.focus).toMatchObject({
      key: $paragraph().getKey(),
      offset: 3,
      type: 'element',
    });
    expect(selection.getTextContent()).toBe('stored');
  });
});
