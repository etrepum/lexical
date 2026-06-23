/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {ComarkElement, ComarkNode, ComarkTree} from 'comark';

import {ComarkExtension} from './ComarkExtension';
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

export {
  BOLD,
  CODE,
  COMARK_ELEMENT_TRANSFORMERS,
  COMARK_INLINE_TRANSFORMERS,
  COMARK_TEXT_FORMAT_TRANSFORMERS,
  COMARK_TRANSFORMERS,
  ComarkExtension,
  HEADING,
  INLINE_CODE,
  ITALIC,
  LINE_BREAK,
  LINK,
  LIST,
  QUOTE,
  STRIKETHROUGH,
};

export type {ComarkExportOptions} from './ComarkExport';
export type {
  ComarkConfig,
  ComarkExtensionOutput,
  ComarkImportApply,
  ParseMarkdownOptions,
  RenderMarkdownRunOptions,
} from './ComarkExtension';
export type {ComarkGenerateNodesOptions} from './ComarkImport';
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
