/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export {
  type CodeHighlightsConfig,
  CodeHighlightsExtension,
  HighlightsTokenizer,
  registerCodeHighlighting,
  type Tokenizer,
} from './CodeHighlighterHighlights';
export {
  getCodeLanguageOptions,
  getCodeThemeOptions,
  isCodeLanguageLoaded,
  isCodeThemeLoaded,
  loadCodeLanguage,
  loadCodeTheme,
  normalizeCodeLanguage,
} from './FacadeHighlights';
