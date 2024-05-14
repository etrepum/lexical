/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {LexicalPlan} from './types';

import {HeadingNode, QuoteNode, registerRichText} from '@lexical/rich-text';

export const RichTextPlan: LexicalPlan = {
  config: {},
  conflictsWith: ['@lexical/plain-text'],
  name: '@lexical/rich-text',
  nodes: [HeadingNode, QuoteNode],
  register: registerRichText,
};
