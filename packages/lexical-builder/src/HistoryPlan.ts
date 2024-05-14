/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {
  createEmptyHistoryState,
  type HistoryState,
  registerHistory,
} from '@lexical/history';

import {LexicalPlan} from './types';

export interface HistoryConfig {
  delay: number;
  createInitialHistoryState: () => HistoryState;
}

export const HistoryPlan: LexicalPlan<HistoryConfig> = {
  config: {createInitialHistoryState: createEmptyHistoryState, delay: 300},
  name: '@lexical/builder/HistoryPlan',
  register(editor, {delay, createInitialHistoryState}) {
    return registerHistory(editor, createInitialHistoryState(), delay);
  },
};
