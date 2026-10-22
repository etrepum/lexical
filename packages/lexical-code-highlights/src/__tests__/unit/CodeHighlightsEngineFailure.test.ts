/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// @vitest-environment node

import {$createCodeNode, $isCodeNode} from '@lexical/code-core';
import {
  CodeHighlightsExtension,
  isCodeLanguageLoaded,
  loadCodeLanguage,
  loadCodeTheme,
} from '@lexical/code-highlights';
import {buildEditorFromExtensions} from '@lexical/extension';
import {RichTextExtension} from '@lexical/rich-text';
import {$createTextNode, $getRoot, defineExtension} from 'lexical';
import {assert, describe, expect, onTestFinished, test, vi} from 'vitest';

// What importing the engine does where its WebAssembly can't be compiled:
// without SIMD support, or under a CSP that forbids WebAssembly.
vi.mock('@pierre/highlights', () => {
  throw new WebAssembly.CompileError('WebAssembly.Module(): disallowed');
});

describe('CodeHighlightsExtension without a usable engine', () => {
  test('splits the code uncolored once the engine fails to load', async () => {
    const editor = buildEditorFromExtensions(
      defineExtension({
        dependencies: [RichTextExtension, CodeHighlightsExtension],
        name: 'code-highlights-engine-failure-test',
      }),
    );
    onTestFinished(() => editor.dispose());
    editor.update(
      () => {
        const code = $createCodeNode('javascript');
        code.append($createTextNode('let a;\nlet b;'));
        $getRoot().clear().append(code);
      },
      {discrete: true},
    );
    await Promise.all([
      loadCodeLanguage('javascript'),
      loadCodeTheme('one-light'),
    ]);
    await Promise.resolve();
    expect(isCodeLanguageLoaded('javascript')).toBe(false);
    editor.read(() => {
      const code = $getRoot().getFirstChild();
      assert($isCodeNode(code));
      expect(code.getIsSyntaxHighlightSupported()).toBe(false);
      expect(code.getStyle()).toBe('');
      expect(code.getChildren().map(child => child.getType())).toEqual([
        'code-highlight',
        'linebreak',
        'code-highlight',
      ]);
    });
  });
});
