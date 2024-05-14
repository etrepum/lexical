/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type {LexicalPlan} from './types';

import {registerPlainText} from '@lexical/plain-text';

export const PlainTextPlan: LexicalPlan = {
  config: {},
  conflictsWith: ['@lexical/rich-text'],
  name: '@lexical/plain-text',
  register: registerPlainText,
};
