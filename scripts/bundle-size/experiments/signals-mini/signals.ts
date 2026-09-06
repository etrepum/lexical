/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// PROTOTYPE — not wired into @lexical/extension. See ../../README.md
// ("Considered: an in-house signals implementation") for why it exists and
// what it measured.
//
// A minimal signals implementation covering exactly the surface
// @lexical/extension re-exports: signal (with watched/unwatched), computed,
// effect (with a cleanup return), batch, untracked, and Signal.peek /
// .subscribe.
//
// Lazy pull for computeds plus a queued, deduplicated effect flush, with
// version numbers to skip recomputation. It keeps the guarantees signals-core
// gives and Lexical relies on: glitch-free reads, at most one effect run per
// batch, and a write of an identical value being a no-op. The differential
// test in __tests__/unit runs the same assertions against this and against
// @preact/signals-core, so a divergence fails CI.

export interface SignalOptions<T = unknown> {
  watched?: (this: Signal<T>) => void;
  unwatched?: (this: Signal<T>) => void;
}

type Consumer = Computed<unknown> | Effect;

let evalContext: Consumer | undefined;
let batchDepth = 0;
let queue: Effect[] = [];
let globalVersion = 0;

function startBatch() {
  batchDepth++;
}

function endBatch() {
  if (--batchDepth > 0) {
    return;
  }
  let error: unknown;
  let hasError = false;
  while (queue.length > 0) {
    const pending = queue;
    queue = [];
    for (const fx of pending) {
      fx._queued = false;
      if (!fx._disposed && fx._stale()) {
        try {
          fx._run();
        } catch (err) {
          if (!hasError) {
            error = err;
            hasError = true;
          }
        }
      }
    }
  }
  if (hasError) {
    throw error;
  }
}

export function batch<T>(fn: () => T): T {
  startBatch();
  try {
    return fn();
  } finally {
    endBatch();
  }
}

export function untracked<T>(fn: () => T): T {
  const prev = evalContext;
  evalContext = undefined;
  try {
    return fn();
  } finally {
    evalContext = prev;
  }
}

export class Signal<T = unknown> {
  _value: T;
  _version = 0;
  _subs = new Set<Consumer>();
  _options: SignalOptions<T> | undefined;

  constructor(value: T, options?: SignalOptions<T>) {
    this._value = value;
    this._options = options;
  }

  _watch(consumer: Consumer): void {
    if (!this._subs.has(consumer)) {
      this._subs.add(consumer);
      if (this._subs.size === 1 && this._options && this._options.watched) {
        this._options.watched.call(this);
      }
    }
  }

  _unwatch(consumer: Consumer): void {
    if (this._subs.delete(consumer) && this._subs.size === 0) {
      if (this._options && this._options.unwatched) {
        this._options.unwatched.call(this);
      }
    }
  }

  /** Recompute if stale. Plain signals are always current. */
  _refresh(): void {}

  peek(): T {
    this._refresh();
    return this._value;
  }

  get value(): T {
    this._refresh();
    if (evalContext !== undefined) {
      evalContext._track(this as Signal<unknown>);
    }
    return this._value;
  }

  set value(next: T) {
    if (next === this._value) {
      return;
    }
    this._value = next;
    this._version++;
    globalVersion++;
    startBatch();
    try {
      this._notify();
    } finally {
      endBatch();
    }
  }

  _notify(): void {
    for (const sub of this._subs) {
      sub._invalidate();
    }
  }

  subscribe(fn: (value: T) => void): () => void {
    return effect(() => {
      fn(this.value);
    });
  }

  valueOf(): T {
    return this.value;
  }

  toString(): string {
    return String(this.value);
  }

  toJSON(): T {
    return this.value;
  }
}

/** A consumer's record of one dependency and the version it last saw. */
abstract class Reactive<T> extends Signal<T> {
  _deps = new Map<Signal<unknown>, number>();
  _pending = new Map<Signal<unknown>, number>();
  _reused = 0;
  _tracking = false;

  _track(source: Signal<unknown>): void {
    if (this._deps.has(source)) {
      this._reused++;
    }
    this._pending.set(source, source._version);
  }

  /** Swap the freshly collected dependency set in, unsubscribing dropped ones. */
  _commitDeps(): void {
    const prev = this._deps;
    const unchanged =
      this._reused === this._pending.size && prev.size === this._pending.size;
    this._reused = 0;
    this._deps = this._pending;
    this._pending = prev;
    // Re-running with the same dependency set is the common case; the
    // subscriptions are already in place, so only the versions needed updating.
    if (this._tracking && !unchanged) {
      for (const source of this._deps.keys()) {
        source._watch(this as unknown as Consumer);
      }
      for (const source of prev.keys()) {
        if (!this._deps.has(source)) {
          source._unwatch(this as unknown as Consumer);
        }
      }
    }
    prev.clear();
  }

