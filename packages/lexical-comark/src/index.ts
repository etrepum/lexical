/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {ComarkExportOptions} from './ComarkExport';
import type {ComarkImportOptions} from './ComarkImport';
import type {
  ComarkElement,
  ComarkNode,
  ComarkTree,
  ParseOptions,
  RenderMarkdownOptions,
} from 'comark';
import type {LexicalEditor} from 'lexical';

import {createParse} from 'comark';
import {renderMarkdown} from 'comark/render';

import {$exportComarkTree} from './ComarkExport';
import {$importComarkTree} from './ComarkImport';
import {registerComarkShortcuts} from './ComarkShortcuts';
import {
  BOLD,
  CODE,
  COMARK_ELEMENT_TRANSFORMERS,
  COMARK_INLINE_TRANSFORMERS,
  COMARK_TEXT_FORMAT_TRANSFORMERS,
  COMARK_TRANSFORMERS,
  HEADING,
  INLINE_CODE,
  ITALIC,
  LINE_BREAK,
  LINK,
  LIST,
  QUOTE,
  STRIKETHROUGH,
} from './ComarkTransformers';

export interface ConvertFromComarkOptions extends ComarkImportOptions {
  /** Options forwarded to comark's parser (`autoClose`, `html`, `plugins`...). */
  parseOptions?: ParseOptions;
}

export interface ConvertToComarkOptions extends ComarkExportOptions {
  /** Options forwarded to comark's `renderMarkdown` (frontmatter style...). */
  renderOptions?: RenderMarkdownOptions;
}

/**
 * Parse a markdown string with comark and import the resulting document into
 * the editor, replacing its contents. The selection is moved to the start.
 *
 * comark's parser is asynchronous, so this returns a Promise. The actual node
 * construction runs synchronously inside an `editor.update()`.
 */
export async function convertFromComarkString(
  editor: LexicalEditor,
  markdown: string,
  options: ConvertFromComarkOptions = {},
): Promise<void> {
  const parse = createParse(options.parseOptions);
  const tree = await parse(markdown);
  editor.update(
    () => {
      $importComarkTree(tree, options);
    },
    {discrete: true},
  );
}

/**
 * Export the editor contents (or a single node subtree) to a markdown string
 * using comark's renderer.
 */
export async function convertToComarkString(
  editor: LexicalEditor,
  options: ConvertToComarkOptions = {},
): Promise<string> {
  const tree = editor.read(() => $exportComarkTree(options));
  return renderMarkdown(tree, options.renderOptions);
}

export {
  $exportComarkTree,
  $importComarkTree,
  BOLD,
  CODE,
  COMARK_ELEMENT_TRANSFORMERS,
  COMARK_INLINE_TRANSFORMERS,
  COMARK_TEXT_FORMAT_TRANSFORMERS,
  COMARK_TRANSFORMERS,
  HEADING,
  INLINE_CODE,
  ITALIC,
  LINE_BREAK,
  LINK,
  LIST,
  QUOTE,
  registerComarkShortcuts,
  STRIKETHROUGH,
};

export type {ComarkExportOptions} from './ComarkExport';
export type {ComarkImportOptions} from './ComarkImport';
export type {ComarkShortcutOptions} from './ComarkShortcuts';
export type {
  ComarkElementTransformer,
  ComarkExportContext,
  ComarkImportContext,
  ComarkInlineTransformer,
  ComarkTextFormatTransformer,
  ComarkTransformer,
} from './ComarkTransformers';
export type {ComarkTransformersByType} from './utils';
export type {ComarkElement, ComarkNode, ComarkTree};
