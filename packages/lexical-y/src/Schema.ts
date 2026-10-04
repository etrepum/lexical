/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import invariant from '@lexical/internal/invariant';
import {Node as YNode} from '@y/y';
import {
  $applyJSONSetters,
  $create,
  $exportNodeJSONOnce,
  $getWritableNodeState,
  $isTextNode,
  getStaticNodeConfig,
  type Klass,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical';

export type Attributes = Record<string, unknown>;
export const PROPERTY_PREFIX = 'p:';
export const STATE_PREFIX = 's:';
export const SLOT_PREFIX = 'slot:';

export function assertSchema(klass: Klass<LexicalNode>): void {
  invariant(
    getStaticNodeConfig(klass).declaresOwnConfig,
    '@lexical/y: %s must declare $config() and describe its properties with a JSON serialization schema',
    klass.name,
  );
}

// The schema owns the wire representation, including defaults and accessors.
// Custom exportJSON/updateFromJSON overrides are deliberately not involved.
export function $attributesFromNode(node: LexicalNode): Attributes {
  const latest = node.getLatest();
  const json = {
    ...$exportNodeJSONOnce(latest, true),
  };
  const nodeState = latest.__state;
  if (nodeState) {
    const [unknown, known] = nodeState.getInternalState();
    const state: Attributes = {...unknown};
    for (const [config, value] of known) {
      if (config.isEqual(value, config.defaultValue)) delete state[config.key];
      else
        state[config.key] =
          value instanceof YNode ? value : config.unparse(value);
    }
    for (const key of nodeState.sharedNodeState.flatKeys) {
      if (key in state) {
        json[key] = state[key];
        delete state[key];
      }
    }
    json.$ = state;
  }
  const attributes: Attributes = {};
  for (const [key, value] of Object.entries(json)) {
    if (key === '$') {
      for (const [stateKey, stateValue] of Object.entries(
        value as Attributes,
      )) {
        attributes[STATE_PREFIX + stateKey] = stateValue;
      }
    } else if (
      key !== 'type' &&
      key !== 'version' &&
      key !== 'children' &&
      key !== 'slots' &&
      (key !== 'text' || !$isTextNode(node)) &&
      value !== undefined
    ) {
      attributes[PROPERTY_PREFIX + key] = value;
    }
  }
  return attributes;
}

export function $applyAttributes(
  node: LexicalNode,
  attributes: Attributes,
  text?: string,
): void {
  const state: Attributes = {};
  const json: Attributes = {type: node.getType()};
  for (const [key, value] of Object.entries(attributes)) {
    if (key.startsWith(PROPERTY_PREFIX)) {
      Object.defineProperty(json, key.slice(PROPERTY_PREFIX.length), {
        enumerable: true,
        value,
      });
    } else if (key.startsWith(STATE_PREFIX)) {
      Object.defineProperty(state, key.slice(STATE_PREFIX.length), {
        enumerable: true,
        value,
      });
    }
  }
  json.$ = state;
  if (text !== undefined) {
    json.text = text;
  }
  // Also reset flat state whose attribute was deleted remotely.
  $getWritableNodeState(node).updateFromJSON(state);
  $applyJSONSetters(node.getWritable(), json);
}

export function $createNode(editor: LexicalEditor, type: string): LexicalNode {
  const entry = editor._nodes.get(type);
  invariant(
    entry !== undefined,
    '@lexical/y: node type %s is not registered',
    type,
  );
  assertSchema(entry.klass);
  return $create(entry.klass);
}

export function equalValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a instanceof YNode || b instanceof YNode) return false;
  if (
    a === null ||
    b === null ||
    typeof a !== 'object' ||
    typeof b !== 'object'
  )
    return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  return (
    ak.length === bk.length &&
    ak.every(
      key =>
        Object.prototype.hasOwnProperty.call(b, key) &&
        equalValue((a as Attributes)[key], (b as Attributes)[key]),
    )
  );
}
