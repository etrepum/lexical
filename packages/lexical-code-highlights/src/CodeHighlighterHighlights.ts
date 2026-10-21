/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $plainifyCodeContent,
  CodeExtension,
  CodeHighlightNode,
  CodeIndentExtension,
  CodeNode,
  DEFAULT_CODE_LANGUAGE,
  registerCodeHighlighter,
  registerCodeIndentation,
} from '@lexical/code-core';
import {effect, namedSignals} from '@lexical/extension';
import invariant from '@lexical/internal/invariant';
import {
  defineExtension,
  type LexicalEditor,
  type LexicalNode,
  mergeRegister,
  safeCast,
} from 'lexical';

import {
  $getHighlightNodes,
  isCodeEngineSettled,
  isCodeLanguageLoaded,
  isCodeLanguageSupported,
  isCodeThemeLoaded,
  isCodeThemeSupported,
  loadCodeLanguage,
  loadCodeTheme,
} from './FacadeHighlights';

export interface Tokenizer {
  /**
   * Language to fall back to when a {@link CodeNode} doesn't carry one.
   * Set to `null` to opt out of the implicit fallback — code blocks
   * without a language stay untouched (no `data-language` attribute, no
   * syntax highlighting) so a markdown round-trip can preserve ``` with
   * no info string.
   */
  defaultLanguage: string | null;
  /**
   * Theme for code blocks that don't carry one, and for those whose theme
   * is not bundled with Highlights.
   */
  defaultTheme: string;
  $tokenize: (
    this: Tokenizer,
    codeNode: CodeNode,
    language?: string,
  ) => LexicalNode[];
}

const DEFAULT_CODE_THEME = 'one-light';

function getCodeTheme(tokenizer: Tokenizer, codeNode: CodeNode): string {
  const theme = codeNode.getTheme();
  return theme && isCodeThemeSupported(theme) ? theme : tokenizer.defaultTheme;
}

export const HighlightsTokenizer: Tokenizer = {
  $tokenize(
    this: Tokenizer,
    codeNode: CodeNode,
    language?: string,
  ): LexicalNode[] {
    const lang = language || this.defaultLanguage;
    return lang === null
      ? $plainifyCodeContent(codeNode.getTextContent())
      : $getHighlightNodes(codeNode, lang, getCodeTheme(this, codeNode));
  },
  defaultLanguage: DEFAULT_CODE_LANGUAGE,
  defaultTheme: DEFAULT_CODE_THEME,
};

function $prepareCodeNode(
  editor: LexicalEditor,
  tokenizer: Tokenizer,
  node: CodeNode,
): boolean {
  // When new code block inserted it might not have language selected.
  // Tokenizers configured with `defaultLanguage: null` opt out of the
  // implicit fallback — leave the node unset and skip highlighting so
  // markdown round-trips ``` (no info string) without injecting one.
  let language = node.getLanguage();
  if (!language && tokenizer.defaultLanguage !== null) {
    language = tokenizer.defaultLanguage;
    node.setLanguage(language);
  }
  if (!node.getTheme()) {
    node.setTheme(tokenizer.defaultTheme);
  }

  if (!language) {
    // Code without a language is only split, which needs neither the
    // engine nor a theme, so don't defer splitting it on their loads.
    if (node.getIsSyntaxHighlightSupported()) {
      node.setIsSyntaxHighlightSupported(false);
    }
    return true;
  }
  // Every language is built into the engine, which is loaded on first use.
  // If it can't load (no WebAssembly SIMD, or a CSP that forbids
  // WebAssembly), code is left uncolored. Code in a language without a
  // lexer is colored as plain text.
  const nodeKey = node.getKey();
  const isSettled =
    isCodeEngineSettled() ||
    !loadCodeLanguage(
      isCodeLanguageSupported(language) ? language : 'plaintext',
      editor,
      nodeKey,
    );
  const isSupported = isCodeLanguageLoaded(language);
  if (node.getIsSyntaxHighlightSupported() !== isSupported) {
    node.setIsSyntaxHighlightSupported(isSupported);
  }
  const theme = getCodeTheme(tokenizer, node);
  const isThemeReady =
    isCodeThemeLoaded(theme) || !loadCodeTheme(theme, editor, nodeKey);
  return isSettled && isThemeReady;
}

/**
 * @internal
 * Register only the Highlights highlighting transforms and the gutter
 * mutation listener. No keyboard / indent handlers — those are the
 * responsibility of
 * {@link "@lexical/code-core".registerCodeIndentation} /
 * {@link "@lexical/code-core".CodeIndentExtension}.
 */
function registerHighlightingOnly(
  editor: LexicalEditor,
  tokenizer: Tokenizer,
): () => void {
  return registerCodeHighlighter(editor, {
    $prepare: node => $prepareCodeNode(editor, tokenizer, node),
    $tokenize: node =>
      tokenizer.$tokenize(
        node,
        (node.getLanguage() || tokenizer.defaultLanguage) ?? undefined,
      ),
  });
}

/**
 * Register the Highlights tokenizer-driven highlighting on the editor along
 * with the indent / Tab / arrow-key keyboard handlers. This function
 * is provided for code that does not use extensions; prefer
 * {@link CodeHighlightsExtension}.
 */
export function registerCodeHighlighting(
  editor: LexicalEditor,
  tokenizer: Tokenizer = HighlightsTokenizer,
): () => void {
  invariant(
    editor.hasNodes([CodeNode, CodeHighlightNode]),
    'CodeHighlightPlugin: CodeNode or CodeHighlightNode not registered on editor',
  );
  return mergeRegister(
    registerHighlightingOnly(editor, tokenizer),
    registerCodeIndentation(editor),
  );
}

export interface CodeHighlightsConfig {
  /**
   * When true, the Highlights code highlighter is not registered on the
   * editor. This signal can be flipped at runtime to enable or disable the
   * highlighter, for example to switch between the Prism, Shiki and
   * Highlights highlighters without rebuilding the editor.
   */
  disabled: boolean;
  tokenizer: Tokenizer;
}

/**
 * Add code highlighting support for code blocks with
 * [Highlights](https://www.npmjs.com/package/@pierre/highlights).
 *
 * {@link CodeExtension} is a dependency, so the required `CodeNode` and
 * `CodeHighlightNode` nodes are registered automatically.
 * {@link CodeIndentExtension} is also a dependency, so Tab / Shift+Tab
 * and the related keyboard handlers are activated automatically. Set
 * `tabSize` on `CodeIndentExtension` to enable space-indent outdent.
 */
export const CodeHighlightsExtension = defineExtension({
  build: (editor, config) => namedSignals(config),
  config: safeCast<CodeHighlightsConfig>({
    disabled: false,
    tokenizer: HighlightsTokenizer,
  }),
  dependencies: [CodeExtension, CodeIndentExtension],
  name: '@lexical/code-highlights',
  register: (editor, config, state) => {
    const stores = state.getOutput();
    return effect(() => {
      if (stores.disabled.value) {
        return;
      }
      return registerHighlightingOnly(editor, stores.tokenizer.value);
    });
  },
});
