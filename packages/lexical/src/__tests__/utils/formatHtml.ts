/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import prettier from '@prettier/sync';
import * as path from 'node:path';
import {expect} from 'vitest';

// Keep the original configuration lookup path, including file-specific
// overrides. Import this module directly: re-exporting it from index.tsx would
// start a formatter worker even for tests that never compare HTML.
const prettierConfig = prettier.resolveConfig(
  path.join(__dirname, 'index.tsx'),
);

export function expectHtmlToBeEqual(actual: string, expected: string): void {
  expect(prettifyHtml(actual)).toBe(prettifyHtml(expected));
}

export function prettifyHtml(s: string): string {
  return prettier.format(s.replace(/\n/g, ''), {
    ...prettierConfig,
    parser: 'html',
  });
}
