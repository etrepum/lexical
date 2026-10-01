/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type * as LexicalForExtension from '../../lexicalForExtension';
import type * as DevtoolsCore from '@lexical/devtools-core';

import * as esbuild from 'esbuild';
import * as path from 'node:path';

const PACKAGE_ROOT = path.resolve(__dirname, '../../..');
const REPO_ROOT = path.resolve(PACKAGE_ROOT, '../..');

export interface ExtensionRealm {
  core: typeof DevtoolsCore;
  shim: typeof LexicalForExtension;
}

/**
 * Bundle `entry` the way wxt.config.ts bundles the extension's injected
 * script -- with its own copy of Lexical, wrapped by `lexicalForExtension` --
 * and evaluate it in the test's window.
 *
 * The result shares nothing with the copy of Lexical the test file imported,
 * so it sees the test's editors exactly as the extension sees a page's.
 */
export async function loadExtensionRealm(): Promise<ExtensionRealm> {
  const shim = path.join(PACKAGE_ROOT, 'src/lexicalForExtension.ts');
  const result = await esbuild.build({
    bundle: true,
    define: {
      __DEV__: 'true',
      'process.env.LEXICAL_VERSION': JSON.stringify('extension-realm'),
      'process.env.NODE_ENV': JSON.stringify('development'),
    },
    format: 'iife',
    globalName: '__lexicalExtensionRealm',
    jsx: 'automatic',
    logLevel: 'silent',
    plugins: [
      {
        name: 'lexical-for-extension',
        setup(build) {
          // Mirrors the `resolve.alias` entries in wxt.config.ts.
          build.onResolve({filter: /lexical$/}, () => ({path: shim}));
          build.onResolve({filter: /^lexicalOriginal$/}, () => ({
            path: path.join(REPO_ROOT, 'packages/lexical/src/index.ts'),
          }));
        },
      },
    ],
    stdin: {
      contents: `
        export * as core from '@lexical/devtools-core';
        export * as shim from ${JSON.stringify(shim)};
      `,
      loader: 'ts',
      resolveDir: PACKAGE_ROOT,
    },
    tsconfig: path.join(REPO_ROOT, 'tsconfig.json'),
    write: false,
  });
  // eslint-disable-next-line no-new-func
  return new Function(
    `${result.outputFiles[0].text}\nreturn __lexicalExtensionRealm;`,
  )();
}
