/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {octane} from '@octanejs/vite-plugin';
import {defineConfig} from 'vite';

import lexicalMonorepoPlugin from '../../scripts/vite/lexicalMonorepoPlugin';

export default defineConfig({
  plugins: [
    // `requireDirective: true` makes Octane compile a module only when it opens
    // with a leading `@jsxImportSource octane` pragma. That keeps Octane's
    // compiler off of the Lexical package sources the monorepo plugin resolves
    // straight from `packages/*/src` — only our own `*.tsx`/hook modules opt in.
    octane({requireDirective: true}),
    lexicalMonorepoPlugin(),
  ],
});
