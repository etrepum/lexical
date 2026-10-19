/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {Node as YNode} from '@y/y';
import type {LexicalNode} from 'lexical';

import {
  $create,
  $getDocument,
  $getNodeByKey,
  booleanValue,
  DecoratorNode,
  nodeSchema,
  stringValue,
  withField,
} from 'lexical';
import * as delta from 'lib0/delta';

import {getChildren, getStoredNode} from './Topology';
import {type YBinding} from './YBinding';

const opaqueSchema = nodeSchema<YOpaqueNode>()({
  inline: withField(booleanValue(), {field: '__inline'}),
  name: withField(stringValue(), {field: '__name'}),
});

/** A local projection barrier. Its original Y.Node remains the source of truth. */
export class YOpaqueNode extends DecoratorNode<null> {
  __inline = true;
  __name = '';

  $config() {
    return this.config('@lexical/y/opaque', {
      extends: DecoratorNode,
      json: opaqueSchema,
    });
  }

  createDOM(): HTMLElement {
    const element = $getDocument().createElement(
      this.__inline ? 'span' : 'div',
    );
    element.contentEditable = 'false';
    element.textContent = 'Unsupported content (' + this.__name + ')';
    return element;
  }

  updateDOM(previous: this): boolean {
    return (
      previous.__inline !== this.__inline || previous.__name !== this.__name
    );
  }

  isInline(): boolean {
    return this.__inline;
  }

  isIsolated(): boolean {
    return true;
  }

  isKeyboardSelectable(): boolean {
    return false;
  }
}

export function $isOpaqueNode(node: LexicalNode): node is YOpaqueNode {
  return node instanceof YOpaqueNode;
}

/** Text runs are indivisible while any of their node types is unavailable. */
export function hasUnknownType(type: YNode, binding: YBinding): boolean {
  if (type.name !== null) return !binding.editor._nodes.has(type.name);
  return unknownTextTypes(type, binding).size > 0;
}

function unknownTextTypes(type: YNode, binding: YBinding): Set<string> {
  const names = new Set<string>();
  const missingWrappers = [...binding.inlineFormatTypes].filter(
    name => !binding.editor._nodes.has(name),
  );
  const isTrue = (value: unknown) =>
    value === true ||
    (Array.isArray(value) && value.length === 1 && value[0] === true);
  for (const op of type.toDelta().children) {
    if (!delta.$textOp.check(op)) continue;
    const formats = op.format || {};
    const name = formats.type;
    if (typeof name === 'string' && !binding.editor._nodes.has(name))
      names.add(name);
    for (const wrapper of missingWrappers) {
      if (
        wrapper === 'mark'
          ? Object.entries(formats).some(
              ([key, value]) =>
                key.startsWith('inline:mark:id:') && isTrue(value),
            )
          : isTrue(formats['inline:' + encodeURIComponent(wrapper)])
      )
        names.add(wrapper);
    }
  }
  return names;
}

export function containsUnknownType(type: YNode, binding: YBinding): boolean {
  if (hasUnknownType(type, binding)) return true;
  for (const child of getChildren(binding, type))
    if (containsUnknownType(child, binding)) return true;
  for (const [key, value] of Object.entries(type.getAttrs())) {
    const slot = key.startsWith('slot:') && getStoredNode(binding, value);
    if (slot && containsUnknownType(slot, binding)) return true;
  }
  return false;
}

/** A missing placeholder is not permission to remove data this peer cannot edit. */
export function preserveOpaqueChildren(
  previous: readonly YNode[],
  next: YNode[],
  binding: YBinding,
): void {
  for (let i = 0; i < previous.length; i++) {
    const child = previous[i];
    if (next.includes(child) || !containsUnknownType(child, binding)) continue;
    const after = previous
      .slice(i + 1)
      .find(candidate => next.includes(candidate));
    const index = after ? next.indexOf(after) : next.length;
    next.splice(index, 0, child);
    binding.restoreOpaque = true;
  }
}

export function $readOpaqueNode(type: YNode, binding: YBinding): YOpaqueNode {
  const previous = binding.mapping.nodes.get(type);
  const mapped =
    previous && !Array.isArray(previous)
      ? $getNodeByKey(previous.getKey())
      : null;
  const node = mapped instanceof YOpaqueNode ? mapped : $create(YOpaqueNode);
  let name = type.name;
  if (name === null) {
    const names = unknownTextTypes(type, binding);
    for (const nodeType of names) binding.warnUnknownType(nodeType);
    name = [...names].join(', ');
  } else binding.warnUnknownType(name);
  const parent = binding.parents.get(type);
  const slotted =
    parent &&
    Object.entries(parent.getAttrs()).some(
      ([key, value]) =>
        key.startsWith('slot:') && getStoredNode(binding, value) === type,
    );
  const inline = type.name === null || (parent !== binding.root && !slotted);
  if (node.__name !== name || node.__inline !== inline) {
    const writable = node.getWritable();
    writable.__name = name;
    writable.__inline = inline;
  }
  binding.mapping.set(type, node.getLatest());
  return node.getLatest();
}