  _stale(): boolean {
    for (const [source, version] of this._deps) {
      source._refresh();
      if (source._version !== version) {
        return true;
      }
    }
    return false;
  }

  _unsubscribeAll(): void {
    for (const source of this._deps.keys()) {
      source._unwatch(this as unknown as Consumer);
    }
    this._deps.clear();
  }

  abstract _invalidate(): void;
}

class Computed<T> extends Reactive<T> {
  _fn: () => T;
  _globalVersion = -1;
  _dirty = true;
  _running = false;
  _error: unknown;
  _hasError = false;

  constructor(fn: () => T, options?: SignalOptions<T>) {
    super(undefined as T, options);
    this._fn = fn;
  }

  _invalidate(): void {
    if (!this._dirty) {
      this._dirty = true;
      this._notify();
    }
  }

  _refresh(): void {
    if (this._running) {
      throw new Error('Cycle detected');
    }
    if (!this._dirty && this._globalVersion === globalVersion) {
      return;
    }
    this._globalVersion = globalVersion;
    if (!this._dirty && !this._stale()) {
      return;
    }
    this._running = true;
    this._dirty = false;
    const prevContext = evalContext;
    evalContext = this as unknown as Consumer;
    this._pending.clear();
    this._reused = 0;
    const hadError = this._hasError;
    try {
      const next = this._fn();
      this._hasError = false;
      if (next !== this._value || hadError) {
        this._value = next;
        this._version++;
      }
    } catch (err) {
      this._error = err;
      this._hasError = true;
      this._version++;
    } finally {
      this._running = false;
      evalContext = prevContext;
      this._commitDeps();
    }
  }

  peek(): T {
    this._refresh();
    if (this._hasError) {
      throw this._error;
    }
    return this._value;
  }

  get value(): T {
    this._refresh();
    if (evalContext !== undefined) {
      evalContext._track(this as unknown as Signal<unknown>);
    }
    if (this._hasError) {
      throw this._error;
    }
    return this._value;
  }

  _watch(consumer: Consumer): void {
    const first = this._subs.size === 0;
    super._watch(consumer);
    if (first && this._subs.size === 1) {
      this._tracking = true;
      for (const source of this._deps.keys()) {
        source._watch(this as unknown as Consumer);
      }
    }
  }

  _unwatch(consumer: Consumer): void {
    super._unwatch(consumer);
    if (this._subs.size === 0 && this._tracking) {
      this._tracking = false;
      for (const source of this._deps.keys()) {
        source._unwatch(this as unknown as Consumer);
      }
    }
  }
}

class Effect extends Reactive<undefined> {
  _fn: () => void | (() => void);
  _cleanup: void | (() => void) = undefined;
  _disposed = false;
  _queued = false;

  constructor(fn: () => void | (() => void)) {
    super(undefined);
    this._fn = fn;
    this._tracking = true;
  }

  _invalidate(): void {
    if (!this._queued) {
      this._queued = true;
      queue.push(this);
    }
  }

  _run(): void {
    if (this._cleanup) {
      const cleanup = this._cleanup;
      this._cleanup = undefined;
      untracked(cleanup);
    }
    const prevContext = evalContext;
    evalContext = this as unknown as Consumer;
    this._pending.clear();
    this._reused = 0;
    startBatch();
    try {
      this._cleanup = this._fn();
    } finally {
      evalContext = prevContext;
      this._commitDeps();
      endBatch();
    }
  }

  _dispose(): void {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    this._unsubscribeAll();
    if (this._cleanup) {
      const cleanup = this._cleanup;
      this._cleanup = undefined;
      untracked(cleanup);
    }
  }
}

export function signal<T>(value: T, options?: SignalOptions<T>): Signal<T> {
  return new Signal(value, options);
}

export interface ReadonlySignal<T = unknown> {
  readonly value: T;
  peek(): T;
  subscribe(fn: (value: T) => void): () => void;
  valueOf(): T;
  toString(): string;
  toJSON(): T;
}

export function computed<T>(
  fn: () => T,
  options?: SignalOptions<T>,
): ReadonlySignal<T> {
  return new Computed(fn, options) as unknown as ReadonlySignal<T>;
}

export function effect(fn: () => void | (() => void)): () => void {
  const fx = new Effect(fn);
  try {
    fx._run();
  } catch (err) {
    fx._dispose();
    throw err;
  }
  return fx._dispose.bind(fx);
}
