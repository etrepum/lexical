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
import {
  defineExtension,
  type LexicalEditor,
  type LexicalNode,
  mergeRegister,
  safeCast,
} from 'lexical';

import {
  $getHighlightNodes,
  isCodeLanguageLoaded,
  isCodeThemeLoaded,
  loadCodeLanguage,
  loadCodeTheme,
} from './FacadeShiki';

export interface Tokenizer {
  /**
   * Language to fall back to when a {@link CodeNode} doesn't carry one.
   * Set to `null` to opt out of the implicit fallback — code blocks
   * without a language stay untouched (no `data-language` attribute, no
   * syntax highlighting) so a markdown round-trip can preserve ``` with
   * no info string.
   */
  defaultLanguage: string | null;
  defaultTheme: string;
  $tokenize: (
    this: Tokenizer,
    codeNode: CodeNode,
    language?: string,
  ) => LexicalNode[];
}

const DEFAULT_CODE_THEME = 'one-light';

export const ShikiTokenizer: Tokenizer = {
  $tokenize(
    this: Tokenizer,
    codeNode: CodeNode,
    language?: string,
  ): LexicalNode[] {
    const lang = language || this.defaultLanguage;
    return lang === null
      ? $plainifyCodeContent(codeNode.getTextContent())
      : $getHighlightNodes(codeNode, lang);
  },
  defaultLanguage: DEFAULT_CODE_LANGUAGE,
  defaultTheme: DEFAULT_CODE_THEME,
};

function $prepareCodeNode(
  editor: LexicalEditor,
  tokenizer: Tokenizer,
  node: CodeNode,
): boolean {
  const nodeKey = node.getKey();

  // When new code block inserted it might not have language selected.
  // Tokenizers configured with `defaultLanguage: null` opt out of the
  // implicit fallback — leave the node unset and skip highlighting so
  // markdown round-trips ``` (no info string) without injecting one.
  let language = node.getLanguage();
  if (!language && tokenizer.defaultLanguage !== null) {
    language = tokenizer.defaultLanguage;
    node.setLanguage(language);
  }

  let theme = node.getTheme();
  if (!theme) {
    theme = tokenizer.defaultTheme;
    node.setTheme(theme);
  }

  // dynamic import of themes
  let inFlight = false;
  if (!isCodeThemeLoaded(theme)) {
    loadCodeTheme(theme, editor, nodeKey);
    // Only the highlight path (a resolved language) consumes the theme. With
    // no language the text is plainified, which needs no theme, so don't defer
    // the split on a theme load that won't be used — otherwise a code block
    // with `defaultLanguage: null` stays an unsplit TextNode until the theme
    // happens to finish loading.
    if (language) {
      inFlight = true;
    }
  }

  // dynamic import of languages
  if (language) {
    if (isCodeLanguageLoaded(language)) {
      if (!node.getIsSyntaxHighlightSupported()) {
        node.setIsSyntaxHighlightSupported(true);
      }
    } else {
      const loadingTask = loadCodeLanguage(language, editor, nodeKey);
      // if the language is not supported, the download will not occur
      if (!loadingTask && node.getIsSyntaxHighlightSupported()) {
        node.setIsSyntaxHighlightSupported(false);
      }
      inFlight = true;
    }
  } else if (node.getIsSyntaxHighlightSupported()) {
    node.setIsSyntaxHighlightSupported(false);
  }

  return !inFlight;
}

/**
 * @internal
 * Register only the Shiki highlighting transforms and the gutter
 * mutation listener. No keyboard / indent handlers — those are the
 * responsibility of
 * {@link "@lexical/code-core".registerCodeIndentation} /
 * {@link "@lexical/code-core".CodeIndentExtension}.
 *
 * Used by {@link CodeShikiExtension}, whose `CodeIndentExtension`
 * dependency handles the indent side. The legacy
 * {@link registerCodeHighlighting} wrapper combines this helper with
 * `registerCodeIndentation` for direct callers that want the original
 * single-call setup.
 *
 * Exported for use by the package's own unit tests; not re-exported
 * from the package entry point.
 */
export function registerHighlightingOnly(
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
 * Register the Shiki tokenizer-driven highlighting on the editor along
 * with the indent / Tab / arrow-key keyboard handlers. This function
 * is provided for legacy code that has not upgraded to using
 * {@link CodeShikiExtension}.
 */
export function registerCodeHighlighting(
  editor: LexicalEditor,
  tokenizer: Tokenizer = ShikiTokenizer,
): () => void {
  if (!editor.hasNodes([CodeNode, CodeHighlightNode])) {
    throw new Error(
      'CodeHighlightPlugin: CodeNode or CodeHighlightNode not registered on editor',
    );
  }
  return mergeRegister(
    registerHighlightingOnly(editor, tokenizer),
    registerCodeIndentation(editor),
  );
}

export interface CodeShikiConfig {
  /**
   * When true, the Shiki code highlighter is not registered on the editor.
   * This signal can be flipped at runtime to enable or disable the
   * highlighter, for example to switch between the Prism and Shiki
   * highlighters without rebuilding the editor.
   */
  disabled: boolean;
  tokenizer: Tokenizer;
}

/**
 * Add code highlighting support for code blocks with Shiki.
 *
 * {@link CodeExtension} is a dependency, so the required `CodeNode` and
 * `CodeHighlightNode` nodes are registered automatically.
 * {@link CodeIndentExtension} is also a dependency, so Tab / Shift+Tab
 * and the related keyboard handlers are activated automatically. Set
 * `tabSize` on `CodeIndentExtension` to enable space-indent outdent.
 */
export const CodeShikiExtension = defineExtension({
  build: (editor, config) => namedSignals(config),
  config: safeCast<CodeShikiConfig>({
    disabled: false,
    tokenizer: ShikiTokenizer,
  }),
  dependencies: [CodeExtension, CodeIndentExtension],
  name: '@lexical/code-shiki',
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
