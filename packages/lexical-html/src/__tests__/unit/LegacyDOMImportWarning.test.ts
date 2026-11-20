/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$generateNodesFromDOM} from '@lexical/html';
import {createEditor} from 'lexical';
import {
  captureLegacyDOMImportWarning,
  LEGACY_DOM_IMPORT_WARNING,
} from 'lexical/src/__tests__/utils';
import {expect, test, vi} from 'vitest';

// The global test setup mocks this utility to warn on every call. Exercise
// the real implementation here to verify the warning across editor instances.
vi.unmock('@lexical/internal/warnOnlyOnce');

test('the first legacy DOM import emits only one development warning across editors', () => {
  using warn = captureLegacyDOMImportWarning();
  const first = createEditor();
  const second = createEditor();
  expect(warn).not.toHaveBeenCalled();

  for (const editor of [first, first, second, second]) {
    editor.update(
      () => {
        $generateNodesFromDOM(editor, document.createElement('div'));
      },
      {discrete: true},
    );
  }

  expect(warn).toHaveBeenCalledExactlyOnceWith(LEGACY_DOM_IMPORT_WARNING);
});

test('an expected diagnostic is captured only inside its assertion scope', () => {
  const originalWarn = console.warn;
  {
    using warn = captureLegacyDOMImportWarning();
    console.warn(LEGACY_DOM_IMPORT_WARNING);
    expect(warn).toHaveBeenCalledExactlyOnceWith(LEGACY_DOM_IMPORT_WARNING);
  }
  expect(console.warn).toBe(originalWarn);
});

test('an unrelated warning is forwarded and fails the assertion scope', () => {
  using originalWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  expect(() => {
    using warn = captureLegacyDOMImportWarning();
    console.warn('unrelated warning');
    expect(warn).toHaveBeenCalledExactlyOnceWith('unrelated warning');
  }).toThrow();
  expect(originalWarn).toHaveBeenCalledExactlyOnceWith('unrelated warning');
  expect(console.warn).toBe(originalWarn);
});
