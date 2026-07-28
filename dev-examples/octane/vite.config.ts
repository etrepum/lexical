/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {octane} from '@octanejs/vite-plugin';
import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {build, defineConfig, type Plugin, type ResolvedConfig} from 'vite';

import lexicalMonorepoPlugin from '../../scripts/vite/lexicalMonorepoPlugin';

const root = dirname(fileURLToPath(import.meta.url));
const SSR_TMP = join(root, '.octane-ssr');

/**
 * Static prerendering (SSG): after the normal client `vite build`, run a nested
 * SSR build of `entry-server`, render the page + editor content to HTML, and
 * splice it into the emitted `index.html`. That way a single `vite build` (what
 * `build-dev-examples` runs) produces a prerendered, hydrating page. The nested
 * SSR build reuses this same config file, so an env flag guards against infinite
 * recursion.
 */
function octanePrerenderPlugin(): Plugin {
  let config: ResolvedConfig;
  return {
    apply: 'build',
    async closeBundle() {
      // Only the outer client build prerenders; skip inside the SSR sub-build,
      // and skip SSR builds generally (they emit no index.html).
      if (process.env.OCTANE_SSR_BUILD === '1' || config.build.ssr) {
        return;
      }
      // `build.outDir` may be relative (default `dist`) or absolute (the path
      // `build-dev-examples` passes); resolve it against the config root.
      const indexPath = resolve(config.root, config.build.outDir, 'index.html');
      if (!existsSync(indexPath)) {
        return;
      }
      process.env.OCTANE_SSR_BUILD = '1';
      try {
        await build({
          base: config.base,
          build: {
            emptyOutDir: true,
            outDir: SSR_TMP,
            ssr: 'src/entry-server.tsx',
          },
          configFile: fileURLToPath(import.meta.url),
          logLevel: 'warn',
          mode: config.mode,
          root,
        });
        const {render} = await import(
          pathToFileURL(join(SSR_TMP, 'entry-server.js')).href
        );
        const {html, css} = await render();
        const out = readFileSync(indexPath, 'utf8')
          .replace('<!--ssr-outlet-->', html)
          .replace('<!--ssr-css-->', css ? `<style>${css}</style>` : '');
        writeFileSync(indexPath, out);
      } finally {
        delete process.env.OCTANE_SSR_BUILD;
        rmSync(SSR_TMP, {force: true, recursive: true});
      }
    },
    configResolved(resolved) {
      config = resolved;
    },
    name: 'octane-prerender',
  };
}

export default defineConfig({
  plugins: [
    // `requireDirective: true` makes Octane compile a module only when it opens
    // with a leading `@jsxImportSource octane` pragma. That keeps Octane's
    // compiler off of the Lexical package sources the monorepo plugin resolves
    // straight from `packages/*/src` — only our own `*.tsx`/hook modules opt in.
    octane({requireDirective: true}),
    lexicalMonorepoPlugin(),
    octanePrerenderPlugin(),
  ],
});
