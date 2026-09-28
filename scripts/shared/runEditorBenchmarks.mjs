/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * @typedef {{name: string, run: () => void, setup: () => void,
 * teardown: () => void, resetKeys?: () => void}} Workload
 */

/**
 * @param {{cases: Workload[], pendingTests: Promise<void>[], resetRandomKey: () => void}} module
 * @param {number} expectedWorkloads
 */
export async function prepareBenchmarks(module, expectedWorkloads) {
  await Promise.all(module.pendingTests);
  if (module.cases.length !== expectedWorkloads) {
    throw new Error(
      `Expected ${expectedWorkloads} workloads, got ${module.cases.length}`,
    );
  }
  for (const workload of module.cases)
    workload.resetKeys = module.resetRandomKey;
  return module.cases;
}

/** @param {number[]} values */
const median = values =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

/** @param {() => void} run @param {number} milliseconds */
function measure(run, milliseconds) {
  const start = performance.now();
  let count = 0;
  let elapsed;
  do {
    run();
    count++;
    elapsed = performance.now() - start;
  } while (elapsed < milliseconds);
  return (elapsed * 1000) / count;
}

/**
 * Run inside the measured engine. Browser automation only loads modules and
 * receives completed results; it never sits inside a timed operation.
 * @param {Workload[][]} variants
 * @param {{labels: string[], filter: string, sampleCount: number, browser: boolean}} options
 * @param {(result: {name: string, microseconds: Record<string, number>, samples: Record<string, number[]>}) => unknown} report
 */
export async function runEditorBenchmarks(variants, options, report) {
  const filter = new RegExp(options.filter);
  const pause = async () => {
    if (options.browser) {
      // Let queued callbacks and rendering finish outside the timed sample.
      await new Promise(resolve =>
        requestAnimationFrame(() => setTimeout(resolve, 0)),
      );
    }
  };
  for (let index = 0; index < variants[0].length; index++) {
    const cases = variants.map(variant => variant[index]);
    if (!filter.test(cases[0].name)) continue;
    for (const workload of cases) {
      if (workload.resetKeys) workload.resetKeys();
      workload.setup();
      for (let i = 0; i < 4; i++) {
        workload.run();
        workload.teardown();
      }
    }
    await pause();
    for (let warmup = 0; warmup < 3; warmup++) {
      for (const workload of cases) {
        measure(workload.run, 250);
        await pause();
      }
    }
    /** @type {number[][]} */
    const samples = cases.map(() => []);
    for (let round = 0; round < options.sampleCount; round++) {
      for (let offset = 0; offset < cases.length; offset++) {
        const i = (round + offset) % cases.length;
        samples[i].push(measure(cases[i].run, 350));
        cases[i].teardown();
        await pause();
      }
    }
    await report({
      microseconds: Object.fromEntries(
        options.labels.map((label, i) => [label, median(samples[i])]),
      ),
      name: cases[0].name,
      samples: Object.fromEntries(
        options.labels.map((label, i) => [label, samples[i]]),
      ),
    });
  }
}
