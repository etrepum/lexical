/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Differential test for the in-house signals prototype in ../../signals.ts.
// Every assertion runs against BOTH @preact/signals-core (the implementation
// @lexical/extension actually ships) and the prototype, so the suite doubles as
// an executable specification: signals-core defines the contract, and a
// prototype that diverges fails here rather than in an editor.

// The shipped module, which today just re-exports @preact/signals-core.
import * as shipped from '@lexical/extension/src/signals';
import {describe, expect, test} from 'vitest';

import * as mini from '../../signals';

type Impl = Pick<
  typeof shipped,
  'batch' | 'computed' | 'effect' | 'signal' | 'untracked'
>;

/** Read a signal purely for its tracking side effect. */
function read(s: {value: unknown}): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  s.value;
}

const IMPLEMENTATIONS: [string, Impl][] = [
  ['@preact/signals-core (shipped)', shipped],
  ['in-house prototype', mini as unknown as Impl],
];

describe.each(IMPLEMENTATIONS)('signals: %s', (_name, impl) => {
  const {batch, computed, effect, signal, untracked} = impl;
  test('basic read/write', () => {
    const a = signal(1);
    expect(a.value).toBe(1);
    a.value = 2;
    expect(a.value).toBe(2);
    expect(a.peek()).toBe(2);
  });

  test('effect runs immediately and on change', () => {
    const a = signal(1);
    const seen: number[] = [];
    const dispose = effect(() => {
      seen.push(a.value);
    });
    expect(seen).toEqual([1]);
    a.value = 2;
    expect(seen).toEqual([1, 2]);
    dispose();
    a.value = 3;
    expect(seen).toEqual([1, 2]);
  });

  test('writing an identical value is a no-op', () => {
    const a = signal(1);
    let runs = 0;
    effect(() => {
      read(a);
      runs++;
    });
    expect(runs).toBe(1);
    a.value = 1;
    expect(runs).toBe(1);
  });

  test('effect cleanup runs before re-run and on dispose', () => {
    const a = signal(1);
    const log: string[] = [];
    const dispose = effect(() => {
      const v = a.value;
      log.push(`run${v}`);
      return () => log.push(`cleanup${v}`);
    });
    a.value = 2;
    dispose();
    expect(log).toEqual(['run1', 'cleanup1', 'run2', 'cleanup2']);
  });

  test('computed is lazy and memoized', () => {
    const a = signal(1);
    let computations = 0;
    const double = computed(() => {
      computations++;
      return a.value * 2;
    });
    expect(computations).toBe(0);
    expect(double.value).toBe(2);
    expect(double.value).toBe(2);
    expect(computations).toBe(1);
    a.value = 3;
    expect(double.value).toBe(6);
    expect(computations).toBe(2);
  });

  test('diamond: effect runs once per change, never on stale values', () => {
    const a = signal(1);
    const b = computed(() => a.value + 1);
    const c = computed(() => a.value + 2);
    const seen: string[] = [];
    effect(() => {
      seen.push(`${b.value},${c.value}`);
    });
    expect(seen).toEqual(['2,3']);
    a.value = 10;
    expect(seen).toEqual(['2,3', '11,12']);
  });

  test('computed that settles back to the same value does not re-run effects', () => {
    const a = signal(1);
    const parity = computed(() => a.value % 2);
    let runs = 0;
    effect(() => {
      read(parity);
      runs++;
    });
    expect(runs).toBe(1);
    a.value = 3;
    expect(runs).toBe(1);
    a.value = 2;
    expect(runs).toBe(2);
  });

  test('batch coalesces writes into one effect run', () => {
    const a = signal(1);
    const b = signal(1);
    let runs = 0;
    effect(() => {
      read(a);
      read(b);
      runs++;
    });
    expect(runs).toBe(1);
    batch(() => {
      a.value = 2;
      b.value = 2;
    });
    expect(runs).toBe(2);
  });

  test('nested batch flushes at the outermost boundary', () => {
    const a = signal(1);
    let runs = 0;
    effect(() => {
      read(a);
      runs++;
    });
    batch(() => {
      a.value = 2;
      batch(() => {
        a.value = 3;
      });
      expect(runs).toBe(1);
    });
    expect(runs).toBe(2);
  });

  test('untracked reads do not subscribe', () => {
    const a = signal(1);
    const b = signal(1);
    let runs = 0;
    effect(() => {
      read(a);
      untracked(() => b.value);
      runs++;
    });
    b.value = 2;
    expect(runs).toBe(1);
    a.value = 2;
    expect(runs).toBe(2);
  });

  test('dependencies are re-tracked each run', () => {
    const cond = signal(true);
    const a = signal('a');
    const b = signal('b');
    const seen: string[] = [];
    effect(() => {
      seen.push(cond.value ? a.value : b.value);
    });
    b.value = 'b2';
    expect(seen).toEqual(['a']);
    cond.value = false;
    expect(seen).toEqual(['a', 'b2']);
    a.value = 'a2';
    expect(seen).toEqual(['a', 'b2']);
    b.value = 'b3';
    expect(seen).toEqual(['a', 'b2', 'b3']);
  });

  test('watched/unwatched fire on first and last subscriber', () => {
    const log: string[] = [];
    const a = signal(0, {
      unwatched() {
        log.push('unwatched');
      },
      watched() {
        log.push('watched');
      },
    });
    expect(log).toEqual([]);
    const d1 = effect(() => {
      read(a);
    });
    expect(log).toEqual(['watched']);
    const d2 = effect(() => {
      read(a);
    });
    expect(log).toEqual(['watched']);
    d1();
    expect(log).toEqual(['watched']);
    d2();
    expect(log).toEqual(['watched', 'unwatched']);
  });

  test('watched may write to the signal (watchedSignal pattern)', () => {
    let external = 5;
    const s = signal(0, {
      watched(this: {value: number}) {
        this.value = external;
      },
    });
    const seen: number[] = [];
    effect(() => {
      seen.push(s.value);
    });
    expect(seen[seen.length - 1]).toBe(5);
    external = 6;
    s.value = external;
    expect(seen[seen.length - 1]).toBe(6);
  });

  test('watched fires again when a signal is re-watched', () => {
    let count = 0;
    const a = signal(0, {
      watched() {
        count++;
      },
    });
    effect(() => {
      read(a);
    })();
    expect(count).toBe(1);
    effect(() => {
      read(a);
    })();
    expect(count).toBe(2);
  });

  test('subscribe delivers current value and updates', () => {
    const a = signal(1);
    const seen: number[] = [];
    const unsub = a.subscribe(v => seen.push(v));
    expect(seen).toEqual([1]);
    a.value = 2;
    expect(seen).toEqual([1, 2]);
    unsub();
    a.value = 3;
    expect(seen).toEqual([1, 2]);
  });

  test('computed only subscribes to sources while it has watchers', () => {
    const log: string[] = [];
    const a = signal(1, {
      unwatched() {
        log.push('unwatched');
      },
      watched() {
        log.push('watched');
      },
    });
    const c = computed(() => a.value * 2);
    expect(c.value).toBe(2);
    expect(log).toEqual([]);
    const dispose = effect(() => {
      read(c);
    });
    expect(log).toEqual(['watched']);
    dispose();
    expect(log).toEqual(['watched', 'unwatched']);
  });

  test('a write inside an effect is seen by the same flush', () => {
    const a = signal(0);
    const b = signal(0);
    const seen: number[] = [];
    effect(() => {
      if (a.value === 1) {
        b.value = 1;
      }
    });
    effect(() => {
      seen.push(b.value);
    });
    a.value = 1;
    expect(seen).toEqual([0, 1]);
  });

  test('a throwing effect does not poison the graph', () => {
    const a = signal(0);
    let runs = 0;
    expect(() => {
      effect(() => {
        read(a);
        runs++;
        throw new Error('boom');
      });
    }).toThrow('boom');
    expect(runs).toBe(1);
    // signals-core disposes an effect whose first run throws, so a later write
    // neither re-runs it nor re-throws.
    a.value = 1;
    expect(runs).toBe(1);
  });

  test('errors in a computed propagate to readers and are re-thrown', () => {
    const a = signal(0);
    const c = computed(() => {
      if (a.value === 1) {
        throw new Error('bad');
      }
      return a.value;
    });
    expect(c.value).toBe(0);
    a.value = 1;
    expect(() => c.value).toThrow('bad');
    a.value = 2;
    expect(c.value).toBe(2);
  });
  test('cycle: computed reading itself', () => {
    const a = signal(0);
    const c: {value: number} = computed(() =>
      a.value === 0 ? 0 : c.value + 1,
    ) as {value: number};
    expect(c.value).toBe(0);
    a.value = 1;
    expect(() => c.value).toThrow();
  });

  test('effect writing the signal it reads throws or settles', () => {
    const a = signal(0);
    let runs = 0;
    let threw = false;
    try {
      effect(() => {
        runs++;
        if (a.value < 3) {
          a.value += 1;
        }
      });
    } catch {
      threw = true;
    }
    // Either it converges or it reports a cycle; it must not hang or run away.
    expect(threw || runs <= 10).toBe(true);
  });

  test('nested effect is disposed with its parent', () => {
    const outer = signal(0);
    const inner = signal(0);
    const log: string[] = [];
    const dispose = effect(() => {
      read(outer);
      const innerDispose = effect(() => {
        log.push(`inner${inner.value}`);
      });
      return innerDispose;
    });
    expect(log).toEqual(['inner0']);
    inner.value = 1;
    expect(log).toEqual(['inner0', 'inner1']);
    dispose();
    inner.value = 2;
    expect(log).toEqual(['inner0', 'inner1']);
  });

  test('deep computed chain propagates in one flush', () => {
    const a = signal(0);
    let c: {value: number} = a as unknown as {value: number};
    for (let i = 0; i < 20; i++) {
      const prev = c;
      c = computed(() => prev.value + 1) as {value: number};
    }
    let runs = 0;
    let last = -1;
    effect(() => {
      last = c.value;
      runs++;
    });
    expect(last).toBe(20);
    expect(runs).toBe(1);
    a.value = 1;
    expect(last).toBe(21);
    expect(runs).toBe(2);
  });

  test('effect disposed during a flush does not run', () => {
    const a = signal(0);
    const log: string[] = [];
    let disposeB: () => void = () => {};
    effect(() => {
      read(a);
      log.push('a');
      disposeB();
    });
    disposeB = effect(() => {
      read(a);
      log.push('b');
    });
    expect(log).toEqual(['a', 'b']);
    a.value = 1;
    expect(log).toEqual(['a', 'b', 'a']);
  });

  test('computed read inside batch sees the written value', () => {
    const a = signal(1);
    const double = computed(() => a.value * 2);
    batch(() => {
      a.value = 5;
      expect(double.value).toBe(10);
    });
  });

  test('untracked inside computed does not create a dependency', () => {
    const a = signal(1);
    const b = signal(1);
    let computations = 0;
    const c = computed(() => {
      computations++;
      return a.value + untracked(() => b.value);
    });
    expect(c.value).toBe(2);
    b.value = 10;
    expect(c.value).toBe(2);
    expect(computations).toBe(1);
    a.value = 2;
    expect(c.value).toBe(12);
  });

  test('unwatched fires when the last watching computed loses its watcher', () => {
    const log: string[] = [];
    const a = signal(1, {
      unwatched() {
        log.push('unwatched');
      },
      watched() {
        log.push('watched');
      },
    });
    const b = computed(() => a.value + 1);
    const d1 = effect(() => {
      read(b);
    });
    const d2 = effect(() => {
      read(b);
    });
    expect(log).toEqual(['watched']);
    d1();
    expect(log).toEqual(['watched']);
    d2();
    expect(log).toEqual(['watched', 'unwatched']);
  });

  test('effect that stops reading a signal unsubscribes it', () => {
    const log: string[] = [];
    const cond = signal(true);
    const a = signal(1, {
      unwatched() {
        log.push('unwatched');
      },
      watched() {
        log.push('watched');
      },
    });
    effect(() => {
      if (cond.value) {
        read(a);
      }
    });
    expect(log).toEqual(['watched']);
    cond.value = false;
    expect(log).toEqual(['watched', 'unwatched']);
  });

  test('batch returns the callback value and rethrows', () => {
    expect(batch(() => 42)).toBe(42);
    expect(() =>
      batch(() => {
        throw new Error('x');
      }),
    ).toThrow('x');
  });

  test('a throwing effect does not prevent sibling effects from running', () => {
    const a = signal(0);
    const log: string[] = [];
    effect(() => {
      read(a);
      log.push('first');
      if (a.value === 1) {
        throw new Error('boom');
      }
    });
    effect(() => {
      read(a);
      log.push('second');
    });
    expect(log).toEqual(['first', 'second']);
    expect(() => {
      a.value = 1;
    }).toThrow('boom');
    expect(log).toEqual(['first', 'second', 'first', 'second']);
  });
});
