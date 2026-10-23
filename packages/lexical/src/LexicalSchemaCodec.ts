/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {Klass, LexicalEditor} from './LexicalEditor';
import type {LexicalNode} from './LexicalNode';

import invariant from '@lexical/internal/invariant';

import {$getWritableNodeState} from './LexicalNodeState';
import {
  $applyJSONSetters,
  $exportNodeJSONOnce,
  getComposedSchemaFields,
  getStaticNodeConfig,
} from './LexicalUtils';

const __DEV__ = process.env.NODE_ENV !== 'production';

let hasUnserializable = false;
const unserializable = new WeakSet<object>();
const externalTypes = new Set<(value: object) => boolean>();

/** @internal Check values marked by an external schema codec before JSON export. */
export function assertSerializableSchemaValue(value: unknown): void {
  if (!hasUnserializable || !value || typeof value !== 'object') return;
  const seen = new Set<object>();
  const visit = (current: object): void => {
    for (const isExternal of externalTypes) {
      if (isExternal(current)) {
        unserializable.add(current);
        break;
      }
    }
    invariant(
      !unserializable.has(current),
      'Lexical: live external values cannot be exported as JSON. Store a JSON snapshot or a stable reference ID instead.',
    );
    if (seen.has(current)) return;
    seen.add(current);
    for (const child of Object.values(current))
      if (child && typeof child === 'object') visit(child);
  };
  visit(value);
}

/**
 * Experimental schema integration contract. Its exports use the declared
 * serialization schema and NodeState, bypassing custom exportJSON and
 * updateFromJSON overrides. All $ methods require an active editor context.
 * External mutable values may be preserved for synchronization, but must be
 * marked so ordinary JSON export and clipboard serialization reject them.
 *
 * @experimental
 */
export interface NodeSchemaCodec {
  readonly nodes: ReadonlyMap<string, {readonly klass: Klass<LexicalNode>}>;
  fields: typeof getComposedSchemaFields;
  validate(klass: Klass<LexicalNode>): void;
  $export(
    node: LexicalNode,
    preserveStateValue?: (value: unknown) => boolean,
  ): Record<string, unknown>;
  $apply(node: LexicalNode, json: Readonly<Record<string, unknown>>): void;
  markUnserializable(value: object): void;
  registerUnserializableType(
    isExternal: (value: object) => boolean,
  ): () => void;
}

const codecs = new WeakMap<LexicalEditor, NodeSchemaCodec>();

/** Obtain the editor's schema integration contract. @experimental */
export function getNodeSchemaCodec(editor: LexicalEditor): NodeSchemaCodec {
  let codec = codecs.get(editor);
  if (!codec) {
    const warned = new Set<Klass<LexicalNode>>();
    codec = {
      $apply(node, json) {
        $getWritableNodeState(node).updateFromJSON(
          json.$ as Record<string, unknown>,
        );
        $applyJSONSetters(node.getWritable(), json);
      },
      $export(node, preserveStateValue = () => false) {
        const latest = node.getLatest();
        const json = {...$exportNodeJSONOnce(latest, true)};
        const nodeState = latest.__state;
        if (nodeState) {
          const [unknown, known] = nodeState.getInternalState();
          const state: Record<string, unknown> = {...unknown};
          for (const [config, value] of known) {
            if (config.isEqual(value, config.defaultValue))
              delete state[config.key];
            else
              state[config.key] = preserveStateValue(value)
                ? value
                : config.unparse(value);
          }
          for (const key of nodeState.sharedNodeState.flatKeys) {
            if (Object.prototype.hasOwnProperty.call(state, key)) {
              Object.defineProperty(json, key, {
                configurable: true,
                enumerable: true,
                value: state[key],
                writable: true,
              });
              delete state[key];
            }
          }
          json.$ = state;
        }
        return json;
      },
      fields: getComposedSchemaFields,
      markUnserializable(value) {
        hasUnserializable = true;
        unserializable.add(value);
      },
      get nodes() {
        return editor._nodes;
      },
      registerUnserializableType(isExternal) {
        hasUnserializable = true;
        externalTypes.add(isExternal);
        return () => {
          externalTypes.delete(isExternal);
        };
      },
      validate(klass) {
        invariant(
          getStaticNodeConfig(klass).declaresOwnConfig,
          'Schema codec: %s must declare $config() and describe its properties with a JSON serialization schema',
          klass.name,
        );
        if (
          __DEV__ &&
          !(
            klass.name === 'ParagraphNode' && klass.getType() === 'paragraph'
          ) &&
          !warned.has(klass) &&
          ['exportJSON', 'updateFromJSON'].some(key =>
            Object.prototype.hasOwnProperty.call(klass.prototype, key),
          )
        ) {
          warned.add(klass);
          editor._onWarn(
            new Error(
              'Schema codec: ' +
                klass.name +
                ' overrides exportJSON/updateFromJSON. Schema integrations ignore these overrides; declare every property in $config().',
            ),
          );
        }
      },
    };
    codecs.set(editor, codec);
  }
  return codec;
}
