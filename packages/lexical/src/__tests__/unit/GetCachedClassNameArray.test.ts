/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {type EditorThemeClasses, getCachedClassNameArray} from 'lexical';
import {describe, expect, test} from 'vitest';

describe('getCachedClassNameArray', () => {
  test('memoizes the tokenized class string on the theme object', () => {
    const theme: EditorThemeClasses = {paragraph: 'a  b'};
    const first = getCachedClassNameArray(theme, 'paragraph');
    expect(first).toEqual(['a', 'b']);
    expect(getCachedClassNameArray(theme, 'paragraph')).toBe(first);
    expect(getCachedClassNameArray(theme, 'missing')).toBeUndefined();
  });

  test('tolerates a frozen theme object (no cache, no throw)', () => {
    const theme: EditorThemeClasses = Object.freeze({paragraph: 'a b'});
    expect(getCachedClassNameArray(theme, 'paragraph')).toEqual(['a', 'b']);
    expect(getCachedClassNameArray(theme, 'missing')).toBeUndefined();
    expect('__lexicalClassNameCache' in theme).toBe(false);
  });
});
