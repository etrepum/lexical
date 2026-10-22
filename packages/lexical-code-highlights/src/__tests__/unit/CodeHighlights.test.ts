/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $createCodeNode,
  $isCodeHighlightNode,
  $isCodeNode,
} from '@lexical/code-core';
import {
  CodeHighlightsExtension,
  getCodeLanguageOptions,
  getCodeThemeOptions,
  HighlightsTokenizer,
  isCodeLanguageLoaded,
  isCodeThemeLoaded,
  loadCodeLanguage,
  loadCodeTheme,
  normalizeCodeLanguage,
  type Tokenizer,
} from '@lexical/code-highlights';
import {
  buildEditorFromExtensions,
  configExtension,
  getExtensionDependencyFromEditor,
} from '@lexical/extension';
import {HistoryExtension} from '@lexical/history';
import {RichTextExtension} from '@lexical/rich-text';
import {isSupportedLanguage} from '@pierre/highlights';
import {
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  defineExtension,
  type LexicalEditor,
  UNDO_COMMAND,
} from 'lexical';
import {expectHtmlToBeEqual, html} from 'lexical/src/__tests__/utils';
import {assert, describe, expect, onTestFinished, test} from 'vitest';

function createEditor(tokenizer: Tokenizer = HighlightsTokenizer) {
  const editor = buildEditorFromExtensions(
    defineExtension({
      dependencies: [
        RichTextExtension,
        HistoryExtension,
        configExtension(CodeHighlightsExtension, {tokenizer}),
      ],
      name: 'code-highlights-test',
    }),
  );
  onTestFinished(() => editor.dispose());
  const root = document.createElement('div');
  editor.setRootElement(root);
  return {editor, root};
}

function appendCode(
  editor: LexicalEditor,
  text: string,
  language?: string,
  theme?: string,
) {
  editor.update(
    () => {
      const code = $createCodeNode(language, theme);
      code.append($createTextNode(text));
      $getRoot().clear().append(code);
    },
    {discrete: true},
  );
}

/**
 * The engine and each theme load on first use; wait for both.
 */
async function settle(theme: string) {
  await Promise.all([loadCodeLanguage('javascript'), loadCodeTheme(theme)]);
  await Promise.resolve();
}

function $getCode() {
  const code = $getRoot().getFirstChild();
  assert($isCodeNode(code));
  return code;
}

