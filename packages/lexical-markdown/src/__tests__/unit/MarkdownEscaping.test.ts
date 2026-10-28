/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// @vitest-environment node

import {buildEditorFromExtensions} from '@lexical/extension';
import {$createLinkNode, $isLinkNode} from '@lexical/link';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isParagraphNode,
  $isTextNode,
  type LexicalNode,
  type TextFormatType,
} from 'lexical';
import {assert, describe, expect, it} from 'vitest';

import {MarkdownTestExtension} from '../utils';

type Piece =
  | string
  | {format: TextFormatType; text: string}
  | {url: string; children: Piece[]};

function $createPieces(pieces: Piece[]): LexicalNode[] {
  return pieces.map(piece =>
    typeof piece !== 'string'
      ? 'url' in piece
        ? $createLinkNode(piece.url).append(...$createPieces(piece.children))
        : $createTextNode(piece.text).toggleFormat(piece.format)
      : piece === '\n'
        ? $createLineBreakNode()
        : $createTextNode(piece),
  );
}

function exportPieces(...pieces: Piece[]): string {
  using editor = buildEditorFromExtensions([MarkdownTestExtension]);
  editor.update(
    () => {
      $getRoot()
        .clear()
        .append($createParagraphNode().append(...$createPieces(pieces)));
    },
    {discrete: true},
  );
  return editor.read(() => $convertToMarkdownString(TRANSFORMERS));
}

function importMarkdown(markdown: string): {
  exported: string;
  text: string;
} {
  using editor = buildEditorFromExtensions([MarkdownTestExtension]);
  editor.update(() => $convertFromMarkdownString(markdown, TRANSFORMERS), {
    discrete: true,
  });
  return editor.read(() => ({
    exported: $convertToMarkdownString(TRANSFORMERS),
    text: $getRoot().getTextContent(),
  }));
}

function textOf(...pieces: Piece[]): string {
  return pieces
    .map(piece =>
      typeof piece === 'string'
        ? piece
        : 'url' in piece
          ? textOf(...piece.children)
          : piece.text,
    )
    .join('');
}

// Exports the content, and checks that importing the export gives the same
// text back.
function expectExport(pieces: Piece[], markdown: string) {
  expect(exportPieces(...pieces)).toBe(markdown);
  expect(importMarkdown(markdown).text).toBe(textOf(...pieces));
}

describe('Markdown export of literal text', () => {
  it('escapes text that would read back as raw HTML or an autolink', () => {
    expectExport(['<b>x</b>'], '\\<b>x\\</b>');
    expectExport(['<img src=x>'], '\\<img src=x>');
    expectExport(['<!-- c -->'], '\\<!-- c -->');
    expectExport(['<?x?>'], '\\<?x?>');
    expectExport(['<https://lexical.dev>'], '\\<https://lexical.dev>');
    expectExport(['<a@b.co>'], '\\<a@b.co>');
  });

  it('escapes text that would read back as a character reference', () => {
    expectExport(['&#60;b>'], '\\&#60;b>');
    expectExport(['&#x3C;'], '\\&#x3C;');
    expectExport(['&copy;'], '\\&copy;');
  });

  it('leaves `<` and `&` that cannot begin syntax unescaped', () => {
    expectExport(['a < b & c'], 'a < b & c');
    expectExport(['AT&T <3'], 'AT&T <3');
  });

  it('escapes brackets that would read back as a link or image', () => {
    expectExport(['[x](y)'], '[x\\](y)');
    expectExport(['![x](y)'], '![x\\](y)');
    expectExport(['[x]: y'], '[x\\]: y');
    expectExport(['[x](y) z](w)'], '[x\\](y) z\\](w)');
    expectExport(['[x', {format: 'bold', text: '](y)'}], '[x**\\](y)**');
    expectExport(['[x', {format: 'code', text: ']'}, '](y)'], '[x`]`\\](y)');
  });

  it('leaves brackets that cannot form a link unescaped', () => {
    expectExport(['[1] and a](b)'], '[1] and a](b)');
    expectExport(['[x] (y)'], '[x] (y)');
    expectExport(
      ['[a ', {children: ['b'], url: 'https://lexical.dev'}, '](c)'],
      '[a [b](https://lexical.dev)](c)',
    );
  });

  it('escapes brackets in link text that are not balanced', () => {
    expectExport(
      [{children: ['a]'], url: 'https://lexical.dev'}],
      '[a\\]](https://lexical.dev)',
    );
    expectExport(
      [{children: ['[a'], url: 'https://lexical.dev'}],
      '[\\[a](https://lexical.dev)',
    );
    expectExport(
      [{children: ['[a] ', {format: 'bold', text: '[b](c)'}], url: 'u'}],
      '[[a] **\\[b\\](c)**](u)',
    );
  });

  it('escapes a `!` before a link', () => {
    expectExport(
      ['a!', {children: ['b'], url: 'https://lexical.dev'}],
      'a\\![b](https://lexical.dev)',
    );
  });

  it('escapes line starts that would read back as block syntax', () => {
    expectExport(['# a'], '\\# a');
    expectExport(['a', '\n', '## b'], 'a\n\\## b');
    expectExport(['> a'], '\\> a');
    expectExport(['- a'], '\\- a');
    expectExport(['+ a'], '\\+ a');
    expectExport(['a', '\n', '-'], 'a\n\\-');
    expectExport(['1. a'], '1\\. a');
    expectExport(['2026.'], '2026\\.');
    expectExport(['a', '\n', '2) b'], 'a\n2\\) b');
    expectExport(['a', '\n', '--'], 'a\n\\--');
    expectExport(['a', '\n', '==='], 'a\n\\===');
    expectExport(['a', '\n', '- - -'], 'a\n\\- - -');
    expectExport(['a|b', '\n', '-|-'], 'a|b\n\\-|-');
    expectExport(['|a|', '\n', '|:-|'], '|a|\n\\|:-|');
    expectExport(['#', {format: 'bold', text: ' a'}], '\\# **a**');
  });

  it('escapes a line start after a line break in link text', () => {
    // Import reads one line at a time, so this checks only the export.
    expect(
      exportPieces({children: ['a', '\n', '# b'], url: 'https://lexical.dev'}),
    ).toBe('[a\n\\# b](https://lexical.dev)');
  });

  it('leaves line starts that cannot begin block syntax unescaped', () => {
    expectExport(['#hashtag'], '#hashtag');
    expectExport(['-5'], '-5');
    expectExport(['+1'], '+1');
    expectExport(['3.14'], '3.14');
    expectExport(['a', '\n', 'b = c'], 'a\nb = c');
    expectExport(['a', '\n', ':)'], 'a\n:)');
    expectExport([{format: 'bold', text: '# a'}], '**# a**');
    expectExport(['a # b - c'], 'a # b - c');
  });
});

