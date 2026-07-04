/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$isCodeNode, CodeNode} from '@lexical/code-core';
import {createHeadlessEditor} from '@lexical/headless';
import {$isListNode, ListItemNode, ListNode} from '@lexical/list';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  QUOTE,
  SHADOW_ROOT_QUOTE,
  Transformer,
  TRANSFORMERS,
} from '@lexical/markdown';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
  QuoteNode,
} from '@lexical/rich-text';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isLineBreakNode,
  $isParagraphNode,
  LexicalEditor,
} from 'lexical';
import {assert, describe, expect, it} from 'vitest';

const SHADOW_ROOT_QUOTE_TRANSFORMERS: Transformer[] = TRANSFORMERS.map(
  transformer => (transformer === QUOTE ? SHADOW_ROOT_QUOTE : transformer),
);

function createEditor(): LexicalEditor {
  return createHeadlessEditor({
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode],
    onError: err => {
      throw err;
    },
  });
}

describe('SHADOW_ROOT_QUOTE markdown import', () => {
  it('imports a multi-paragraph blockquote as a shadow root quote', () => {
    const editor = createEditor();
    editor.update(
      () => {
        $convertFromMarkdownString(
          '> a\n>\n> b',
          SHADOW_ROOT_QUOTE_TRANSFORMERS,
        );
      },
      {discrete: true},
    );
    editor.read(() => {
      const quote = $getRoot().getFirstChild();
      assert($isQuoteNode(quote), 'expected QuoteNode');
      expect(quote.isShadowRoot()).toBe(true);
      const children = quote.getChildren();
      expect(children.length).toBe(2);
      expect(children.every($isParagraphNode)).toBe(true);
      expect(children.map(child => child.getTextContent())).toEqual(['a', 'b']);
    });
  });

  it('joins consecutive `> ` lines into one paragraph with a line break', () => {
    const editor = createEditor();
    editor.update(
      () => {
        $convertFromMarkdownString('> a\n> b', SHADOW_ROOT_QUOTE_TRANSFORMERS);
      },
      {discrete: true},
    );
    editor.read(() => {
      const quote = $getRoot().getFirstChild();
      assert($isQuoteNode(quote), 'expected QuoteNode');
      expect(quote.isShadowRoot()).toBe(true);
      const children = quote.getChildren();
      expect(children.length).toBe(1);
      const paragraph = children[0];
      assert($isParagraphNode(paragraph), 'expected ParagraphNode');
      expect(paragraph.getTextContent()).toBe('a\nb');
      expect(paragraph.getChildren().some($isLineBreakNode)).toBe(true);
    });
  });

  it('joins a lazy continuation line into the open paragraph', () => {
    const editor = createEditor();
    editor.update(
      () => {
        $convertFromMarkdownString('> a\nb', SHADOW_ROOT_QUOTE_TRANSFORMERS);
      },
      {discrete: true},
    );
    editor.read(() => {
      const root = $getRoot();
      expect(root.getChildrenSize()).toBe(1);
      const quote = root.getFirstChild();
      assert($isQuoteNode(quote), 'expected QuoteNode');
      expect(quote.getChildrenSize()).toBe(1);
      expect(quote.getTextContent()).toBe('a\nb');
    });
  });

  it('does not lazily continue past a `>` separator line', () => {
    const editor = createEditor();
    editor.update(
      () => {
        $convertFromMarkdownString('> a\n>\nb', SHADOW_ROOT_QUOTE_TRANSFORMERS);
      },
      {discrete: true},
    );
    editor.read(() => {
      const root = $getRoot();
      const quote = root.getFirstChild();
      assert($isQuoteNode(quote), 'expected QuoteNode');
      expect(quote.getTextContent()).toBe('a');
      const next = quote.getNextSibling();
      assert($isParagraphNode(next), 'expected ParagraphNode');
      expect(next.getTextContent()).toBe('b');
    });
  });

  it('imports nested block markers inside the quote', () => {
    const editor = createEditor();
    editor.update(
      () => {
        $convertFromMarkdownString(
          '> ## title\n>\n> body',
          SHADOW_ROOT_QUOTE_TRANSFORMERS,
        );
      },
      {discrete: true},
    );
    editor.read(() => {
      const quote = $getRoot().getFirstChild();
      assert($isQuoteNode(quote), 'expected QuoteNode');
      const [heading, body] = quote.getChildren();
      assert($isHeadingNode(heading), 'expected HeadingNode');
      expect(heading.getTag()).toBe('h2');
      expect(heading.getTextContent()).toBe('title');
      assert($isParagraphNode(body), 'expected ParagraphNode');
      expect(body.getTextContent()).toBe('body');
    });
  });

  it('imports nested quotes recursively', () => {
    const editor = createEditor();
    editor.update(
      () => {
        $convertFromMarkdownString(
          '> > inner\n>\n> after',
          SHADOW_ROOT_QUOTE_TRANSFORMERS,
        );
      },
      {discrete: true},
    );
    editor.read(() => {
      const quote = $getRoot().getFirstChild();
      assert($isQuoteNode(quote), 'expected QuoteNode');
      const [inner, after] = quote.getChildren();
      assert($isQuoteNode(inner), 'expected nested QuoteNode');
      expect(inner.isShadowRoot()).toBe(true);
      expect(inner.getChildren().every($isParagraphNode)).toBe(true);
      expect(inner.getTextContent()).toBe('inner');
      assert($isParagraphNode(after), 'expected ParagraphNode');
      expect(after.getTextContent()).toBe('after');
    });
  });

  it('imports lists and code fences inside the quote', () => {
    const editor = createEditor();
    editor.update(
      () => {
        $convertFromMarkdownString(
          '> - a\n> - b\n>\n> ```js\n> const x = 1\n> ```',
          SHADOW_ROOT_QUOTE_TRANSFORMERS,
        );
      },
      {discrete: true},
    );
    editor.read(() => {
      const quote = $getRoot().getFirstChild();
      assert($isQuoteNode(quote), 'expected QuoteNode');
      const [list, code] = quote.getChildren();
      assert($isListNode(list), 'expected ListNode');
      expect(list.getChildrenSize()).toBe(2);
      assert($isCodeNode(code), 'expected CodeNode');
      expect(code.getLanguage()).toBe('js');
      expect(code.getTextContent()).toBe('const x = 1');
    });
  });

  it('a blank line still terminates the quote', () => {
    const editor = createEditor();
    editor.update(
      () => {
        $convertFromMarkdownString(
          '> a\n\n> b',
          SHADOW_ROOT_QUOTE_TRANSFORMERS,
        );
      },
      {discrete: true},
    );
    editor.read(() => {
      const children = $getRoot().getChildren();
      expect(children.length).toBe(2);
      expect(children.every($isQuoteNode)).toBe(true);
      expect(children.map(child => child.getTextContent())).toEqual(['a', 'b']);
    });
  });
});

