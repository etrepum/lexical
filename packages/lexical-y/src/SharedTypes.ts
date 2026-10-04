/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {YBinding} from './YBinding';

import invariant from '@lexical/internal/invariant';
import {
  createAbsolutePositionFromRelativePosition,
  createRelativePositionFromJSON,
  createRelativePositionFromTypeIndex,
  Node as YNode,
  relativePositionToJSON,
} from '@y/y';
import {uuidv4} from 'lib0/random';

import {type Attributes, PROPERTY_PREFIX, STATE_PREFIX} from './Schema';
import {isRelativePosition} from './Selection';

export const SHARED_PREFIX = 'shared:';
const REFERENCE_PREFIX = 'ref:';

export function isSharedTypeDeleted(type: YNode): boolean {
  for (let current: YNode | null = type; current; current = current.parent) {
    if (current._item && current._item.deleted) return true;
  }
  return false;
}

function assertJSON(value: unknown, seen = new Set<object>()): void {
  if (!value || typeof value !== 'object') return;
  invariant(
    !(value instanceof YNode),
    '@lexical/y: a shared type must be the direct property or NodeState value',
  );
  invariant(
    !seen.has(value),
    '@lexical/y: cyclic property values are not supported',
  );
  seen.add(value);
  for (const child of Object.values(value)) assertJSON(child, seen);
  seen.delete(value);
}

/** References let text runs and multiple properties share a single live type. */
export function encodeAttributes(
  binding: YBinding,
  owner: string,
  attributes: Attributes,
): Attributes {
  // Preserve references whose targets have not arrived while editing other fields.
  const pending = {...binding.getPendingSharedReferences(owner)};
  const result: Attributes = {};
  // Validate ownership before integrating any of this node's values.
  for (const value of Object.values(attributes)) {
    if (value instanceof YNode) {
      invariant(
        value.doc === null || value.doc === binding.doc,
        '@lexical/y: shared values must belong to the binding document; clone cross-document values explicitly',
      );
      invariant(
        !isSharedTypeDeleted(value),
        '@lexical/y: cannot reference a deleted shared type',
      );
    } else assertJSON(value);
  }
  for (const [key, value] of Object.entries(attributes)) {
    delete pending[REFERENCE_PREFIX + key];
    if (value instanceof YNode) {
      if (value.doc === null)
        binding.root.setAttr(SHARED_PREFIX + uuidv4(), value);
      // Storage keys survive recreation by undo on every peer. End positions
      // name the containing type itself, with no text/child item anchor.
      const parent = value.parent;
      const item = value._item;
      const storageKey = item && item.parentSub;
      result[REFERENCE_PREFIX + key] =
        parent &&
        typeof storageKey === 'string' &&
        storageKey.startsWith(SHARED_PREFIX)
          ? {
              container: relativePositionToJSON(
                createRelativePositionFromTypeIndex(parent, parent.length),
              ),
              key: storageKey,
            }
          : relativePositionToJSON(
              createRelativePositionFromTypeIndex(value, value.length),
            );
    } else result[key] = value;
  }
  binding.trackSharedTypes(owner, attributes, pending);
  return {...pending, ...result};
}

export function decodeAttributes(
  binding: YBinding,
  owner: string,
  attributes: Attributes,
): Attributes {
  const result: Attributes = {};
  const pending: Attributes = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (key.startsWith(REFERENCE_PREFIX)) {
      const name = key.slice(REFERENCE_PREFIX.length);
      const stored = value as {container?: unknown; key?: unknown} | null;
      const reference =
        stored &&
        typeof stored.key === 'string' &&
        stored.key.startsWith(SHARED_PREFIX)
          ? stored.container
          : value;
      invariant(
        (name.startsWith(PROPERTY_PREFIX) || name.startsWith(STATE_PREFIX)) &&
          isRelativePosition(reference),
        '@lexical/y: invalid shared type reference',
      );
      const relative = createRelativePositionFromJSON(reference);
      invariant(
        relative.item === null,
        '@lexical/y: a shared reference must identify a type, not an item',
      );
      const position = createAbsolutePositionFromRelativePosition(
        relative,
        binding.doc,
      );
      const target =
        position && !isSharedTypeDeleted(position.type)
          ? reference === value
            ? position.type
            : position.type.getAttr(stored!.key as string)
          : null;
      if (target instanceof YNode && !isSharedTypeDeleted(target))
        result[name] = target;
      else if (
        reference !== value ||
        (relative.type &&
          binding.doc.store.getClock(relative.type.client) <=
            relative.type.clock)
      )
        pending[key] = value;
    } else if (key.startsWith(PROPERTY_PREFIX) || key.startsWith(STATE_PREFIX))
      result[key] = value;
  }
  binding.trackSharedTypes(owner, result, pending);
  return result;
}
