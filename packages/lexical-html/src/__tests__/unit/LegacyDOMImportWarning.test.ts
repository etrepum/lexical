/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$generateNodesFromDOM} from '@lexical/html';
import {createEditor} from 'lexical';
import {expect, test, vi} from 'vitest';

// The global test setup mocks this utility to warn on every call. Exercise
// the real implementation here to verify the warning across editor instances.
vi.unmock('@lexical/internal/warnOnlyOnce');

test('the first legacy DOM import emits only one development warning across editors', () => {
  using warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const first = createEditor();
  const second = createEditor();
  expect(warn).not.toHaveBeenCalled();

  for (const editor of [first, second]) {
    editor.update(
      () => {
        $generateNodesFromDOM(editor, document.createElement('div'));
      },
      {discrete: true},
    );
  }

  expect(warn).toHaveBeenCalledExactlyOnceWith(
    expect.stringContaining('Migrate to DOMImportExtension'),
  );
});
