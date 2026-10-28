/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// @vitest-environment node

import {buildEditorFromExtensions} from '@lexical/extension';
import {
  $createLinkNode,
  $isAutoLinkNode,
  $isLinkNode,
  AutoLinkNode,
} from '@lexical/link';
import {$createListItemNode, $createListNode} from '@lexical/list';
import {$createMarkNode, MarkExtension} from '@lexical/mark';
import {
  $convertFromMarkdownString,
  $convertSelectionToMarkdownString,
  $convertToMarkdownString,
  HEADING,
  type TextMatchTransformer,
  TRANSFORMERS,
  UNORDERED_LIST,
} from '@lexical/markdown';
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
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

function $styled(text: string): LexicalNode {
  return $createTextNode(text).setStyle('color: red');
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
    expectExport(['a [x] (y)'], 'a [x] (y)');
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

  it('escapes an image closer after a link in its text', () => {
    expect(exportPieces('![', {children: ['x'], url: 'u'}, '](y)')).toBe(
      '![[x](u)\\](y)',
    );
  });

  it('keeps a format that ends in punctuation before an escape', () => {
    expectExport(
      [{format: 'bold', text: 'Note:'}, '<br> see'],
      '**Note:**\\<br> see',
    );
    expectExport(
      [{format: 'italic', text: 'Q&A.'}, '&copy; 2024'],
      '*Q&A.*\\&copy; 2024',
    );
  });

  it('keeps an image read as `!` before a link', () => {
    for (const markdown of ['![img](src.png)', '[![img](a)](b)']) {
      expect(importMarkdown(markdown).exported).toBe(markdown);
    }
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
    expectExport(['[x] a'], '\\[x] a');
    expectExport(['a', '\n', '[ ] b'], 'a\n\\[ ] b');
    expect(exportPieces({format: 'bold', text: '  '}, '# a')).toBe('  \\# a');
  });

  it('escapes an ordered list marker split across nodes', () => {
    expect(exportPieces('1', {children: ['a'], url: 'u'})).toBe('1[a](u)');
    expect(exportPieces('1', {format: 'code', text: '. a'})).toBe('1`. a`');
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    editor.update(
      () => {
        $getRoot()
          .clear()
          .append(
            $createParagraphNode().append(
              $createTextNode('1'),
              $createTextNode('. a').setStyle('color: red'),
            ),
          );
      },
      {discrete: true},
    );
    expect(editor.read(() => $convertToMarkdownString(TRANSFORMERS))).toBe(
      '1\\. a',
    );
  });

  it('escapes syntax split across nodes', () => {
    using editor = buildEditorFromExtensions(
      MarkdownTestExtension,
      MarkExtension,
    );
    const cases: [() => LexicalNode[], string][] = [
      [() => [$createTextNode('12'), $styled('3. a')], '123\\. a'],
      [() => [$createTextNode('&'), $styled('#65;')], '\\&#65;'],
      [() => [$createTextNode('<'), $styled('b>')], '\\<b>'],
      [() => [$createTextNode('a'), $styled('\n# b')], 'a\n\\# b'],
      [
        () => [
          $createMarkNode(['id']).append(
            $createTextNode('a'),
            $createLineBreakNode(),
          ),
          $createTextNode('# b'),
        ],
        'a\n\\# b',
      ],
      [
        () => [
          $createTextNode('1'),
          $createMarkNode(['id']).append($createTextNode('. a')),
        ],
        '1\\. a',
      ],
    ];
    for (const [$create, markdown] of cases) {
      editor.update(
        () => {
          $getRoot()
            .clear()
            .append($createParagraphNode().append(...$create()));
        },
        {discrete: true},
      );
      expect(editor.read(() => $convertToMarkdownString(TRANSFORMERS))).toBe(
        markdown,
      );
    }
  });

  it('escapes brackets beside an object replacement character', () => {
    expectExport(['[a\uFFFC](b)'], '[a\uFFFC\\](b)');
  });

  it('leaves numbered heading text unescaped', () => {
    for (const markdown of ['# 1. Intro', '## 2) Next', '### - a']) {
      expect(importMarkdown(markdown).exported).toBe(markdown);
    }
  });

  it('escapes around what a custom transformer writes', () => {
    const MENTION: TextMatchTransformer = {
      dependencies: [],
      export: node =>
        $isTextNode(node) && node.getTextContent() === '@bob'
          ? '[@bob](mention:1)'
          : null,
      regExp: /(?!)/,
      type: 'text-match',
    };
    const DASH: TextMatchTransformer = {
      dependencies: [],
      export: (node, _exportChildren, exportFormat) =>
        $isTextNode(node) && node.getTextContent() === 'dash'
          ? exportFormat(node, '- x')
          : null,
      regExp: /(?!)/,
      type: 'text-match',
    };
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    editor.update(
      () => {
        $getRoot()
          .clear()
          .append(
            $createParagraphNode().append(
              $createTextNode('x '),
              $styled('@bob'),
              $createTextNode(' a '),
              $styled('dash'),
            ),
          );
      },
      {discrete: true},
    );
    expect(
      editor.read(() =>
        $convertToMarkdownString([...TRANSFORMERS, MENTION, DASH]),
      ),
    ).toBe('x [@bob](mention:1) a - x');
  });

  it('escapes line starts that import reads as block syntax', () => {
    expectExport(['1234567890. a'], '1234567890\\. a');
    expect(exportPieces('a\n    - b')).toBe('a\n    \\- b');
  });

  it('escapes line starts inside a text node', () => {
    expect(exportPieces('a\n# b')).toBe('a\n\\# b');
  });

  it('escapes link text as text when links are not written', () => {
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    editor.update(
      () => {
        $getRoot()
          .clear()
          .append(
            $createParagraphNode().append(
              $createLinkNode('u').append($createTextNode('# a [b]')),
            ),
          );
      },
      {discrete: true},
    );
    expect(editor.read(() => $convertToMarkdownString([HEADING]))).toBe(
      '\\# a [b]',
    );
  });

  it('round trips link text with code spans and nested brackets', () => {
    for (const children of [
      [{format: 'code', text: 'a``b'} as const],
      ['[[[[a]]]]'],
    ]) {
      const markdown = exportPieces({children, url: 'u'});
      const {exported} = importMarkdown(markdown);
      expect(exported).toBe(markdown);
      expect(markdown.startsWith('[')).toBe(true);
    }
    expect(exportPieces({children: ['[[[[a]]]]'], url: 'u'})).toBe(
      '[[[[\\[a\\]]]]](u)',
    );
  });

  it('escapes backslashes before syntax when preserving newlines', () => {
    for (const [pieces, markdown] of [
      [
        ['\\<b> \\&copy; \\* \\x <i>'],
        '\\\\\\<b> \\\\\\&copy; \\\\\\* \\x \\<i>',
      ],
      [['a\\', {children: ['x'], url: 'u'}], 'a\\\\[x](u)'],
      [['[a\\]', {format: 'bold', text: '](b)'}], '[a\\\\]**\\](b)**'],
    ] as [Piece[], string][]) {
      using editor = buildEditorFromExtensions([MarkdownTestExtension]);
      editor.update(
        () => {
          $getRoot()
            .clear()
            .append($createParagraphNode().append(...$createPieces(pieces)));
        },
        {discrete: true},
      );
      const exported = editor.read(() =>
        $convertToMarkdownString(TRANSFORMERS, undefined, true),
      );
      expect(exported).toBe(markdown);
      editor.update(
        () =>
          $convertFromMarkdownString(exported, TRANSFORMERS, undefined, true),
        {discrete: true},
      );
      expect(editor.read(() => $getRoot().getTextContent())).toBe(
        textOf(...pieces),
      );
    }
  });

  it('escapes a task list marker at the start of a list item', () => {
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    editor.update(
      () => {
        $getRoot()
          .clear()
          .append(
            $createListNode('bullet').append(
              $createListItemNode().append($createTextNode('[x] done')),
            ),
          );
      },
      {discrete: true},
    );
    const markdown = editor.read(() => $convertToMarkdownString(TRANSFORMERS));
    expect(markdown).toBe('- \\[x] done');
    expect(importMarkdown(markdown).exported).toBe(markdown);
  });

  it('escapes a line start where a selection starts', () => {
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    editor.update(
      () => {
        const text = $createTextNode('# a');
        $getRoot()
          .clear()
          .append(
            $createParagraphNode().append(
              $createLinkNode('https://lexical.dev').append(
                $createTextNode('b'),
              ),
              text,
            ),
          );
        text.select(0, 3);
      },
      {discrete: true},
    );
    expect(
      editor.read(() =>
        $convertSelectionToMarkdownString(TRANSFORMERS, $getSelection()),
      ),
    ).toBe('\\# a');
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
    expectExport(['a [x]: y'], 'a [x]: y');
    expectExport(
      [{children: ['1. Intro'], url: 'https://lexical.dev'}],
      '[1. Intro](https://lexical.dev)',
    );
  });

  it('escapes an underline that starts a block when preserving newlines', () => {
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    editor.update(
      () => {
        $getRoot()
          .clear()
          .append(
            $createParagraphNode().append($createTextNode('Title')),
            $createParagraphNode().append($createTextNode('===')),
          );
      },
      {discrete: true},
    );
    expect(
      editor.read(() =>
        $convertToMarkdownString(TRANSFORMERS, undefined, true),
      ),
    ).toBe('Title\n\\===');
  });

  it('escapes a closer whose opener is in the block before when preserving newlines', () => {
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    editor.update(
      () => {
        $getRoot()
          .clear()
          .append(
            $createParagraphNode().append($createTextNode('[a')),
            $createParagraphNode().append($createTextNode('b](c)')),
          );
      },
      {discrete: true},
    );
    expect(
      editor.read(() =>
        $convertToMarkdownString(TRANSFORMERS, undefined, true),
      ),
    ).toBe('[a\nb\\](c)');
  });

  it('escapes a highlighted setext heading underline', () => {
    expectExport(['a', '\n', {format: 'highlight', text: '='}], 'a\n==\\===');
  });

  it('escapes a closing sequence in heading text', () => {
    for (const [text, markdown] of [
      ['a #', '# a \\#'],
      ['#', '# \\#'],
      ['C#', '# C#'],
    ]) {
      using editor = buildEditorFromExtensions([MarkdownTestExtension]);
      editor.update(
        () => {
          $convertFromMarkdownString('# x', TRANSFORMERS);
          $getRoot().getAllTextNodes()[0].setTextContent(text);
        },
        {discrete: true},
      );
      expect(editor.read(() => $convertToMarkdownString(TRANSFORMERS))).toBe(
        markdown,
      );
      expect(importMarkdown(markdown).text).toBe(text);
    }
  });

  it('escapes a line start inside a format carried on from the line before', () => {
    expect(
      exportPieces(
        {format: 'bold', text: 'a\n'},
        {format: 'bold', text: '# b'},
      ),
    ).toBe('**a\n\\# b**');
  });

  it('escapes `<` that would begin an HTML block or an email autolink', () => {
    expectExport(['<div'], '\\<div');
    expectExport(['<!-- x'], '\\<!-- x');
    expectExport(['<1a@b.co>'], '\\<1a@b.co>');
    expectExport(['if x<1 then'], 'if x<1 then');
  });

  it('escapes brackets around an image a transformer writes', () => {
    const IMAGE: TextMatchTransformer = {
      dependencies: [],
      export: node =>
        $isTextNode(node) && node.getTextContent() === 'img' ? '![a](b)' : null,
      regExp: /(?!)/,
      type: 'text-match',
    };
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    editor.update(
      () => {
        $getRoot()
          .clear()
          .append(
            $createParagraphNode().append(
              $createTextNode('['),
              $styled('img'),
              $createTextNode('](u)'),
            ),
          );
      },
      {discrete: true},
    );
    expect(
      editor.read(() => $convertToMarkdownString([...TRANSFORMERS, IMAGE])),
    ).toBe('[![a](b)\\](u)');
  });

  it('escapes line starts in links that only an autolink transformer writes', () => {
    const AUTOLINK: TextMatchTransformer = {
      dependencies: [AutoLinkNode],
      export: node =>
        $isAutoLinkNode(node) ? '<' + node.getURL() + '>' : null,
      regExp: /(?!)/,
      type: 'text-match',
    };
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    editor.update(
      () => {
        $getRoot()
          .clear()
          .append(
            $createParagraphNode().append(
              $createLinkNode('https://lexical.dev').append(
                $createTextNode('# a'),
              ),
            ),
          );
      },
      {discrete: true},
    );
    expect(
      editor.read(() => $convertToMarkdownString([HEADING, AUTOLINK])),
    ).toBe('\\# a');
  });

  it('escapes a closing sequence on the first line of a heading', () => {
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    editor.update(
      () => {
        $convertFromMarkdownString('# x', TRANSFORMERS);
        const text = $getRoot().getAllTextNodes()[0];
        text.setTextContent('foo #');
        text
          .insertAfter($createTextNode('bar'))
          .insertBefore($createLineBreakNode());
      },
      {discrete: true},
    );
    expect(editor.read(() => $convertToMarkdownString(TRANSFORMERS))).toBe(
      '# foo \\#\nbar',
    );
  });

  it('escapes line starts in headings that are written as paragraphs', () => {
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    editor.update(
      () => {
        $convertFromMarkdownString('# x', TRANSFORMERS);
        $getRoot().getAllTextNodes()[0].setTextContent('- a #');
      },
      {discrete: true},
    );
    expect(editor.read(() => $convertToMarkdownString([UNORDERED_LIST]))).toBe(
      '\\- a #',
    );
  });

  it('reads links a transformer writes in another syntax as opaque', () => {
    const WIKI: TextMatchTransformer = {
      dependencies: [],
      export: node =>
        $isLinkNode(node) && node.getURL().startsWith('wiki:')
          ? '[[' + node.getTextContent() + ']]'
          : null,
      regExp: /(?!)/,
      type: 'text-match',
    };
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    editor.update(
      () => {
        $getRoot()
          .clear()
          .append(
            $createParagraphNode().append(
              $createTextNode('[a '),
              $createLinkNode('wiki:page').append($createTextNode('page')),
              $createTextNode('](u)'),
            ),
          );
      },
      {discrete: true},
    );
    expect(
      editor.read(() => $convertToMarkdownString([WIKI, ...TRANSFORMERS])),
    ).toBe('[a [[page]]\\](u)');
  });

  it('reads a nested list apart from the text of its list item', () => {
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    editor.update(
      () => {
        $getRoot()
          .clear()
          .append(
            $createListNode('bullet').append(
              $createListItemNode().append(
                $createTextNode('a!'),
                $createListNode('bullet').append(
                  $createListItemNode().append(
                    $createLinkNode('https://lexical.dev').append(
                      $createTextNode('b'),
                    ),
                  ),
                ),
              ),
            ),
          );
      },
      {discrete: true},
    );
    expect(editor.read(() => $convertToMarkdownString(TRANSFORMERS))).toContain(
      'a!',
    );
  });
});

