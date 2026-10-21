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
  loadCodeLanguage,
  Prism,
} from './FacadePrism';

type TokenContent = string | Token | (string | Token)[];

export interface Token {
  type: string;
  alias: string | string[];
  content: TokenContent;
}

export interface Tokenizer {
  /**
   * Language to fall back to when a {@link CodeNode} doesn't carry one.
   * Set to `null` to opt out of the implicit fallback — code blocks
   * without a language stay untouched (no `data-language` attribute, no
   * syntax highlighting) so a markdown round-trip can preserve ``` with
   * no info string.
   */
  defaultLanguage: string | null;
  tokenize(code: string, language?: string): (string | Token)[];
  $tokenize(codeNode: CodeNode, language?: string): LexicalNode[];
}

export const PrismTokenizer: Tokenizer = {
  $tokenize(codeNode: CodeNode, language?: string): LexicalNode[] {
    const lang = language || this.defaultLanguage;
    return lang === null
      ? $plainifyCodeContent(codeNode.getTextContent())
      : $getHighlightNodes(codeNode, lang);
  },
  defaultLanguage: DEFAULT_CODE_LANGUAGE,
  tokenize(code: string, language?: string): (string | Token)[] {
    const fallback = this.defaultLanguage;
    return Prism.tokenize(
      code,
      Prism.languages[language || ''] ||
        (fallback === null ? undefined : Prism.languages[fallback]),
    );
  },
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
  if (node.getLanguage() === undefined && tokenizer.defaultLanguage !== null) {
    node.setLanguage(tokenizer.defaultLanguage);
  }

  const language = node.getLanguage() || tokenizer.defaultLanguage;
  if (language) {
    if (isCodeLanguageLoaded(language)) {
      if (!node.getIsSyntaxHighlightSupported()) {
        node.setIsSyntaxHighlightSupported(true);
      }
    } else {
      if (node.getIsSyntaxHighlightSupported()) {
        node.setIsSyntaxHighlightSupported(false);
      }
      loadCodeLanguage(language, editor, node.getKey());
      return false;
    }
  } else if (node.getIsSyntaxHighlightSupported()) {
    node.setIsSyntaxHighlightSupported(false);
  }
  return true;
}

/**
 * @internal
 * Register only the Prism highlighting transforms and the gutter
 * mutation listener. No keyboard / indent handlers — those are the
 * responsibility of
 * {@link "@lexical/code-core".registerCodeIndentation} /
 * {@link "@lexical/code-core".CodeIndentExtension}.
 *
 * Used by {@link CodePrismExtension}, whose `CodeIndentExtension`
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
 * Register the Prism tokenizer-driven highlighting on the editor along
 * with the indent / Tab / arrow-key keyboard handlers. This function
 * is provided for legacy code that has not upgraded to using
 * {@link CodePrismExtension}.
 */
export function registerCodeHighlighting(
  editor: LexicalEditor,
  tokenizer: Tokenizer = PrismTokenizer,
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

export interface CodePrismConfig {
  /**
   * When true, the Prism code highlighter is not registered on the editor.
   * This signal can be flipped at runtime to enable or disable the
   * highlighter, for example to switch between the Prism and Shiki
   * highlighters without rebuilding the editor.
   */
  disabled: boolean;
  tokenizer: Tokenizer;
}

/**
 * Add code highlighting support for code blocks with Prism.
 *
 * {@link CodeExtension} is a dependency, so the required `CodeNode` and
 * `CodeHighlightNode` nodes are registered automatically.
 * {@link CodeIndentExtension} is also a dependency, so Tab / Shift+Tab
 * and the related keyboard handlers are activated automatically. Set
 * `tabSize` on `CodeIndentExtension` to enable space-indent outdent.
 */
export const CodePrismExtension = defineExtension({
  build: (editor, config) => namedSignals(config),
  config: safeCast<CodePrismConfig>({
    disabled: false,
    tokenizer: PrismTokenizer,
  }),
  dependencies: [CodeExtension, CodeIndentExtension],
  name: '@lexical/code-prism',
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
