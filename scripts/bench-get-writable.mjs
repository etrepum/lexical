/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Compare production bundles in one process, rotating measurement order to
// reduce drift between revisions. Uses the current benchmark for every ref.
// node scripts/bench-get-writable.mjs <base-ref> [other-refs...]
import {transformAsync} from '@babel/core';
import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {cpus, tmpdir} from 'node:os';
import {join, relative, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

import {getBuildBabelOptions} from './shared/buildOptions.mjs';
import {optimizeBenchmark} from './shared/optimizeBenchmark.mjs';
import {
  prepareBenchmarks,
  runEditorBenchmarks,
} from './shared/runEditorBenchmarks.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const refs = process.argv.slice(2);
if (refs.length === 0) {
  throw new Error(
    'Usage: node scripts/bench-get-writable.mjs <base-ref> [other-refs...]',
  );
}
/** @param {string[]} args */
const git = args =>
  execFileSync('git', args, {cwd: root, encoding: 'utf8'}).trim();
/** @type {Array<{label: string, sha: string | null}>} */
const revisions = refs.map(ref => ({
  label: ref,
  sha: git(['rev-parse', '--verify', `${ref}^{commit}`]),
}));
revisions.push({label: 'WORKTREE', sha: null});
const browserEngine = process.env.LEXICAL_BENCH_BROWSER || '';
if (
  browserEngine &&
  !['chromium', 'firefox', 'webkit'].includes(browserEngine)
) {
  throw new Error('LEXICAL_BENCH_BROWSER must be chromium, firefox, or webkit');
}
const useDOM = Boolean(browserEngine) || process.env.LEXICAL_BENCH_DOM === '1';
if (useDOM && !browserEngine) {
  const {JSDOM} = await import('jsdom');
  const {window} = new JSDOM('<!doctype html><html><body></body></html>', {
    pretendToBeVisual: true,
    url: 'https://localhost/',
  });
  for (const name of [
    'window',
    'document',
    'navigator',
    'Node',
    'Element',
    'HTMLElement',
    'DocumentFragment',
    'Text',
    'MutationObserver',
    'DOMParser',
    'Range',
    'getComputedStyle',
  ]) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: name === 'window' ? window : window[name],
    });
  }
}
const benchmarks = (
  useDOM
    ? ['largeDocument']
    : ['getWritable', 'caretSelection', 'bulkSplice', 'largeDocument']
).map(name => `packages/lexical/src/__bench__/${name}.bench.ts`);
const sampleCount = Number(process.env.LEXICAL_BENCH_SAMPLES || 9);
if (!Number.isSafeInteger(sampleCount) || sampleCount < 1) {
  throw new Error('LEXICAL_BENCH_SAMPLES must be a positive integer');
}
const temporary = await mkdtemp(join(tmpdir(), 'lexical-get-writable-'));
const expectedWorkloads = useDOM ? 14 : 34;
const options = {
  browser: Boolean(browserEngine),
  filter: process.env.LEXICAL_BENCH_FILTER || '',
  labels: revisions.map(({label}) => label),
  sampleCount,
};
/** @type {import('playwright').Browser | undefined} */
let browser;
/** @type {import('node:http').Server | undefined} */
let server;

