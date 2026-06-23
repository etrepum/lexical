/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$isCodeNode, CodeExtension} from '@lexical/code-core';
import {registerComarkShortcuts} from '@lexical/comark';
import {buildEditorFromExtensions} from '@lexical/extension';
import {$isLinkNode, LinkExtension} from '@lexical/link';
import {$isListItemNode, $isListNode, ListExtension} from '@lexical/list';
import {
  $isHeadingNode,
  $isQuoteNode,
  RichTextExtension,
} from '@lexical/rich-text';
import {
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  defineExtension,
  KEY_ENTER_COMMAND,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical';
import {describe, expect, test} from 'vitest';

const ComarkShortcutTestExtension = defineExtension({
  dependencies: [
    RichTextExtension,
    ListExtension,
    CodeExtension,
    LinkExtension,
  ],
  name: 'ComarkShortcutTest',
  register: editor => registerComarkShortcuts(editor),
});

function createEditor() {
  return buildEditorFromExtensions([ComarkShortcutTestExtension]);
}

/** Let comark's async inline detection + the follow-up update settle. */
async function flush(editor: LexicalEditor): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await Promise.resolve();
  }
  await new Promise(resolve => setTimeout(resolve, 0));
  editor.read(() => {});
}

/** Type text one character at a time, awaiting async shortcuts after each. */
async function type(editor: LexicalEditor, text: string): Promise<void> {
  editor.update(
    () => {
      const selection = $getSelection();
      if (!($isRangeSelection(selection) && selection.isCollapsed())) {
        $getRoot().selectEnd();
      }
    },
    {discrete: true},
  );
  for (const char of text) {
    editor.update(() => $getSelection()?.insertText(char), {discrete: true});
    await flush(editor);
  }
}

function firstBlock<T>(
  editor: LexicalEditor,
  read: (node: LexicalNode | null) => T,
): T {
  return editor.read(() => read($getRoot().getFirstChild()));
}

describe('registerComarkShortcuts block shortcuts', () => {
  test('# space creates a heading', async () => {
    using editor = createEditor();
    await type(editor, '# Title');
    expect(
      firstBlock(editor, node => ($isHeadingNode(node) ? node.getTag() : null)),
    ).toBe('h1');
    expect(firstBlock(editor, node => node?.getTextContent())).toBe('Title');
  });

  test('### space creates an h3', async () => {
    using editor = createEditor();
    await type(editor, '### Sub');
    expect(
      firstBlock(editor, node => ($isHeadingNode(node) ? node.getTag() : null)),
    ).toBe('h3');
  });

  test('> space creates a quote', async () => {
    using editor = createEditor();
    await type(editor, '> quote');
    expect(firstBlock(editor, node => $isQuoteNode(node))).toBe(true);
    expect(firstBlock(editor, node => node?.getTextContent())).toBe('quote');
  });

  test('- space creates a bullet list', async () => {
    using editor = createEditor();
    await type(editor, '- item');
    expect(
      firstBlock(editor, node =>
        $isListNode(node) ? node.getListType() : null,
      ),
    ).toBe('bullet');
    expect(firstBlock(editor, node => node?.getTextContent())).toBe('item');
  });

  test('1. space creates an ordered list', async () => {
    using editor = createEditor();
    await type(editor, '1. first');
    expect(
      firstBlock(editor, node =>
        $isListNode(node) ? node.getListType() : null,
      ),
    ).toBe('number');
  });

  test('[ ] space creates a check list item', async () => {
    using editor = createEditor();
    await type(editor, '[x] done');
    const result = firstBlock(editor, node => {
      if (!$isListNode(node)) {
        return null;
      }
      const item = node.getFirstChild();
      return {
        checked: $isListItemNode(item) ? item.getChecked() : undefined,
        type: node.getListType(),
      };
    });
    expect(result).toEqual({checked: true, type: 'check'});
  });

  test('``` then Enter creates a code block', async () => {
    using editor = createEditor();
    await type(editor, '```js');
    editor.dispatchCommand(KEY_ENTER_COMMAND, null);
    editor.read(() => {});
    expect(
      firstBlock(editor, node =>
        $isCodeNode(node) ? node.getLanguage() : null,
      ),
    ).toBe('js');
  });
});

describe('registerComarkShortcuts inline shortcuts', () => {
  /** Read the inline leaf children of the first block. */
  function inlineLeaves(editor: LexicalEditor) {
    return editor.read(() => {
      const block = $getRoot().getFirstChild();
      if (!$isElementNode(block)) {
        return [];
      }
      return block.getChildren().map(child => {
        if ($isTextNode(child)) {
          return {
            bold: child.hasFormat('bold'),
            code: child.hasFormat('code'),
            italic: child.hasFormat('italic'),
            strike: child.hasFormat('strikethrough'),
            text: child.getTextContent(),
            type: 'text',
          };
        }
        if ($isLinkNode(child)) {
          return {
            text: child.getTextContent(),
            type: 'link',
            url: child.getURL(),
          };
        }
        return {type: child.getType()};
      });
    });
  }

  test('**bold** applies bold', async () => {
    using editor = createEditor();
    await type(editor, '**bold**');
    expect(inlineLeaves(editor)).toEqual([
      {
        bold: true,
        code: false,
        italic: false,
        strike: false,
        text: 'bold',
        type: 'text',
      },
    ]);
  });

  test('*italic* applies italic', async () => {
    using editor = createEditor();
    await type(editor, '*italic*');
    expect(inlineLeaves(editor)).toEqual([
      {
        bold: false,
        code: false,
        italic: true,
        strike: false,
        text: 'italic',
        type: 'text',
      },
    ]);
  });

  test('***both*** applies bold and italic', async () => {
    using editor = createEditor();
    await type(editor, '***both***');
    expect(inlineLeaves(editor)).toEqual([
      {
        bold: true,
        code: false,
        italic: true,
        strike: false,
        text: 'both',
        type: 'text',
      },
    ]);
  });

  test('~~strike~~ applies strikethrough', async () => {
    using editor = createEditor();
    await type(editor, '~~gone~~');
    expect(inlineLeaves(editor)).toEqual([
      {
        bold: false,
        code: false,
        italic: false,
        strike: true,
        text: 'gone',
        type: 'text',
      },
    ]);
  });

  test('`code` applies inline code', async () => {
    using editor = createEditor();
    await type(editor, '`snippet`');
    expect(inlineLeaves(editor)).toEqual([
      {
        bold: false,
        code: true,
        italic: false,
        strike: false,
        text: 'snippet',
        type: 'text',
      },
    ]);
  });

  test('[text](url) creates a link', async () => {
    using editor = createEditor();
    await type(editor, '[site](https://x.com)');
    expect(inlineLeaves(editor)).toEqual([
      {text: 'site', type: 'link', url: 'https://x.com'},
    ]);
  });

  test('preserves text typed before an inline construct', async () => {
    using editor = createEditor();
    await type(editor, 'see **this**');
    const leaves = inlineLeaves(editor);
    expect(leaves[0]).toMatchObject({bold: false, text: 'see '});
    expect(leaves[leaves.length - 1]).toMatchObject({bold: true, text: 'this'});
  });

  test('does not transform incomplete syntax', async () => {
    using editor = createEditor();
    await type(editor, '**bold');
    expect(inlineLeaves(editor)).toEqual([
      {
        bold: false,
        code: false,
        italic: false,
        strike: false,
        text: '**bold',
        type: 'text',
      },
    ]);
  });
});
