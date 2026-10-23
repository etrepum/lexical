/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {buildEditorFromExtensions} from '@lexical/extension';
import {$createLinkNode, LinkNode} from '@lexical/link';
import {$createMarkNode, MarkNode} from '@lexical/mark';
import {RichTextExtension} from '@lexical/rich-text';
import {YExtension} from '@lexical/y';
import * as Y from '@y/y';
import {
  $create,
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getDocument,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  configExtension,
  defineExtension,
  ElementNode,
  type LexicalEditor,
  type ParagraphNode,
  type TextNode,
} from 'lexical';
import {expect, onTestFinished, test, vi} from 'vitest';
import {userEvent} from 'vitest/browser';

class WidgetNode extends ElementNode {
  $config() {
    return this.config('browser-only-widget', {extends: ElementNode});
  }

  createDOM(): HTMLElement {
    return $getDocument().createElement('section');
  }

  updateDOM(): boolean {
    return false;
  }
}

function create(doc: Y.Doc, supportsWidget = false) {
  const root = document.createElement('div');
  root.contentEditable = 'true';
  root.style.whiteSpace = 'pre-wrap';
  document.body.append(root);
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        RichTextExtension,
        configExtension(YExtension, {root: doc.get('root')}),
      ],
      name: 'inline-collaboration-browser',
      nodes: [LinkNode, MarkNode, ...(supportsWidget ? [WidgetNode] : [])],
    }),
  );
  editor.setRootElement(root);
  onTestFinished(() => {
    editor.dispose();
    root.remove();
    doc.destroy();
  });
  return {doc, editor, root};
}

function copy(from: Y.Doc, to: Y.Doc) {
  Y.applyUpdate(to, Y.encodeStateAsUpdate(from));
}

function text(editor: LexicalEditor) {
  return editor.read('latest', () => $getRoot().getTextContent());
}

// Runs in the configured Chromium/Firefox/WebKit browser matrix.
test.each(['link', 'mark'] as const)(
  'remote %s projection preserves a typing peer’s native caret and text DOM',
  async kind => {
    const a = create(new Y.Doc());
    a.editor.update(
      () =>
        $getRoot().append(
          $createParagraphNode().append($createTextNode('abcdef')),
        ),
      {discrete: true},
    );
    const doc = new Y.Doc();
    copy(a.doc, doc);
    const b = create(doc);
    b.root.focus();
    b.editor.update(
      () => ($getRoot().getFirstDescendant() as TextNode).select(3, 3),
      {discrete: true},
    );
    // Keep these edits offline: the wrapper must merge with actual browser
    // input, including the native caret left after that input.
    a.editor.update(
      () => {
        const node = $getRoot().getFirstDescendant() as TextNode;
        const wrapper =
          kind === 'link'
            ? $createLinkNode('https://example.com')
            : $createMarkNode(['comment']);
        node.insertBefore(wrapper);
        wrapper.append(node);
      },
      {discrete: true},
    );
    await userEvent.keyboard('!');
    expect(text(b.editor)).toBe('abc!def');
    const caretKey = b.editor.read('latest', () => {
      const selection = $getSelection();
      return $isRangeSelection(selection) ? selection.anchor.key : null;
    });
    const caretDOM = document.getSelection()!.anchorNode;
    expect(caretKey).not.toBeNull();
    expect(caretDOM!.nodeType).toBe(Node.TEXT_NODE);
    copy(a.doc, b.doc);
    const selector = kind === 'link' ? 'a' : 'mark';
    await expect
      .poll(() => b.root.querySelector(selector)?.textContent)
      .toBe('abc!def');
    expect(document.activeElement).toBe(b.root);
    expect(document.getSelection()!.anchorNode).toBe(caretDOM);
    expect(document.getSelection()!.anchorOffset).toBe(4);
    b.editor.read('latest', () => {
      const selection = $getSelection();
      expect($isRangeSelection(selection) && selection.anchor.key).toBe(
        caretKey,
      );
    });
    await userEvent.keyboard('?');
    copy(b.doc, a.doc);
    copy(a.doc, b.doc);
    expect(text(a.editor)).toBe('abc!?def');
    expect(text(b.editor)).toBe('abc!?def');
    expect(a.root.querySelectorAll(selector)).toHaveLength(1);
    expect(b.root.querySelectorAll(selector)).toHaveLength(1);
    expect(a.root.querySelector(selector)!.textContent).toBe('abc!?def');
  },
);

