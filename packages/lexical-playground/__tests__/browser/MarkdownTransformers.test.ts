/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {buildEditorFromExtensions, defineExtension} from '@lexical/extension';
import {registerMarkdownShortcuts} from '@lexical/markdown';
import {RichTextExtension} from '@lexical/rich-text';
import {$getRoot, $nodesOfType} from 'lexical';
import {describe, expect, onTestFinished, test} from 'vitest';
import {userEvent} from 'vitest/browser';

import {EquationNode} from '../../src/nodes/EquationNode';
import {BLOCK_EQUATION, EQUATION} from '../../src/plugins/MarkdownTransformers';

// The jsdom unit suite (__tests__/unit/MarkdownTransformers.test.ts) covers the
// transformer logic; these tests drive the same shortcuts through real key
// events so the caret behavior around the decorator replacement is checked
// against a real selection engine.
//
// Note: no `using`/Disposable here — Explicit Resource Management is not
// supported in WebKit/Safari yet, so browser tests dispose with
// onTestFinished. See AGENTS.md.

function setUpEditor() {
  const editor = buildEditorFromExtensions(
    defineExtension({
      afterRegistration(builtEditor) {
        const rootElement = document.createElement('div');
        rootElement.contentEditable = 'true';
        document.body.appendChild(rootElement);
        builtEditor.setRootElement(rootElement);
        return () => {
          document.body.removeChild(rootElement);
        };
      },
      dependencies: [RichTextExtension],
      name: '[root]',
      nodes: [EquationNode],
      register: builtEditor =>
        registerMarkdownShortcuts(builtEditor, [BLOCK_EQUATION, EQUATION]),
    }),
  );
  onTestFinished(() => editor.dispose());
  return editor;
}

describe('playground equation markdown shortcuts (browser)', () => {
  test('typing $$x$$ creates a block equation and the caret stays usable', async () => {
    const editor = setUpEditor();
    const rootElement = editor.getRootElement()!;
    await userEvent.click(rootElement);
    await userEvent.keyboard('$$x$$');

    editor.read(() => {
      const equations = $nodesOfType(EquationNode);
      expect(equations).toHaveLength(1);
      expect(equations[0].getEquation()).toBe('x');
      expect(equations[0].isInline()).toBe(false);
    });

    await userEvent.keyboard('after');

    editor.read(() => {
      // Typing after the conversion must not replace the equation and must
      // land in the document.
      expect($nodesOfType(EquationNode)).toHaveLength(1);
      expect($getRoot().getTextContent()).toContain('after');
    });

    const domSelection = window.getSelection();
    expect(domSelection?.anchorNode).not.toBeNull();
    expect(rootElement.contains(domSelection!.anchorNode)).toBe(true);
  });

  test('typing $x$ creates an inline equation and the caret stays usable', async () => {
    const editor = setUpEditor();
    await userEvent.click(editor.getRootElement()!);
    await userEvent.keyboard('$x$ more');

    editor.read(() => {
      const equations = $nodesOfType(EquationNode);
      expect(equations).toHaveLength(1);
      expect(equations[0].getEquation()).toBe('x');
      expect(equations[0].isInline()).toBe(true);
      expect($getRoot().getTextContent()).toContain('more');
    });
  });

  test('typing $$x$$ after a soft line break keeps the first line', async () => {
    const editor = setUpEditor();
    await userEvent.click(editor.getRootElement()!);
    await userEvent.keyboard('first line{Shift>}{Enter}{/Shift}$$x$$');

    editor.read(() => {
      expect($nodesOfType(EquationNode)).toHaveLength(0);
      const text = $getRoot().getTextContent();
      expect(text).toContain('first line');
      expect(text).toContain('$$x$$');
    });
  });
});