describe('shadow root quote markdown export', () => {
  it('exports block children as `> ` lines with `>` separators', () => {
    const editor = createEditor();
    editor.update(
      () => {
        const quote = $createQuoteNode({shadowRoot: true});
        quote.append(
          $createParagraphNode().append($createTextNode('a')),
          $createParagraphNode().append($createTextNode('b')),
        );
        $getRoot().clear().append(quote);
      },
      {discrete: true},
    );
    editor.read(() => {
      expect($convertToMarkdownString(SHADOW_ROOT_QUOTE_TRANSFORMERS)).toBe(
        '> a\n>\n> b',
      );
      // The default QUOTE transformer understands shadow root quotes on
      // export too, so a document that opted in still exports faithfully
      // with the default transformers.
      expect($convertToMarkdownString(TRANSFORMERS)).toBe('> a\n>\n> b');
    });
  });

  it('exports nested headings and quotes with their markers', () => {
    const editor = createEditor();
    editor.update(
      () => {
        const quote = $createQuoteNode({shadowRoot: true});
        const nested = $createQuoteNode();
        nested.append($createTextNode('inner'));
        quote.append(
          $createHeadingNode('h2').append($createTextNode('title')),
          $createParagraphNode().append($createTextNode('body')),
          nested,
        );
        $getRoot().clear().append(quote);
      },
      {discrete: true},
    );
    editor.read(() => {
      expect($convertToMarkdownString(SHADOW_ROOT_QUOTE_TRANSFORMERS)).toBe(
        '> ## title\n>\n> body\n>\n> > inner',
      );
    });
  });

  it.each([
    ['multi-paragraph quote', '> a\n> b\n>\n> c'],
    ['heading and body', '> ## title\n>\n> body'],
    ['nested quote', '> > inner\n>\n> after'],
    ['list and code fence', '> - a\n> - b\n>\n> ```js\n> const x = 1\n> ```'],
    ['doubly nested quote', '> > > deep\n>\n> shallow'],
  ])('round-trips a quote with %s', (_label, markdown) => {
    const editor = createEditor();
    editor.update(
      () => {
        $convertFromMarkdownString(markdown, SHADOW_ROOT_QUOTE_TRANSFORMERS);
      },
      {discrete: true},
    );
    editor.read(() => {
      expect($convertToMarkdownString(SHADOW_ROOT_QUOTE_TRANSFORMERS)).toBe(
        markdown,
      );
    });
  });

  it('does not change the export of quotes that did not opt in', () => {
    const editor = createEditor();
    editor.update(
      () => {
        $convertFromMarkdownString('> a\n> b', TRANSFORMERS);
      },
      {discrete: true},
    );
    editor.read(() => {
      const quote = $getRoot().getFirstChild();
      assert($isQuoteNode(quote), 'expected QuoteNode');
      expect(quote.isShadowRoot()).toBe(false);
      expect($convertToMarkdownString(TRANSFORMERS)).toBe('> a\n> b');
    });
  });
});
