/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {vi} from 'vitest';

import {runHandledSelectionCommandInsertTextTests} from './handledSelectionCommandInsertText';

// `vi.mock` is hoisted above all imports, so LexicalEvents.ts sees Chrome on
// macOS, where the insertText accepts a pending text replacement.
vi.mock('lexical/src/environment', async importOriginal => ({
  ...(await importOriginal<typeof import('lexical/src/environment')>()),
  CAN_USE_BEFORE_INPUT: true,
  IS_APPLE: true,
  IS_CHROME: true,
  IS_IOS: false,
}));

runHandledSelectionCommandInsertTextTests({
  dropsInsertText: true,
  isApple: true,
});
