/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {MdastExtensionConfig} from './index';

import {configExtension, defineExtension} from '@lexical/extension';
import {gfmFromMarkdown, gfmToMarkdown} from 'mdast-util-gfm';
import {gfm} from 'micromark-extension-gfm';

import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  MdastExtension,
} from './index';

export const GfmMdastConfig: MdastExtensionConfig = {
  fromMarkdown: {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  },
  toMarkdown: {
    extensions: [gfmToMarkdown()],
  },
};

export const GfmMdastExtension = /* @__PURE__ */ defineExtension({
  dependencies: [
    /* @__PURE__ */ configExtension(MdastExtension, GfmMdastConfig),
  ],
  name: '@lexical/mdast/gfm',
});

export function $convertFromGfmMarkdownString(markdown: string): void {
  $convertFromMarkdownString(markdown, GfmMdastConfig);
}

export function $convertToGfmMarkdownString(): string {
  return $convertToMarkdownString(GfmMdastConfig);
}

export type {
  MdastExportContext,
  MdastExportHandler,
  MdastExtensionConfig,
  MdastImportContext,
  MdastImportHandler,
  MdastNode,
} from './index';
export {
  $convertFromMarkdownString,
  $convertFromMdast,
  $convertToMarkdownString,
  $convertToMdast,
  exportMarkdown,
  importMarkdown,
  MdastExtension,
} from './index';