describe('Markdown import of escapes and raw inline syntax', () => {
  it('keeps raw inline syntax as written through a round trip', () => {
    for (const markdown of [
      '<b>x</b>',
      '<a href="x_y">t</a>',
      'a <span title="*b*">c</span>',
      '<https://lexical.dev>',
      '<a@b.co>',
      '&copy; &nbsp; &#x3C;',
      '<!-- c -->',
    ]) {
      expect(importMarkdown(markdown)).toEqual({
        exported: markdown,
        text: markdown,
      });
    }
  });

  it('escapes raw inline syntax once its text is edited', () => {
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    editor.update(
      () => {
        $convertFromMarkdownString('a <b>', TRANSFORMERS);
        const raw = $getRoot().getAllTextNodes()[1];
        assert($isTextNode(raw));
        expect(raw.getTextContent()).toBe('<b>');
        raw.setTextContent('<i>');
      },
      {discrete: true},
    );
    expect(editor.read(() => $convertToMarkdownString(TRANSFORMERS))).toBe(
      'a \\<i>',
    );
  });

  it('reads escaped syntax as text and exports it escaped', () => {
    for (const [markdown, text] of [
      ['\\<b>x\\</b>', '<b>x</b>'],
      ['&#60;b>', '<b>'],
      ['\\&#60;b>', '&#60;b>'],
      ['\\&copy;', '&copy;'],
      ['\\[x\\](y)', '[x](y)'],
      ['[x\\](y)', '[x](y)'],
      ['\\[x](y)', '[x](y)'],
    ]) {
      const result = importMarkdown(markdown);
      expect(result.text).toBe(text);
      expect(importMarkdown(result.exported).text).toBe(text);
    }
  });

  it('reads escapes in text before an unbalanced link', () => {
    expect(importMarkdown('[a\\*[b](u)').text).toBe('[a*b');
  });

  it('reads escaped brackets in link text', () => {
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    editor.update(
      () => $convertFromMarkdownString('[a\\[b](u) [c\\]](v)', TRANSFORMERS),
      {discrete: true},
    );
    editor.read(() => {
      const paragraph = $getRoot().getFirstChild();
      assert($isParagraphNode(paragraph));
      const [first, space, second] = paragraph.getChildren();
      assert($isLinkNode(first) && $isLinkNode(second));
      expect([first, space, second].map(node => node.getTextContent())).toEqual(
        ['a[b', ' ', 'c]'],
      );
      expect($convertToMarkdownString(TRANSFORMERS)).toBe(
        '[a\\[b](u) [c\\]](v)',
      );
    });
  });
});
