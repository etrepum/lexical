/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {LexicalNode} from 'lexical';

import invariant from '@lexical/internal/invariant';

/**
 * Browser-safe mirror of `$assertNodeType` from
 * `lexical/src/__tests__/utils` — that module pulls in Node-only
 * dependencies (`@prettier/sync`) and cannot load in browser-mode tests.
 */
export function $assertNodeType<T extends LexicalNode>(
  node: LexicalNode | null | undefined,
  $guard: (value: LexicalNode | null) => value is T,
): T {
  const resolved = node ?? null;
  invariant(
    $guard(resolved),
    'Expected node to match type guard %s, got %s',
    $guard.name,
    node ? node.constructor.name : 'null',
  );
  return resolved;
}
