/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$isCodeNode} from '@lexical/code-core';
import {ComarkExtension} from '@lexical/comark';
import {
  buildEditorFromExtensions,
  getExtensionDependencyFromEditor,
  type LexicalExtensionDependency,
} from '@lexical/extension';
import {$isLinkNode} from '@lexical/link';
import {$isListItemNode, $isListNode} from '@lexical/list';
import {$isHeadingNode, $isQuoteNode} from '@lexical/rich-text';
import {
  $getRoot,
  $isElementNode,
  $isTextNode,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical';
import {describe, expect, test} from 'vitest';

type ComarkOutput = LexicalExtensionDependency<
  typeof ComarkExtension
>['output'];

function comarkOf(editor: LexicalEditor): ComarkOutput {
  return getExtensionDependencyFromEditor(editor, ComarkExtension).output;
}

/** Parse markdown and apply it inside an editor.update, the race-free way. */
async function importMarkdown(
  editor: LexicalEditor,
  markdown: string,
): Promise<void> {
  const $apply = await comarkOf(editor).parseMarkdown(markdown);
  editor.update(() => $apply(), {discrete: true});
}

/** Import markdown, then read a value from the resulting editor state. */
async function importAndRead<T>(markdown: string, read: () => T): Promise<T> {
  using editor = buildEditorFromExtensions([ComarkExtension]);
  await importMarkdown(editor, markdown);
  return editor.read(read);
}

/** Assert that markdown survives an import → export round-trip unchanged. */
async function expectRoundTrip(markdown: string): Promise<void> {
  using editor = buildEditorFromExtensions([ComarkExtension]);
  await importMarkdown(editor, markdown);
  expect(await comarkOf(editor).renderMarkdown()).toBe(markdown);
}

describe('ComarkExtension import', () => {
  test('heading levels', async () => {
    for (let level = 1; level <= 6; level++) {
      const tag = await importAndRead('#'.repeat(level) + ' Title', () => {
        const node = $getRoot().getFirstChild();
        return $isHeadingNode(node) ? node.getTag() : null;
      });
      expect(tag).toBe(`h${level}`);
    }
  });

  test('paragraph with inline formats', async () => {
    const formats = await importAndRead(
      'a **bold** *italic* `code` ~~strike~~',
      () => {
        const paragraph = $getRoot().getFirstChild();
        if (!$isElementNode(paragraph)) {
          return [];
        }
        return paragraph
          .getChildren()
          .filter($isTextNode)
          .map(t => [
            t.getTextContent(),
            t.hasFormat('bold'),
            t.hasFormat('italic'),
            t.hasFormat('code'),
            t.hasFormat('strikethrough'),
          ]);
      },
    );
    expect(formats).toContainEqual(['bold', true, false, false, false]);
    expect(formats).toContainEqual(['italic', false, true, false, false]);
    expect(formats).toContainEqual(['code', false, false, true, false]);
    expect(formats).toContainEqual(['strike', false, false, false, true]);
  });

  test('nested bold + italic', async () => {
    const node = await importAndRead('***both***', () => {
      const paragraph = $getRoot().getFirstChild();
      const child = $isElementNode(paragraph)
        ? paragraph.getFirstChild()
        : null;
      return $isTextNode(child)
        ? {
            bold: child.hasFormat('bold'),
            italic: child.hasFormat('italic'),
            text: child.getTextContent(),
          }
        : null;
    });
    expect(node).toEqual({bold: true, italic: true, text: 'both'});
  });

  test('link with title', async () => {
    const link = await importAndRead(
      '[text](https://x.com "the title")',
      () => {
        const paragraph = $getRoot().getFirstChild();
        const child = $isElementNode(paragraph)
          ? paragraph.getFirstChild()
          : null;
        return $isLinkNode(child)
          ? {
              text: child.getTextContent(),
              title: child.getTitle(),
              url: child.getURL(),
            }
          : null;
      },
    );
    expect(link).toEqual({
      text: 'text',
      title: 'the title',
      url: 'https://x.com',
    });
  });

  test('blockquote', async () => {
    const result = await importAndRead('> quoted **text**', () => {
      const node = $getRoot().getFirstChild();
      return {isQuote: $isQuoteNode(node), text: node?.getTextContent()};
    });
    expect(result).toEqual({isQuote: true, text: 'quoted text'});
  });

  test('unordered list', async () => {
    const result = await importAndRead('- one\n- two', () => {
      const list = $getRoot().getFirstChild();
      return $isListNode(list)
        ? {size: list.getChildrenSize(), type: list.getListType()}
        : null;
    });
    expect(result).toEqual({size: 2, type: 'bullet'});
  });

  test('ordered list with start', async () => {
    const result = await importAndRead('3. three\n4. four', () => {
      const list = $getRoot().getFirstChild();
      return $isListNode(list)
        ? {start: list.getStart(), type: list.getListType()}
        : null;
    });
    expect(result).toEqual({start: 3, type: 'number'});
  });

  test('check list with checked state', async () => {
    const result = await importAndRead('- [ ] todo\n- [x] done', () => {
      const list = $getRoot().getFirstChild();
      if (!$isListNode(list)) {
        return null;
      }
      return list.getChildren().map(item => ({
        checked: $isListItemNode(item) ? item.getChecked() : undefined,
        text: item.getTextContent(),
      }));
    });
    expect(result).toEqual([
      {checked: false, text: 'todo'},
      {checked: true, text: 'done'},
    ]);
  });

  test('nested list', async () => {
    const depth = await importAndRead('- a\n    - b\n        - c', () => {
      // Walk down nested ListNode chains counting levels.
      let levels = 0;
      let current: LexicalNode | null = $getRoot().getFirstChild();
      while ($isListNode(current)) {
        levels++;
        let nested: LexicalNode | null = null;
        for (const item of current.getChildren()) {
          const first = $isElementNode(item) ? item.getFirstChild() : null;
          if ($isListNode(first)) {
            nested = first;
            break;
          }
        }
        current = nested;
      }
      return levels;
    });
    expect(depth).toBe(3);
  });

  test('code block with language', async () => {
    const result = await importAndRead('```python\nx = 1\n```', () => {
      const node = $getRoot().getFirstChild();
      return $isCodeNode(node)
        ? {language: node.getLanguage(), text: node.getTextContent()}
        : null;
    });
    expect(result).toEqual({language: 'python', text: 'x = 1'});
  });

  test('multiple paragraphs', async () => {
    const count = await importAndRead('para one\n\npara two', () =>
      $getRoot().getChildrenSize(),
    );
    expect(count).toBe(2);
  });
});

describe('ComarkExtension export', () => {
  test('round-trips headings and inline', () =>
    expectRoundTrip('## Title\n\nHello **bold** and *italic*'));

  test('round-trips strikethrough and inline code', () =>
    expectRoundTrip('a ~~b~~ and `c`'));

  test('round-trips nested bold italic', () => expectRoundTrip('***both***'));

  test('round-trips a blockquote', () => expectRoundTrip('> a quote'));

  test('round-trips an unordered list', () =>
    expectRoundTrip('- one\n- two\n- three'));

  test('round-trips an ordered list', () => expectRoundTrip('1. one\n2. two'));

  test('round-trips a nested list', () =>
    // comark serializes nested bullets with a two-space indent.
    expectRoundTrip('- a\n- b\n  - c'));

  test('round-trips a check list', () =>
    expectRoundTrip('- [x] done\n- [ ] todo'));

  test('round-trips a code block', () =>
    expectRoundTrip('```js\nconst x = 1;\n```'));

  test('round-trips a link', () => expectRoundTrip('[text](https://x.com)'));

  test('round-trips multiple paragraphs', () =>
    expectRoundTrip('first paragraph\n\nsecond paragraph'));

  test('$generateComarkTreeFromNodes returns comark tuples', async () => {
    using editor = buildEditorFromExtensions([ComarkExtension]);
    await importMarkdown(editor, '# Hi');
    const tree = editor.read(() =>
      comarkOf(editor).$generateComarkTreeFromNodes(),
    );
    expect(tree.nodes).toEqual([['h1', {}, 'Hi']]);
  });
});

describe('ComarkExtension frontmatter', () => {
  test('parses frontmatter without emitting nodes for it', async () => {
    const count = await importAndRead('---\ntitle: Hi\n---\n\n# Body', () =>
      $getRoot().getChildrenSize(),
    );
    expect(count).toBe(1);
  });

  test('exports frontmatter when provided', async () => {
    using editor = buildEditorFromExtensions([ComarkExtension]);
    await importMarkdown(editor, '# Body');
    const out = await comarkOf(editor).renderMarkdown({
      frontmatter: {title: 'Hi'},
    });
    expect(out).toBe('---\ntitle: Hi\n---\n\n# Body');
  });
});