test('typing after a linked line break remains at its DOM boundary after remote edits', async () => {
  const a = create(new Y.Doc());
  a.editor.update(
    () =>
      $getRoot().append(
        $createParagraphNode().append(
          $createLinkNode('https://example.com').append(
            $createTextNode('hello'),
            $createLineBreakNode(),
            $createTextNode('world'),
          ),
        ),
      ),
    {discrete: true},
  );
  const doc = new Y.Doc();
  copy(a.doc, doc);
  const b = create(doc);
  b.root.focus();
  b.editor.update(
    () =>
      $getRoot()
        .getFirstChildOrThrow<ParagraphNode>()
        .getFirstChildOrThrow<LinkNode>()
        .select(2, 2),
    {discrete: true},
  );
  const linkDOM = b.root.querySelector('a')!;
  const breakDOM = linkDOM.querySelector('br')!;
  a.editor.update(
    () => ($getRoot().getFirstDescendant() as TextNode).spliceText(0, 0, 'X'),
    {discrete: true},
  );
  copy(a.doc, b.doc);
  expect(b.root.querySelector('a')).toBe(linkDOM);
  expect(linkDOM.querySelector('br')).toBe(breakDOM);
  expect(document.getSelection()!.isCollapsed).toBe(true);
  expect(b.root.contains(document.getSelection()!.anchorNode)).toBe(true);
  await userEvent.keyboard('!');
  copy(b.doc, a.doc);
  expect(text(a.editor)).toBe('Xhello\n!world');
  expect(text(b.editor)).toBe('Xhello\n!world');
  expect(a.root.querySelectorAll('a br')).toHaveLength(1);
  expect(b.root.querySelectorAll('a br')).toHaveLength(1);
});

test('unsupported content renders an isolated label while adjacent content stays editable', async () => {
  const writer = create(new Y.Doc(), true);
  writer.editor.update(
    () =>
      $getRoot().append(
        $createParagraphNode().append($createTextNode('editable')),
        $create(WidgetNode).append(
          $createParagraphNode().append($createTextNode('private payload')),
        ),
      ),
    {discrete: true},
  );
  const reader = create(new Y.Doc());
  const warn = vi.spyOn(reader.editor, '_onWarn').mockImplementation(() => {});
  onTestFinished(() => warn.mockRestore());
  copy(writer.doc, reader.doc);
  const placeholder = reader.root.querySelector<HTMLElement>(
    '[contenteditable="false"]',
  )!;
  expect(placeholder).not.toBeNull();
  expect(placeholder.textContent).toBe(
    'Unsupported content (browser-only-widget)',
  );
  expect(placeholder.isContentEditable).toBe(false);
  expect(reader.root.querySelector('p')!.isContentEditable).toBe(true);
  reader.root.focus();
  reader.editor.update(
    () => ($getRoot().getFirstDescendant() as TextNode).selectEnd(),
    {discrete: true},
  );
  await userEvent.keyboard('!');
  copy(reader.doc, writer.doc);
  expect(writer.root.querySelector('p')!.textContent).toBe('editable!');
  expect(writer.root.querySelector('section')!.textContent).toBe(
    'private payload',
  );
  writer.editor.update(
    () =>
      ($getRoot().getLastDescendant() as TextNode).spliceText(0, 0, 'remote '),
    {discrete: true},
  );
  copy(writer.doc, reader.doc);
  expect(reader.root.querySelector('[contenteditable="false"]')).toBe(
    placeholder,
  );
  await userEvent.keyboard('?');
  copy(reader.doc, writer.doc);
  expect(writer.root.querySelector('p')!.textContent).toBe('editable!?');
  expect(writer.root.querySelector('section')!.textContent).toBe(
    'remote private payload',
  );
});
