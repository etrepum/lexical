/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {buildEditorFromExtensions} from '@lexical/extension';
import {
  $createListItemNode,
  $createListNode,
  $isListNode,
  ListItemNode,
  ListNode,
} from '@lexical/list';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  registerMarkdownShortcuts,
} from '@lexical/markdown';
import {RichTextExtension} from '@lexical/rich-text';
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  $nodesOfType,
  createEditor,
  defineExtension,
  LexicalEditor,
} from 'lexical';
import {assert, describe, expect, it} from 'vitest';

import {
  $createEquationNode,
  $isEquationNode,
  EquationNode,
} from '../../src/nodes/EquationNode';
import {BLOCK_EQUATION, EQUATION} from '../../src/plugins/MarkdownTransformers';

const EQUATION_TRANSFORMERS = [BLOCK_EQUATION, EQUATION];
const MarkdownShortcutTestExtension = defineExtension({
  dependencies: [RichTextExtension],
  name: 'MarkdownShortcutTest',
  nodes: [EquationNode, ListItemNode, ListNode],
  register: editor => registerMarkdownShortcuts(editor, EQUATION_TRANSFORMERS),
});

function typeMarkdown(editor: LexicalEditor, text: string) {
  editor.update(() => {
    const selection = $getSelection();
    if (!($isRangeSelection(selection) && selection.isCollapsed())) {
      $getRoot().selectEnd();
    }
  });
  for (const char of text) {
    editor.update(() => $getSelection()?.insertText(char), {discrete: true});
  }
  editor.read(() => {});
}

function $getSingleInlineEquation(): EquationNode {
  const paragraph = $getRoot().getFirstChildOrThrow();
  assert($isParagraphNode(paragraph), 'Root child must be a paragraph');

  const equation = paragraph.getFirstChildOrThrow();
  assert($isEquationNode(equation), 'Paragraph child must be an EquationNode');
  expect(equation.isInline()).toBe(true);
  return equation;
}

