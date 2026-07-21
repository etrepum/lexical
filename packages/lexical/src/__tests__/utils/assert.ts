/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {LexicalNode} from 'lexical';

import {assert} from 'vitest';

// This module must stay free of dependencies that cannot load in
// browser-mode tests (the main `__tests__/utils` entry pulls in Node-only
// modules such as `@prettier/sync`); it is shared by both environments.

/**
 * Assert that a node matches the given type guard, returning it narrowed to
 * the guard's type. Useful for safely narrowing the result of traversal
 * methods such as getFirstChild() or getChildAtIndex() without an unchecked
 * type cast.
 */
export function $assertNodeType<T extends LexicalNode>(
  node: LexicalNode | null | undefined,
  $guard: (value: LexicalNode | null) => value is T,
): T {
  const resolved = node ?? null;
  assert(
    $guard(resolved),
    `Expected node to match type guard ${$guard.name}, got ${node ? node.constructor.name : null}`,
  );
  return resolved;
}
