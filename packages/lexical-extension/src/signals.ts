/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
export {
  batch,
  computed,
  effect,
  type ReadonlySignal,
  type Signal,
  signal,
  type SignalOptions,
  untracked,
} from '@preact/signals-core';

/**
 * The minimal read interface every signal satisfies: the current
 * {@link ReadableSignal.value}, a dependency-free {@link ReadableSignal.peek},
 * and a {@link ReadableSignal.subscribe} for driving external frameworks.
 *
 * Both {@link Signal} and {@link ReadonlySignal} are assignable to it, so code
 * that only *reads* a signal — an extension exposing reactive state as output,
 * or a framework binding built on `useSyncExternalStore` — can accept a
 * `ReadableSignal<T>` without coupling to the writable API or to a specific
 * signals implementation.
 */
export interface ReadableSignal<T> {
  /** The current value; reading it inside a reactive scope creates a dependency. */
  readonly value: T;
  /** Read the current value without creating a dependency. */
  peek(): T;
  /**
   * Subscribe to changes. The callback runs once immediately and again on every
   * change; the returned function unsubscribes.
   */
  subscribe(fn: (value: T) => void): () => void;
}