describe('CodeHighlightsExtension', () => {
  test('highlights with the theme colors once the theme has loaded', async () => {
    const {editor, root} = createEditor();
    appendCode(editor, 'const x = "a";\n\tfoo()', 'js');
    // The engine and the default theme load on first use, so the text is
    // left as it was until they have.
    expect(isCodeThemeLoaded('one-light')).toBe(false);
    expect(editor.read(() => $getCode().getChildrenSize())).toBe(1);

    await settle('one-light');

    expectHtmlToBeEqual(
      root.innerHTML,
      html`
        <code
          dir="auto"
          spellcheck="false"
          style="background-color: rgb(250, 250, 250); color: rgb(56, 58, 66);"
          data-gutter="1
2"
          data-highlight-language="js"
          data-language="js"
          data-theme="one-light">
          <span style="color: rgb(166, 38, 164);" data-lexical-text="true">
            const
          </span>
          <span style="color: rgb(228, 86, 73);" data-lexical-text="true">
            x
          </span>
          <span style="color: rgb(1, 132, 188);" data-lexical-text="true">
            =
          </span>
          <span style="color: rgb(80, 161, 79);" data-lexical-text="true">
            "a"
          </span>
          <span style="color: rgb(56, 58, 66);" data-lexical-text="true">
            ;
          </span>
          <br />
          <span data-lexical-text="true"></span>
          <span style="color: rgb(64, 120, 242);" data-lexical-text="true">
            foo
          </span>
          <span style="color: rgb(56, 58, 66);" data-lexical-text="true">
            ()
          </span>
        </code>
      `,
    );
  });

  test('loading the theme does not add an undo step', async () => {
    const {editor} = createEditor();
    appendCode(editor, 'let x;', 'javascript', 'github-light');
    await settle('github-light');
    editor.read(() => {
      const [first] = $getCode().getChildren();
      assert($isTextNode(first));
      expect(first.getTextContent()).toBe('let ');
      expect(first.getStyle()).not.toBe('');
    });
    // One undo reverts the code block and its highlighting together.
    editor.dispatchCommand(UNDO_COMMAND, undefined);
    expect(editor.read(() => $getRoot().getTextContent())).toBe('');
  });

  test('keeps the caret at its text offset when highlighting splits the text', async () => {
    const {editor} = createEditor();
    await settle('one-light');
    editor.update(
      () => {
        const code = $createCodeNode('javascript');
        const text = $createTextNode('const x = 1;');
        code.append(text);
        $getRoot().clear().append(code);
        text.select(7, 7);
      },
      {discrete: true},
    );
    editor.update(
      () => {
        const selection = $getSelection();
        assert($isRangeSelection(selection));
        expect($getCode().getChildrenSize()).toBeGreaterThan(1);
        selection.insertText('y');
      },
      {discrete: true},
    );
    expect(editor.read(() => $getRoot().getTextContent())).toBe(
      'const xy = 1;',
    );
  });

  test('marks diff-xxx prefixes and highlights the rest as xxx', async () => {
    const {editor} = createEditor();
    await settle('one-light');
    appendCode(editor, '+let a;\n-let b;', 'diff-javascript');
    editor.read(() => {
      const code = $getCode();
      expect(code.getIsSyntaxHighlightSupported()).toBe(true);
      expect(
        code
          .getChildren()
          .slice(0, 3)
          .map(child => [
            child.getTextContent(),
            $isCodeHighlightNode(child) ? child.getHighlightType() : null,
          ]),
      ).toEqual([
        ['+', 'inserted'],
        ['let ', undefined],
        ['a', undefined],
      ]);
      expect(code.getTextContent()).toBe('+let a;\n-let b;');
    });
  });

  test('colors code in a language without a lexer as plain text', async () => {
    const {editor} = createEditor();
    await settle('one-light');
    appendCode(editor, 'a\n\tb', 'no-such-language');
    editor.read(() => {
      const code = $getCode();
      expect(code.getIsSyntaxHighlightSupported()).toBe(false);
      expect(code.getStyle()).toBe('background-color: #fafafa;color: #383a42;');
      expect(
        code
          .getChildren()
          .map(child => [
            child.getType(),
            $isTextNode(child) ? child.getStyle() : null,
          ]),
      ).toEqual([
        ['code-highlight', 'color:#383a42'],
        ['linebreak', null],
        ['tab', ''],
        ['code-highlight', 'color:#383a42'],
      ]);
    });
  });

  test('highlights a block whose theme is not bundled with the default theme', async () => {
    const {editor} = createEditor();
    await settle('one-light');
    appendCode(editor, 'x', 'javascript', 'no-such-theme');
    editor.read(() => {
      const code = $getCode();
      expect(code.getTheme()).toBe('no-such-theme');
      expect(code.getStyle()).toBe('background-color: #fafafa;color: #383a42;');
    });
  });

  test('defaultLanguage: null leaves the language unset and only splits the text', () => {
    const {editor} = createEditor({
      ...HighlightsTokenizer,
      defaultLanguage: null,
    });
    appendCode(editor, 'a\n\tb');
    editor.read(() => {
      const code = $getCode();
      expect(code.getLanguage()).toBe(undefined);
      expect(code.getChildren().map(child => child.getType())).toEqual([
        'code-highlight',
        'linebreak',
        'tab',
        'code-highlight',
      ]);
    });
  });

  test('stops highlighting while disabled', async () => {
    const {editor} = createEditor();
    await settle('one-light');
    const {output} = getExtensionDependencyFromEditor(
      editor,
      CodeHighlightsExtension,
    );
    output.disabled.value = true;
    appendCode(editor, 'let x;', 'javascript');
    expect(editor.read(() => $getCode().getChildrenSize())).toBe(1);
    output.disabled.value = false;
    editor.update(() => $getCode().markDirty(), {discrete: true});
    expect(editor.read(() => $getCode().getChildrenSize())).toBeGreaterThan(1);
  });
});

describe('Highlights language and theme options', () => {
  test('every listed language has a lexer and is its own normal form', async () => {
    await loadCodeLanguage('javascript');
    for (const [id] of getCodeLanguageOptions()) {
      expect(isSupportedLanguage(id), id).toBe(true);
      expect(isCodeLanguageLoaded(id), id).toBe(true);
      expect(normalizeCodeLanguage(id)).toBe(id);
    }
  });

  test('normalizes aliases to the Shiki-compatible ids', () => {
    expect(normalizeCodeLanguage('js')).toBe('javascript');
    expect(normalizeCodeLanguage('bash')).toBe('shellscript');
    expect(normalizeCodeLanguage('c#')).toBe('csharp');
    expect(normalizeCodeLanguage('unknown')).toBe('unknown');
    expect(isCodeLanguageLoaded('diff-ts')).toBe(true);
  });

  test('lists the bundled themes with readable names', () => {
    const themes = getCodeThemeOptions();
    expect(themes).toContainEqual(['one-light', 'One Light']);
    expect(themes).toContainEqual(['github-dark-dimmed', 'Github Dark Dimmed']);
    expect(loadCodeTheme('constructor')).toBe(undefined);
  });
});