try {
  const variants = [];
  const bundles = [];
  for (let i = 0; i < revisions.length; i++) {
    const {sha} = revisions[i];
    // Include working-tree edits when deciding which files to load from git.
    const changed = new Set(
      sha === null
        ? []
        : git(['diff', '--name-only', sha, '--', 'packages']).split('\n'),
    );
    const outfile = join(temporary, `${i}.mjs`);
    const result = await build({
      bundle: true,
      define: {'process.env.NODE_ENV': '"production"'},
      format: 'esm',
      outfile,
      platform: browserEngine ? 'browser' : 'node',
      plugins: [
        {
          name: 'revision-benchmark',
          setup(bundler) {
            bundler.onResolve(
              {
                filter:
                  /(getWritable|caretSelection|bulkSplice|largeDocument)\.bench\.ts$/,
              },
              args => ({
                path: join(root, args.path),
                sideEffects: true,
              }),
            );
            bundler.onResolve({filter: /^vitest$/}, () => ({
              namespace: 'benchmark',
              path: 'vitest',
            }));
            bundler.onLoad({filter: /.*/, namespace: 'benchmark'}, () => ({
              contents: `
          export const cases = [];
          export const pendingTests = [];
          let group;
          export function describe(name, run) {group = name; run();}
          export function test(name, runTest) {
            const prefix = group;
            pendingTests.push(runTest({
              bench(name, options, run) {
                return {run() {
                  cases.push({
                    name: prefix + ' / ' + name,
                    run,
                    setup: options.beforeAll,
                    teardown: options.afterAll,
                  });
                }};
              },
            }));
          }
        `,
              loader: 'js',
            }));
            bundler.onLoad({filter: /\.(ts|tsx|mjs|js)$/}, async args => {
              if (args.path.includes('/node_modules/')) return;
              const path = relative(root, args.path);
              const source =
                changed.has(path) && !path.includes('/__bench__/')
                  ? git(['show', `${sha}:${path}`])
                  : await readFile(args.path, 'utf8');
              const transformed = await transformAsync(source, {
                ...getBuildBabelOptions(true),
                filename: args.path,
              });
              if (transformed === null || !transformed.code)
                throw new Error(`No Babel output for ${path}`);
              return {contents: transformed.code, loader: 'js'};
            });
          },
        },
      ],
      stdin: {
        contents:
          benchmarks.map(path => `import './${path}';`).join('\n') +
          `export {cases, pendingTests} from 'vitest'; export {resetRandomKey} from './packages/lexical/src/index.ts';`,
        loader: 'js',
        resolveDir: root,
      },
      target: 'esnext',
      tsconfig: join(root, 'tsconfig.test.json'),
      write: false,
    });
    const {code, eliminatedDevConstants} = await optimizeBenchmark(
      result.outputFiles[0].text,
    );
    await writeFile(outfile, code);
    bundles.push({bytes: Buffer.byteLength(code), eliminatedDevConstants});
    if (!browserEngine) {
      variants.push(
        await prepareBenchmarks(
          await import(pathToFileURL(outfile).href),
          expectedWorkloads,
        ),
      );
    }
  }
  if (browserEngine) {
    const engines = await import('playwright');
    browser = await engines[
      /** @type {'chromium' | 'firefox' | 'webkit'} */ (browserEngine)
    ].launch({headless: true});
  }
  console.log(
    JSON.stringify({
      browserVersion: browser && browser.version(),
      bundles,
      cpu: cpus()[0].model,
      environment: browserEngine || (useDOM ? 'jsdom' : 'headless'),
      node: process.version,
      optimizer: 'babel-preset-env + terser (ecma 2021, passes 2)',
      revisions,
      sampleCount,
    }),
  );
  const report = (/** @type {unknown} */ result) =>
    console.log(JSON.stringify(result));
  if (browser) {
    const modules = new Map();
    for (let i = 0; i < revisions.length; i++) {
      modules.set(
        `/${i}.mjs`,
        await readFile(join(temporary, `${i}.mjs`), 'utf8'),
      );
    }
    modules.set(
      '/runner.mjs',
      await readFile(
        new URL('./shared/runEditorBenchmarks.mjs', import.meta.url),
        'utf8',
      ),
    );
    const benchmarkServer = (server = createServer((request, response) => {
      const url = request.url || '/';
      const body =
        url === '/'
          ? '<!doctype html><html><body></body></html>'
          : modules.get(url);
      response.writeHead(body === undefined ? 404 : 200, {
        'Content-Type': url === '/' ? 'text/html' : 'text/javascript',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      });
      response.end(body);
    }));
    await new Promise(
      /** @param {(value?: unknown) => void} done */ done =>
        benchmarkServer.listen(0, '127.0.0.1', done),
    );
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('No benchmark server address');
    const startupTimeout = setTimeout(() => {
      console.error(
        'Browser page startup exceeded 30 seconds; closing browser.',
      );
      if (browser) void browser.close();
    }, 30_000);
    let page;
    try {
      page = await browser.newPage();
    } finally {
      clearTimeout(startupTimeout);
    }
    await page.exposeFunction('reportBenchmark', report);
    await page.goto(`http://127.0.0.1:${address.port}`);
    await page.evaluate(
      async ({
        options: browserOptions,
        expectedWorkloads: workloadCount,
        count,
      }) => {
        const runnerURL = '/runner.mjs';
        const runner = await import(runnerURL);
        const browserVariants = [];
        for (let i = 0; i < count; i++) {
          browserVariants.push(
            await runner.prepareBenchmarks(
              await import(`/${i}.mjs`),
              workloadCount,
            ),
          );
        }
        await runner.runEditorBenchmarks(
          browserVariants,
          browserOptions,
          Reflect.get(window, 'reportBenchmark'),
        );
      },
      {count: revisions.length, expectedWorkloads, options},
    );
  } else {
    await runEditorBenchmarks(variants, options, report);
  }
} finally {
  if (browser) await browser.close();
  const benchmarkServer = server;
  if (benchmarkServer)
    await new Promise((done, reject) =>
      benchmarkServer.close(error => (error ? reject(error) : done(undefined))),
    );
  await rm(temporary, {force: true, recursive: true});
}
