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
  isCodeThemeLoaded,
  loadCodeTheme,
} from '@lexical/code-highlights';
import {buildEditorFromExtensions} from '@lexical/extension';
import {RichTextExtension} from '@lexical/rich-text';
import {$createTextNode, $getRoot, defineExtension} from 'lexical';
import {assert, describe, expect, onTestFinished, test, vi} from 'vitest';

vi.mock('@pierre/highlights/themes/loader', () => ({
  themes: {'one-light': () => Promise.reject(new Error('offline'))},
}));

describe('CodeHighlightsExtension theme load failure', () => {
  test('splits the code uncolored once the theme fails to load', async () => {
    const editor = buildEditorFromExtensions(
      defineExtension({
        dependencies: [RichTextExtension, CodeHighlightsExtension],
        name: 'code-highlights-theme-failure-test',
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
    await loadCodeTheme('one-light');
    await Promise.resolve();
    expect(isCodeThemeLoaded('one-light')).toBe(true);
    editor.read(() => {
      const code = $getRoot().getFirstChild();
      assert($isCodeNode(code));
      expect(code.getStyle()).toBe('');
      expect(code.getChildren().map(child => child.getType())).toEqual([
        'code-highlight',
        'linebreak',
        'code-highlight',
      ]);
    });
  });
});
