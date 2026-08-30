/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {buildEditorFromExtensions, defineExtension} from '@lexical/extension';
import {RichTextExtension} from '@lexical/rich-text';
import {$createTableNodeWithDimensions, TableExtension} from '@lexical/table';
import {
  $create,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  ElementNode,
  type LexicalEditor,
} from 'lexical';
import {assert, expect, onTestFinished, test} from 'vitest';
import {userEvent} from 'vitest/browser';

// Regression tests for #7999.
//
// With a table as the last node of the document, the caret used to cycle
// around it: right arrow out of the last cell reached the block cursor
// beneath the table, the next right arrow jumped back to the root offset
// *before* the table (where Enter inserts a paragraph above it), and the one
// after that dropped back into the last cell.
//
// Nothing in the Lexical model moves on that second key press - the native
// caret walks around the block cursor element and the selectionchange
// listener imports the result - so this only reproduces in a real browser.
// See the `browser` project in vitest.config.mts.

// A minimal shadow root, standing in for the shadow-root blocks that wrap
// content in real editors (collapsible sections, layout columns, cards, ...).
// A table at the edge of one of these is not at the edge of the document, so
// the caret has to be able to leave it.
class PlainShadowRootNode extends ElementNode {
  $config() {
    return this.config('plain_shadow_root_trailing_caret', {
      extends: ElementNode,
    });
  }
  createDOM(): HTMLElement {
    return document.createElement('div');
  }
  updateDOM(): boolean {
    return false;
  }
  isShadowRoot(): boolean {
    return true;
  }
}

function $createShadowRootEndingInATable(): PlainShadowRootNode {
  return $create(PlainShadowRootNode).append(
    $createParagraphNode().append($createTextNode('inside')),
    $createTableNodeWithDimensions(2, 2, false),
  );
}

function $selectEndOfTableInShadowRoot(): void {
  $getRoot()
    .getFirstChildOrThrow<PlainShadowRootNode>()
    .getLastChildOrThrow<ElementNode>()
    .selectEnd();
}

function mount($initialEditorState: () => void): {
  editor: LexicalEditor;
  contentEditable: HTMLElement;
} {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const contentEditable = document.createElement('div');
  contentEditable.contentEditable = 'true';
  container.appendChild(contentEditable);
  const editor = buildEditorFromExtensions(
    defineExtension({
      $initialEditorState,
      dependencies: [RichTextExtension, TableExtension],
      name: 'issue-7999',
      nodes: [PlainShadowRootNode],
      onError: (error: Error) => {
        throw error;
      },
    }),
  );
  editor.setRootElement(contentEditable);
  onTestFinished(() => {
    editor.setRootElement(null);
    document.body.removeChild(container);
  });
  contentEditable.focus();
  return {contentEditable, editor};
}

function expectCaretAfterTable(editor: LexicalEditor): void {
  editor.read(() => {
    const selection = $getSelection();
    assert($isRangeSelection(selection), 'Expected RangeSelection');
    expect(selection.isCollapsed()).toBe(true);
    expect(selection.anchor.type).toBe('element');
    expect(selection.anchor.key).toBe($getRoot().getKey());
    expect(selection.anchor.offset).toBe($getRoot().getChildrenSize());
  });
}

test('the caret stops beneath a trailing table instead of cycling around it', async () => {
  const {editor} = mount(() => {
    $getRoot()
      .clear()
      .append($createTableNodeWithDimensions(2, 2, false));
  });
  editor.update(() => $getRoot().getLastChildOrThrow().selectEnd(), {
    discrete: true,
  });

  // Leaves the last cell and lands on the block cursor beneath the table.
  await userEvent.keyboard('{ArrowRight}');
  expectCaretAfterTable(editor);

  // Further presses have nowhere to go and must leave the caret alone.
  await userEvent.keyboard('{ArrowRight}');
  expectCaretAfterTable(editor);
  await userEvent.keyboard('{ArrowRight}');
  expectCaretAfterTable(editor);

  // Enter at that caret adds the paragraph after the table, not before it.
  await userEvent.keyboard('{Enter}');
  expect(
    editor.read(() =>
      $getRoot()
        .getChildren()
        .map(node => node.getType()),
    ),
  ).toEqual(['table', 'paragraph']);
});

test('the caret still moves past a table that is followed by a paragraph', async () => {
  const {editor} = mount(() => {
    $getRoot()
      .clear()
      .append(
        $createTableNodeWithDimensions(2, 2, false),
        $createParagraphNode().append($createTextNode('after')),
      );
  });
  editor.update(() => $getRoot().getFirstChildOrThrow().selectEnd(), {
    discrete: true,
  });

  await userEvent.keyboard('{ArrowRight}');
  await userEvent.keyboard('{ArrowRight}');

  editor.read(() => {
    const selection = $getSelection();
    assert($isRangeSelection(selection), 'Expected RangeSelection');
    expect(selection.anchor.getNode().getTextContent()).toBe('after');
  });
});

// The fix for #7999 lives in @lexical/rich-text, which prevents the default
// only when the block cursor really is at the edge of the *document*. A table
// that merely ends a shadow root is not, and @lexical/table registers its
// arrow handlers at COMMAND_PRIORITY_HIGH -- above rich text -- so a
// table-side guard that treats every shadow root as a dead end would trap the
// caret here.

test('the caret stops after a table that ends a shadow root at the end of the document', async () => {
  const editor = mount(() => {
    $getRoot().clear().append($createShadowRootEndingInATable());
  }).editor;
  editor.update($selectEndOfTableInShadowRoot, {discrete: true});

  const $expectCaretAfterTableInShadowRoot = () =>
    editor.read(() => {
      const selection = $getSelection();
      assert($isRangeSelection(selection), 'Expected RangeSelection');
      const shadowRoot = $getRoot().getFirstChildOrThrow<PlainShadowRootNode>();
      expect(selection.isCollapsed()).toBe(true);
      expect(selection.focus.key).toBe(shadowRoot.getKey());
      expect(selection.focus.offset).toBe(shadowRoot.getChildrenSize());
    });

  // Leaves the last cell and lands on the block cursor beneath the table.
  await userEvent.keyboard('{ArrowRight}');
  $expectCaretAfterTableInShadowRoot();

  // Nothing follows the shadow root either, so the caret stays put.
  await userEvent.keyboard('{ArrowRight}');
  $expectCaretAfterTableInShadowRoot();
  await userEvent.keyboard('{ArrowRight}');
  $expectCaretAfterTableInShadowRoot();
});

test('the caret leaves a shadow root that ends in a table when content follows it', async () => {
  const editor = mount(() => {
    $getRoot()
      .clear()
      .append(
        $createShadowRootEndingInATable(),
        $createParagraphNode().append($createTextNode('after')),
      );
  }).editor;
  editor.update($selectEndOfTableInShadowRoot, {discrete: true});

  // Out of the last cell, onto the block cursor beneath the table...
  await userEvent.keyboard('{ArrowRight}');
  editor.read(() => {
    const selection = $getSelection();
    assert($isRangeSelection(selection), 'Expected RangeSelection');
    expect(selection.focus.key).toBe(
      $getRoot().getFirstChildOrThrow().getKey(),
    );
  });

  // ...and then out of the shadow root entirely, into the paragraph after it.
  await userEvent.keyboard('{ArrowRight}');
  editor.read(() => {
    const selection = $getSelection();
    assert($isRangeSelection(selection), 'Expected RangeSelection');
    expect(selection.anchor.getNode().getTextContent()).toBe('after');
  });
});
