# Lexical Benchmarks

Performance benchmarks for the Lexical core. Run via `pnpm bench` from the
repo root, or scoped to a single project with `--project "bench (bench)"` (data
structure microbenches, node env) or `--project "bench-dom (bench)"` (real-editor
benches, jsdom env).

```sh
pnpm bench                                       # all bench projects
pnpm vitest bench --project "bench (bench)"         # microbenches only
pnpm vitest bench --project "bench-dom (bench)"     # editor cycle benches only
pnpm vitest bench --project "bench (bench)" nodeMap # filter by file substring
```

## Two projects, why?

Microbenches that exercise pure data structures (`Map` vs `GenMap`, etc.)
run in `bench` (node env, no DOM) — fastest startup, cleanest numbers.

Benches that exercise a real Lexical editor (which needs a DOM) run in
`bench-dom` (jsdom env). Files in `__bench__/dom/**` are picked up only
by this project. The two projects share the same `pnpm bench` entry but
otherwise stay isolated to keep microbench results uncontaminated by
jsdom setup cost.

## What benches live here

| File | Project | Measures |
| ---- | ------- | -------- |
| `nodeMap.bench.ts` | `bench` | `Map` vs `GenMap` on clone / typing / paste / iteration / get |
| `getWritable.bench.ts` | `bench` | headless writes, replacement, and selection formatting at fixed document sizes |
| `caretSelection.bench.ts` | `bench` | uncached selection traversal in flat/nested trees and partial formatting near a paragraph's end |
| `bulkSplice.bench.ts` | `bench` | contiguous sibling splicing |
| `largeDocument.bench.ts` / `dom/largeDocument.bench.ts` | `bench` / `bench-dom` | fixed-size edits, replacement, and detached-subtree collection in 1,000- and 10,000-paragraph documents |
| `dom/editorCycle.bench.ts` | `bench-dom` | real `editor.update` cycle cost on a jsdom-backed editor |
| `dom/editorOperations.bench.ts` | `bench-dom` | editor operations: split, format, delete range, paste, select-all |

Helpers shared across files live in `_utils.ts` (microbench) and
`dom/_utils.ts` (real-editor). Use them when you can; extract new helpers
there if your bench file grows beyond a single workload.

For writable-node or selection changes, compare production bundles with the same current
benchmark on every revision:

```sh
node scripts/bench-get-writable.mjs <base-ref> [other-refs...] > results.jsonl
```

The Vitest writable-node benchmark checks both alternating edits during setup
and the final document after timing, so a no-op cannot hide behind the parity
of the last iteration.