describe('Markdown import of escapes', () => {
  it('reads inline HTML and references as text that reads back the same', () => {
    for (const markdown of [
      '<b>x</b>',
      '<a href="x_y">t</a>',
      '<https://lexical.dev>',
      '<a@b.co>',
      '&copy; &nbsp; &#x3C;',
      '<!-- c -->',
    ]) {
      const {exported, text} = importMarkdown(markdown);
      expect(text).toBe(markdown);
      expect(exported).toMatch(/^\\[<&]/);
      expect(importMarkdown(exported).text).toBe(markdown);
    }
  });

  it('reads links and emphasis inside text that is not an HTML tag', () => {
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    editor.update(
      () =>
        $convertFromMarkdownString('a <b [x](u)> c <d *e* f>', TRANSFORMERS),
      {discrete: true},
    );
    editor.read(() => {
      const paragraph = $getRoot().getFirstChild();
      assert($isParagraphNode(paragraph));
      expect(paragraph.getChildren().some($isLinkNode)).toBe(true);
      expect(
        paragraph
          .getAllTextNodes()
          .some(
            node => node.hasFormat('italic') && node.getTextContent() === 'e',
          ),
      ).toBe(true);
      expect($convertToMarkdownString(TRANSFORMERS)).toBe(
        'a \\<b [x](u)> c \\<d *e* f>',
      );
    });
  });

  it('does not match syntax that starts at an escaped backslash', () => {
    const MATH: TextMatchTransformer = {
      dependencies: [],
      importRegExp: /\\\((.+?)\\\)/,
      regExp: /(?!)/,
      replace: textNode => {
        textNode.replace($createTextNode('math'));
      },
      type: 'text-match',
    };
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    editor.update(
      () => $convertFromMarkdownString('\\\\(x\\) \\(y\\)', [MATH]),
      {discrete: true},
    );
    expect(editor.read(() => $getRoot().getTextContent())).toBe('\\(x) math');
  });

  it('reads link text holding brackets before text that is no destination', () => {
    for (const [markdown, text] of [
      ['[call f[0](x, y)](u)', 'call f[0](x, y)'],
      ['[[x](y](u)', '[x](y'],
      ['[a (b) c](u)', 'a (b) c'],
    ]) {
      using editor = buildEditorFromExtensions([MarkdownTestExtension]);
      editor.update(() => $convertFromMarkdownString(markdown, TRANSFORMERS), {
        discrete: true,
      });
      editor.read(() => {
        const link = $getRoot().getFirstDescendant()?.getParent();
        assert($isLinkNode(link));
        expect(link.getTextContent()).toBe(text);
      });
    }
  });

  it('reads a link inside brackets before a destination', () => {
    for (const markdown of [
      '[see [Foo](https://en.wikipedia.org/wiki/Foo_(bar))](x)',
      '[a [b](c "t")](d)',
      '[a [b](<c d>)](d)',
    ]) {
      using editor = buildEditorFromExtensions([MarkdownTestExtension]);
      editor.update(() => $convertFromMarkdownString(markdown, TRANSFORMERS), {
        discrete: true,
      });
      editor.read(() => {
        const [first] = $getRoot().getAllTextNodes();
        expect($isLinkNode(first.getParent())).toBe(false);
      });
    }
  });

  it('reads escapes of custom format tags', () => {
    using editor = buildEditorFromExtensions([MarkdownTestExtension]);
    const UNDERLINE = {
      format: ['underline'],
      tag: '§',
      type: 'text-format',
    } as const;
    editor.update(() => $convertFromMarkdownString('\\§x§ y', [UNDERLINE]), {
      discrete: true,
    });
    expect(editor.read(() => $getRoot().getTextContent())).toBe('\\§x§ y');
  });

  it('reads link text with backtick runs', () => {
    for (const [markdown, text] of [
      ['[a ``b](u)', 'a ``b'],
      ['[a ```b](u)', 'a ```b'],
    ]) {
      using editor = buildEditorFromExtensions([MarkdownTestExtension]);
      editor.update(() => $convertFromMarkdownString(markdown, TRANSFORMERS), {
        discrete: true,
      });
      editor.read(() => {
        const link = $getRoot().getFirstDescendant()?.getParent();
        assert($isLinkNode(link));
        expect(link.getTextContent()).toBe(text);
      });
    }
    expectExport(
      [{children: [{format: 'code', text: 'a```b'}], url: 'u'}],
      '[```` a```b ````](u)',
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
