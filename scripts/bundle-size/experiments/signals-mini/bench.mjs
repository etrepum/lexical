/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Microbenchmark backing the perf note in ../../README.md. Pass a module
// specifier to benchmark; with no argument it runs @preact/signals-core.
//
//   node scripts/bundle-size/experiments/signals-mini/bench.mjs
//   node scripts/bundle-size/experiments/signals-mini/bench.mjs ./signals.mjs
//
// The prototype is TypeScript, so bundle it first:
//   npx esbuild --bundle --format=esm --platform=node \
//     scripts/bundle-size/experiments/signals-mini/signals.ts \
//     --outfile=/tmp/signals-mini.mjs
//
// These are deliberately write-heavy shapes that exaggerate the difference. A
// real editor produces almost no signal traffic — see the README.

import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';

// @preact/signals-core is a dependency of packages/lexical-extension rather
// than of the workspace root, so resolve it from there.
const specifier =
  process.argv[2] ||
  pathToFileURL(
    createRequire(
      new URL(
        '../../../../packages/lexical-extension/package.json',
        import.meta.url,
      ),
    ).resolve('@preact/signals-core'),
  ).href;
const {batch, computed, effect, signal} = await import(specifier);

const WRITES = 20000;

/** Read a signal purely for its tracking side effect. @param {{value: unknown}} s */
function read(s) {
  // eslint-disable-next-line no-unused-expressions
  s.value;
}

/** @param {string} name @param {() => void} fn */
function time(name, fn) {
  fn(); // warm up
  const start = process.hrtime.bigint();
  fn();
  const elapsed = Number(process.hrtime.bigint() - start) / 1e6;
  console.log(`${name.padEnd(38)} ${elapsed.toFixed(1)} ms`);
}

console.log(`${specifier}\n`);

time('1 signal, 50 effects, 20k writes', () => {
  const s = signal(0);
  const disposers = [];
  for (let i = 0; i < 50; i++) {
    disposers.push(effect(() => read(s)));
  }
  for (let i = 1; i <= WRITES; i++) {
    s.value = i;
  }
  disposers.forEach(dispose => dispose());
});

time('effect with 10 deps, 20k writes', () => {
  const signals = Array.from({length: 10}, (_, i) => signal(i));
  const dispose = effect(() => {
    for (const s of signals) {
      read(s);
    }
  });
  for (let i = 1; i <= WRITES; i++) {
    signals[i % 10].value = i;
  }
  dispose();
});

time('computed chain depth 10, 20k writes', () => {
  const a = signal(0);
  let last = a;
  for (let i = 0; i < 10; i++) {
    const prev = last;
    last = computed(() => prev.value + 1);
  }
  const dispose = effect(() => read(last));
  for (let i = 1; i <= WRITES; i++) {
    a.value = i;
  }
  dispose();
});

time('create + dispose 20k effects', () => {
  const s = signal(0);
  for (let i = 0; i < WRITES; i++) {
    effect(() => read(s))();
  }
});

time('batch of 10 writes, 20k times', () => {
  const signals = Array.from({length: 10}, (_, i) => signal(i));
  const dispose = effect(() => {
    for (const s of signals) {
      read(s);
    }
  });
  for (let i = 1; i <= WRITES; i++) {
    batch(() => {
      for (let j = 0; j < 10; j++) {
        signals[j].value = i + j;
      }
    });
  }
  dispose();
});