The runner applies the shared package-build Babel options (including the
repository's Browserslist targets and production error transform) before
esbuild bundles JavaScript with `target: 'esnext'`. Native class fields are
preserved. The shared Terser settings use ES2021 and two compression passes;
the runner additionally verifies that all development constants are eliminated
before importing the bundle. Every revision uses the same current build options,
so the comparison measures source changes under that configuration, not the
isolated effect of changing build settings. This is a source bundle,
not the published package layout or the compiler annotation pipeline.

The runner also includes the working tree. It verifies each workload before
timing, resets fixture node keys for each workload, rotates revision order
across nine samples, and reports median microseconds per workload run plus
the individual samples. This reduces timing
drift between separate runs. Measurements cover headless updates without DOM
reconciliation; small differences still need to be treated as noise.
Set `LEXICAL_BENCH_FILTER` to a regular expression over the workload name and
`LEXICAL_BENCH_SAMPLES` to a positive integer for longer, focused comparisons.

To compare the checked-out PR directly with main for selection work:

```sh
LEXICAL_BENCH_FILTER='selection traversal|partial formatting|select all and format' \
  LEXICAL_BENCH_SAMPLES=15 node scripts/bench-get-writable.mjs origin/main
```

Selection traversal measures 20 uncached `getNodes()` calls in a read context.
The nested fixture groups every ten paragraphs under another element. Partial
formatting splits the final text sibling, checks its format, and merges the
fragments back in the same update so the document size stays fixed. That timing
includes restoration and commit, not just the split. Run focused comparisons
again in fresh processes before treating small differences as regressions.

The sibling-splice fixture removes 100 or 1,000 middle text siblings, checks
that the two boundary nodes remain, and reinserts the same nodes in the same
update. Timing includes restoration and commit. Document size and reciprocal
links are checked after each sample.

```sh
LEXICAL_BENCH_FILTER='sibling splice' LEXICAL_BENCH_SAMPLES=15 \
  node scripts/bench-get-writable.mjs origin/main
```

## When to add a bench

Add a bench when you are landing a perf change and want to:

- Establish a baseline so future regressions are detectable.
- Justify a non-obvious algorithmic choice with measurements.
- Compare implementation strategies (the `nodeMap.bench.ts` workflow).

Skip a bench for changes whose perf impact is obvious or unmeasurable in
isolation.

## Conventions

**File naming**

- `*.bench.ts` directly under `__bench__/` for node-env microbenches.
- `*.bench.ts` under `__bench__/dom/` for jsdom-env benches.

**Structure** — sweep across realistic sizes; one `test` per scenario;
one `bench` per implementation under test. Vitest 5 provides `bench` through
the test context. Call `.run()` for a single benchmark or `bench.compare()`
for multiple implementations.

```ts
import {test} from 'vitest';

import {buildMap, type FakeNode} from './_utils';
import {MyImpl} from '../MyImpl';

const SIZES = [100, 1000, 10000, 100000] as const;

for (const size of SIZES) {
  test(`size=${size} :: <scenario name>`, async ({bench}) => {
    let oldImpl: Map<string, FakeNode>;
    let newImpl: MyImpl<string, FakeNode>;

    await bench.compare(
      bench(
        'old',
        {
          beforeAll: () => {
            oldImpl = buildMap(size);
          },
        },
        () => {
          // operation under test using oldImpl
        },
      ),
      bench(
        'new',
        {
          beforeAll: () => {
            newImpl = MyImpl.fromMap(buildMap(size));
          },
        },
        () => {
          // operation under test using newImpl
        },
      ),
    );
  });
}
```

**Comparison pattern** — pass both implementations to `bench.compare()` in
one test. Vitest reports their relative performance in a comparison table.

**Setup state** — use the `beforeAll` benchmark option to initialize state
before warmup and again before measured iterations. It does not run for
every iteration. Use `beforeEach` and `afterEach` benchmark options for
per-iteration work outside the timed body. Timing options such as `time`,
`iterations`, and `warmupTime` go in `.run(options)` or the final argument
to `bench.compare()`. Mutations made by the benchmark body accumulate across
iterations unless a hook resets the state.

**DCE prevention** — V8 may eliminate calls whose return values are
unused. Each bench file should declare a module-level scalar sink and
assign into it from the timed body so the call can't be elided:

```ts
let _benchSink: unknown;

test('map lookup', async ({bench}) => {
  await bench('get', () => {
    _benchSink = map.get(someKey);
  }).run();
});
```

For loops, accumulate into a local and assign the local once at the end:

```ts
test('map iteration', async ({bench}) => {
  await bench('iterate', () => {
    let count = 0;
    for (const _ of map) count++;
    _benchSink = count;
  }).run();
});
```

A scalar assignment (rather than an array push) avoids unbounded memory
growth at high iteration counts — e.g. size=100000 `get` can run millions
of iterations per bench cycle.

## Reading results

Vitest reports throughput (ops/sec), latency, percentiles, and relative
performance in each comparison table. Compare implementations within the
same table; mean latency is useful as an absolute number, while high
percentiles indicate tail behavior under GC or compaction.

Sample size and warmup are managed by Vitest. The default heuristics are
fine for stable comparisons between two impls on the same machine; for
absolute numbers you intend to publish, run multiple times and report the
median.

## Limits

- Numbers are **machine-dependent**. Compare runs on the same machine and
  the same load. Don't compare numbers across hardware.
- jsdom DOM ops are slower than real browsers. Treat `bench-dom` numbers
  as relative comparisons, not absolute production estimates.
- Benchmark timings do not run in CI. Benchmark types are checked by
  `pnpm run tsc-test`, which is part of `pnpm run ci-check`.

For large-document GC and reconciliation changes, run the shared fixtures in
both headless and DOM-backed modes:

```sh
LEXICAL_BENCH_FILTER='large document' LEXICAL_BENCH_SAMPLES=15 \
  node scripts/bench-get-writable.mjs origin/main
LEXICAL_BENCH_DOM=1 LEXICAL_BENCH_SAMPLES=15 \
  node scripts/bench-get-writable.mjs origin/main
```

DOM mode installs jsdom before importing the production bundles and runs only
`largeDocument.bench.ts`. It includes DOM reconciliation, but excludes browser
layout, paint, and interactive latency. The same fixtures run in Vitest's
`bench` and `bench-dom` projects. Both modes alternate fixed-length text values,
keep document size constant, and check the resulting model; DOM mode also checks
DOM text, child count, and the node-to-DOM map for leaked entries. Each workload
releases the previous fixture during setup.

The removal fixtures mark the enclosing elements dirty, remove the subtree,
and build its replacement in one committed update. The broad case has two
nested elements under a wrapper and 1,000 paragraphs; the deep stress case has
32 nested elements under a wrapper and 100 paragraphs. These timings include
replacement construction, transforms, GC, and commit, plus reconciliation in DOM
mode. They are not isolated GC timings. Separate first/middle/last edits expose
the distinction between the reconciler's full child walk and suffix fast path.

### Real browser comparisons

The comparison runner can run the large-document fixtures in a Playwright
browser engine instead of jsdom:

```sh
pnpm exec playwright install firefox
LEXICAL_BENCH_BROWSER=firefox LEXICAL_BENCH_SAMPLES=15 \
  node scripts/bench-get-writable.mjs origin/main > firefox-results.jsonl
```

Use `chromium` or `webkit` in both commands to select another engine. The host
must have the engine's system dependencies installed. `LEXICAL_BENCH_BROWSER`
takes precedence over `LEXICAL_BENCH_DOM` and selects the same 14 DOM workloads.
`LEXICAL_BENCH_FILTER` also works in browser mode.

Both main and the working tree use the same production build configuration and
fixtures. The shared measurement loop runs inside the browser page; Playwright
only loads it and receives completed workload results. Output records the
engine version and resolved comparison commit. Revision order rotates between
samples, with correctness checks after each sample.

These timings measure synchronous editor updates, including DOM reconciliation.
The runner yields for animation frames and queued callbacks between samples,
outside timing; it does not measure layout, paint, or interaction latency.
Compare revisions within the same engine and run, rather than comparing absolute
browser timings with Node/jsdom results.