describe('playground EQUATION markdown transformer', () => {
  it('exports inline equations with single dollar delimiters', () => {
    const editor = createEditor({nodes: [EquationNode]});

    editor.update(
      () => {
        const paragraph = $createParagraphNode();
        paragraph.append($createEquationNode('x^2 + y^2 = z^2', true));
        $getRoot().append(paragraph);
      },
      {discrete: true},
    );

    const markdown = editor
      .getEditorState()
      .read(() => $convertToMarkdownString(EQUATION_TRANSFORMERS));

    expect(markdown).toBe('$x^2 + y^2 = z^2$');
  });

  it('exports LaTeX commands in inline equations without doubling backslashes', () => {
    const editor = createEditor({nodes: [EquationNode]});

    editor.update(
      () => {
        const paragraph = $createParagraphNode();
        paragraph.append($createEquationNode('\\frac{1}{2} + \\alpha', true));
        $getRoot().append(paragraph);
      },
      {discrete: true},
    );

    const markdown = editor
      .getEditorState()
      .read(() => $convertToMarkdownString(EQUATION_TRANSFORMERS));

    expect(markdown).toBe('$\\frac{1}{2} + \\alpha$');

    const nextEditor = createEditor({nodes: [EquationNode]});
    nextEditor.update(
      () => {
        $convertFromMarkdownString(markdown, EQUATION_TRANSFORMERS);
      },
      {discrete: true},
    );

    nextEditor.read(() => {
      expect($getSingleInlineEquation().getEquation()).toBe(
        '\\frac{1}{2} + \\alpha',
      );
    });
  });

  it('exports block equations with double dollar delimiters', () => {
    const editor = createEditor({nodes: [EquationNode]});

    editor.update(
      () => {
        $getRoot().append($createEquationNode('x^2 + y^2 = z^2', false));
      },
      {discrete: true},
    );

    const markdown = editor
      .getEditorState()
      .read(() => $convertToMarkdownString(EQUATION_TRANSFORMERS));

    expect(markdown).toBe('$$\nx^2 + y^2 = z^2\n$$');
  });

  it('exports non-inline equations nested inside an element in inline form', () => {
    const editor = createEditor({nodes: [EquationNode]});

    editor.update(
      () => {
        const paragraph = $createParagraphNode();
        paragraph.append(
          $createTextNode('before '),
          $createEquationNode('E=mc^2', false),
          $createTextNode(' after'),
        );
        $getRoot().append(paragraph);
      },
      {discrete: true},
    );

    const markdown = editor
      .getEditorState()
      .read(() => $convertToMarkdownString(EQUATION_TRANSFORMERS));

    expect(markdown).toBe('before $E=mc^2$ after');
  });

  it('imports multiline double dollar equations as block equations', () => {
    const editor = createEditor({nodes: [EquationNode]});

    editor.update(
      () => {
        $convertFromMarkdownString(
          '$$\nx^2 + y^2 = z^2\n$$',
          EQUATION_TRANSFORMERS,
        );
      },
      {discrete: true},
    );

    editor.read(() => {
      const equation = $getRoot().getFirstChildOrThrow();
      assert($isEquationNode(equation), 'Root child must be an EquationNode');
      expect(equation.getEquation()).toBe('x^2 + y^2 = z^2');
      expect(equation.isInline()).toBe(false);
    });
  });

  it('imports single dollar equations as inline equations', () => {
    const editor = createEditor({nodes: [EquationNode]});

    editor.update(
      () => {
        $convertFromMarkdownString('$x^2 + y^2 = z^2$', EQUATION_TRANSFORMERS);
      },
      {discrete: true},
    );

    editor.read(() => {
      expect($getSingleInlineEquation().getEquation()).toBe('x^2 + y^2 = z^2');
    });
  });

  it('imports escaped dollars inside inline equations verbatim', () => {
    const editor = createEditor({nodes: [EquationNode]});

    editor.update(
      () => {
        $convertFromMarkdownString('$price = \\$5$', EQUATION_TRANSFORMERS);
      },
      {discrete: true},
    );

    editor.read(() => {
      expect($getSingleInlineEquation().getEquation()).toBe('price = \\$5');
    });
  });

  it('exports inline equations without creating block-equation ambiguity', () => {
    const editor = createEditor({nodes: [EquationNode]});

    editor.update(
      () => {
        const paragraph = $createParagraphNode();
        paragraph.append(
          $createTextNode('$'),
          $createEquationNode('x^2 + y^2 = z^2', true),
          $createTextNode('$'),
        );
        $getRoot().append(paragraph);
      },
      {discrete: true},
    );

    const markdown = editor
      .getEditorState()
      .read(() => $convertToMarkdownString(EQUATION_TRANSFORMERS));

    expect(markdown).toBe('$$x^2 + y^2 = z^2$$');

    const nextEditor = createEditor({nodes: [EquationNode]});
    nextEditor.update(
      () => {
        $convertFromMarkdownString(markdown, EQUATION_TRANSFORMERS);
      },
      {discrete: true},
    );

    nextEditor.read(() => {
      const paragraph = $getRoot().getFirstChildOrThrow();
      assert($isParagraphNode(paragraph), 'Root child must be a paragraph');
      const children = paragraph.getChildren();
      expect(children.map(child => child.getTextContent())).toEqual([
        '$',
        'x^2 + y^2 = z^2',
        '$',
      ]);
      assert(
        $isEquationNode(children[1]),
        'Middle child must be an EquationNode',
      );
      expect(children[1].isInline()).toBe(true);
    });
  });

  it('normalizes bare dollar signs in inline equations to KaTeX-valid escapes', () => {
    const editor = createEditor({nodes: [EquationNode]});

    editor.update(
      () => {
        const paragraph = $createParagraphNode();
        paragraph.append($createEquationNode('price = $5', true));
        $getRoot().append(paragraph);
      },
      {discrete: true},
    );

    const markdown = editor
      .getEditorState()
      .read(() => $convertToMarkdownString(EQUATION_TRANSFORMERS));

    expect(markdown).toBe('$price = \\$5$');

    const nextEditor = createEditor({nodes: [EquationNode]});
    nextEditor.update(
      () => {
        $convertFromMarkdownString(markdown, EQUATION_TRANSFORMERS);
      },
      {discrete: true},
    );

    nextEditor.read(() => {
      expect($getSingleInlineEquation().getEquation()).toBe('price = \\$5');
    });
  });

  it('round-trips inline equations that already contain escaped dollars', () => {
    const editor = createEditor({nodes: [EquationNode]});

    editor.update(
      () => {
        const paragraph = $createParagraphNode();
        paragraph.append($createEquationNode('price = \\$5', true));
        $getRoot().append(paragraph);
      },
      {discrete: true},
    );

    const markdown = editor
      .getEditorState()
      .read(() => $convertToMarkdownString(EQUATION_TRANSFORMERS));

    expect(markdown).toBe('$price = \\$5$');

    const nextEditor = createEditor({nodes: [EquationNode]});
    nextEditor.update(
      () => {
        $convertFromMarkdownString(markdown, EQUATION_TRANSFORMERS);
      },
      {discrete: true},
    );

    nextEditor.read(() => {
      expect($getSingleInlineEquation().getEquation()).toBe('price = \\$5');
    });
  });

  it('uses a block equation when typing double dollar markdown', () => {
    using editor = buildEditorFromExtensions(MarkdownShortcutTestExtension);
    typeMarkdown(editor, '$$x^2 + y^2 = z^2$$');

    editor.read(() => {
      const equation = $getRoot().getFirstChildOrThrow();
      assert($isEquationNode(equation), 'Root child must be an EquationNode');
      expect(equation.getEquation()).toBe('x^2 + y^2 = z^2');
      expect(equation.isInline()).toBe(false);
    });
  });

  it('preserves escaped dollars when typing an inline equation', () => {
    using editor = buildEditorFromExtensions(MarkdownShortcutTestExtension);
    typeMarkdown(editor, '$price = \\$5$');

    editor.read(() => {
      const equations = $nodesOfType(EquationNode);
      expect(equations).toHaveLength(1);
      expect(equations[0].getEquation()).toBe('price = \\$5');
      expect(equations[0].isInline()).toBe(true);
    });
  });

  it('does not create an equation when the opening dollar is escaped', () => {
    using editor = buildEditorFromExtensions(MarkdownShortcutTestExtension);
    typeMarkdown(editor, 'cost \\$5 then $');

    editor.read(() => {
      expect($nodesOfType(EquationNode)).toHaveLength(0);
      expect($getRoot().getTextContent()).toBe('cost \\$5 then $');
    });
  });

  it('preserves earlier lines when typing $$ markdown after a line break', () => {
    using editor = buildEditorFromExtensions(MarkdownShortcutTestExtension);
    editor.update(
      () => {
        const paragraph = $createParagraphNode();
        paragraph.append(
          $createTextNode('important first line'),
          $createLineBreakNode(),
        );
        $getRoot().append(paragraph);
        paragraph.selectEnd();
      },
      {discrete: true},
    );
    typeMarkdown(editor, '$$x$$');

    editor.read(() => {
      expect($nodesOfType(EquationNode)).toHaveLength(0);
      expect($getRoot().getTextContent()).toContain('important first line');
      expect($getRoot().getTextContent()).toContain('$$x$$');
    });
  });

  it('preserves formatted siblings when typing $$ markdown', () => {
    using editor = buildEditorFromExtensions(MarkdownShortcutTestExtension);
    editor.update(
      () => {
        const paragraph = $createParagraphNode();
        const bold = $createTextNode('bold prefix ');
        bold.setFormat('bold');
        const plain = $createTextNode('');
        paragraph.append(bold, plain);
        $getRoot().append(paragraph);
        plain.selectEnd();
      },
      {discrete: true},
    );
    typeMarkdown(editor, '$$x$$');

    editor.read(() => {
      expect($nodesOfType(EquationNode)).toHaveLength(0);
      const paragraph = $getRoot().getLastChildOrThrow();
      assert($isParagraphNode(paragraph), 'Paragraph must be preserved');
      expect(paragraph.getTextContent()).toBe('bold prefix $$x$$');
      const bold = paragraph.getFirstChildOrThrow();
      assert($isTextNode(bold), 'First child must be a text node');
      expect(bold.hasFormat('bold')).toBe(true);
    });
  });

  it('does not convert list items when typing $$ markdown', () => {
    using editor = buildEditorFromExtensions(MarkdownShortcutTestExtension);
    editor.update(
      () => {
        const list = $createListNode('bullet');
        const firstItem = $createListItemNode();
        firstItem.append($createTextNode('item one'));
        const secondItem = $createListItemNode();
        const target = $createTextNode('');
        secondItem.append(target);
        list.append(firstItem, secondItem);
        $getRoot().append(list);
        target.selectEnd();
      },
      {discrete: true},
    );
    typeMarkdown(editor, '$$x$$');

    editor.read(() => {
      expect($nodesOfType(EquationNode)).toHaveLength(0);
      const list = $getRoot().getChildren().find($isListNode);
      assert(list !== undefined, 'List must be preserved');
      const items = list.getChildren();
      expect(items).toHaveLength(2);
      expect(items[0].getTextContent()).toBe('item one');
      expect(items[1].getTextContent()).toBe('$$x$$');
    });
  });
});
