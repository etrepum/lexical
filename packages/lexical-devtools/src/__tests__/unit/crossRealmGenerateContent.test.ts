/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// esbuild refuses to load under jsdom, and the tree printout needs no DOM.
// @vitest-environment node

import {buildEditorFromExtensions, defineExtension} from '@lexical/extension';
import {$createLinkNode, LinkNode} from '@lexical/link';
import {$createMarkNode, MarkNode} from '@lexical/mark';
import {
  $createTableNodeWithDimensions,
  $createTableSelection,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '@lexical/table';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $setSelection,
  $setSlot,
  DecoratorNode,
  ElementNode,
  TextNode,
} from 'lexical';
import {describe, expect, test} from 'vitest';

import {loadExtensionRealm} from '../utils/loadExtensionRealm';

// A block decorator that hosts a slot, and the shadow-root element that fills
// it (never mounted, so neither renders).
class FigureNode extends DecoratorNode<null> {
  $config() {
    return this.config('figure', {extends: DecoratorNode});
  }
  createDOM(): HTMLElement {
    throw new Error('not rendered');
  }
  decorate(): null {
    return null;
  }
  isInline(): false {
    return false;
  }
}

class FigureMediaNode extends ElementNode {
  $config() {
    return this.config('figure_media', {extends: ElementNode});
  }
  isShadowRoot(): boolean {
    return true;
  }
}

describe('generateContent from the extension realm', () => {
  test('matches the page realm for links, marks, paragraphs and slots', async () => {
    using editor = buildEditorFromExtensions(
      defineExtension({
        $initialEditorState: () => {
          const paragraph = $createParagraphNode().setTextFormat(1);
          paragraph.append(
            $createTextNode('see '),
            $createLinkNode('https://lexical.dev', {title: 'docs'}).append(
              $createTextNode('docs'),
            ),
            $createMarkNode(['comment-1']).append($createTextNode('marked')),
          );
          const host = new FigureNode();
          const media = new FigureMediaNode();
          media.append($createParagraphNode().append($createTextNode('Eq')));
          $getRoot().append(paragraph, host);
          $setSlot(host, 'media', media);
        },
        name: '[cross-realm-generate-content]',
        nodes: [LinkNode, MarkNode, FigureNode, FigureMediaNode],
      }),
    );
    editor.read(() => {});

    const {generateContent} = await import('@lexical/devtools-core');
    const pageTree = generateContent(editor, [], false);
    expect(pageTree).toContain('"https://lexical.dev"');
    expect(pageTree).toContain('ids: [ comment-1 ]');
    expect(pageTree).toContain('[slot: media]');

    const {core, shim} = await loadExtensionRealm();
    // Guard against the test silently sharing one copy of Lexical.
    expect(shim.TextNode).not.toBe(TextNode);
    expect(
      shim.readEditorState(editor, editor.getEditorState(), () =>
        core.generateContent(editor, [], false),
      ),
    ).toBe(pageTree);
  });

  test('prints a table selection', async () => {
    using editor = buildEditorFromExtensions(
      defineExtension({
        $initialEditorState: () => {
          const table = $createTableNodeWithDimensions(1, 2, false);
          $getRoot().append(table);
          const [first, last] = table
            .getFirstChildOrThrow<TableRowNode>()
            .getChildren();
          const selection = $createTableSelection();
          selection.set(table.getKey(), first.getKey(), last.getKey());
          $setSelection(selection);
        },
        name: '[cross-realm-table-selection]',
        nodes: [TableNode, TableRowNode, TableCellNode],
      }),
    );
    editor.read(() => {});

    const {generateContent} = await import('@lexical/devtools-core');
    const pageTree = generateContent(editor, [], false);
    expect(pageTree).toContain('selection: table');

    const {core, shim} = await loadExtensionRealm();
    expect(
      shim.readEditorState(editor, editor.getEditorState(), () =>
        core.generateContent(editor, [], false),
      ),
    ).toBe(pageTree);
  });
});
