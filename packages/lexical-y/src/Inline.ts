/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {YBinding} from './YBinding';

import {
  $getRoot,
  $isElementNode,
  COMMAND_PRIORITY_LOW,
  COMPOSITION_END_COMMAND,
  ElementNode,
  getComposedSchemaFields,
  type LexicalNode,
} from 'lexical';

import {
  $applyAttributes,
  $attributesFromNode,
  $createNode,
  type Attributes,
  equalValue,
} from './Schema';
import {decodeAttributes, encodeAttributes} from './SharedTypes';

export const INLINE_PREFIX = 'inline:';
const MARK_ID = 'inline:mark:id:';

function decodeKey(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/** Attribute-only wrappers annotate a run rather than owning its characters. */
export function $isInlineWrapper(
  node: LexicalNode,
  binding?: YBinding,
): node is ElementNode {
  return (
    $isElementNode(node) &&
    node.isInline() &&
    (binding
      ? binding.inlineFormatTypes.has(node.getType())
      : ['link', 'autolink', 'mark'].includes(node.getType()))
  );
}

/** Raw attributes, wrapped by the text writer in the same way as schema fields. */
export function $inlineFormats(
  node: LexicalNode,
  binding: YBinding,
  encode = true,
): Attributes {
  const result: Attributes = {};
  let parent = node.getParent();
  while (parent && $isInlineWrapper(parent, binding)) {
    const name = parent.getType();
    const attributes = $attributesFromNode(parent);
    const attrs = encode
      ? encodeAttributes(binding, parent.getKey(), attributes)
      : attributes;
    if (name === 'mark') {
      const ids = attrs['p:ids'];
      if (Array.isArray(ids))
        for (const id of ids) {
          if (typeof id === 'string')
            result[MARK_ID + encodeURIComponent(id)] = true;
        }
    } else result[INLINE_PREFIX + encodeURIComponent(name)] = true;
    for (const [key, value] of Object.entries(attrs)) {
      if (name === 'mark' && key === 'p:ids') continue;
      result[
        INLINE_PREFIX +
          encodeURIComponent(name) +
          ':attr:' +
          encodeURIComponent(key)
      ] = value;
    }
    parent = parent.getParent();
  }
  return result;
}

/** Only remove wrapper fields that this client's schema understands. */
export function isInlineFormatKey(key: string, binding: YBinding): boolean {
  if (!key.startsWith(INLINE_PREFIX)) return false;
  if (key.startsWith(MARK_ID))
    return (
      binding.inlineFormatTypes.has('mark') && binding.editor._nodes.has('mark')
    );
  for (const type of binding.inlineFormatTypes) {
    const entry = binding.editor._nodes.get(type);
    if (!entry) continue;
    if (key === INLINE_PREFIX + encodeURIComponent(type)) return true;
    const prefix = INLINE_PREFIX + encodeURIComponent(type) + ':attr:';
    if (key.startsWith(prefix)) {
      const encoded = decodeKey(key.slice(prefix.length));
      if (encoded === null) return false;
      const attr = encoded.startsWith('ref:') ? encoded.slice(4) : encoded;
      if (attr.startsWith('s:')) return true;
      if (attr.startsWith('p:'))
        return Object.prototype.hasOwnProperty.call(
          getComposedSchemaFields(entry.klass),
          attr.slice(2),
        );
    }
  }
  return false;
}

interface Wrapper {
  type: string;
  attributes: Attributes;
}
export interface InlineContent {
  node: LexicalNode;
  attributes: Attributes;
}

function wrappers(attributes: Attributes, binding: YBinding): Wrapper[] {
  const result: Wrapper[] = [];
  for (const type of [...binding.inlineFormatTypes].sort()) {
    const ids = Object.keys(attributes)
      .filter(key => key.startsWith(MARK_ID) && attributes[key] === true)
      .flatMap(key => {
        const id = decodeKey(key.slice(MARK_ID.length));
        return id === null ? [] : [id];
      })
      .sort();
    if (
      !(type === 'mark'
        ? ids.length
        : attributes[INLINE_PREFIX + encodeURIComponent(type)] === true)
    )
      continue;
    if (!binding.editor._nodes.has(type)) continue;
    const prefix = INLINE_PREFIX + encodeURIComponent(type) + ':attr:';
    const attrs: Attributes = {};
    for (const [key, value] of Object.entries(attributes)) {
      if (key.startsWith(prefix)) {
        const decoded = decodeKey(key.slice(prefix.length));
        if (decoded !== null) attrs[decoded] = value;
      }
    }
    if (type === 'mark') attrs['p:ids'] = ids;
    result.push({attributes: attrs, type});
  }
  return result;
}

/** Rebuild wrappers without copying/reinserting any shared characters. */
export function $readInlineChildren(
  content: InlineContent[],
  binding: YBinding,
  decode = true,
): LexicalNode[] {
  const result: LexicalNode[] = [];
  const candidates = new Map<string, ElementNode[]>();
  for (const {node} of content) {
    let parent = node.getParent();
    while (parent && $isInlineWrapper(parent, binding)) {
      const values = candidates.get(parent.getType()) || [];
      if (!values.some(value => value.getKey() === parent!.getKey()))
        values.push(parent);
      candidates.set(parent.getType(), values);
      parent = parent.getParent();
    }
  }
  const used = new Set<string>();
  const children = new Map<ElementNode, LexicalNode[]>();
  let previous: Wrapper[] = [];
  let parents: ElementNode[] = [];
  const append = (node: LexicalNode) => {
    if (parents.length) children.get(parents[parents.length - 1])!.push(node);
    else result.push(node);
  };
  for (const {node, attributes} of content) {
    const next = wrappers(attributes, binding);
    let common = 0;
    while (
      common < Math.min(previous.length, next.length) &&
      previous[common].type === next[common].type &&
      equalValue(previous[common].attributes, next[common].attributes)
    )
      common++;
    parents = parents.slice(0, common);
    for (let i = common; i < next.length; i++) {
      const entry = next[i];
      const existing = candidates.get(entry.type) || [];
      const available = existing.filter(
        candidate => !used.has(candidate.getKey()),
      );
      const getAttributes = (key: string) =>
        decode
          ? decodeAttributes(binding, key, entry.attributes)
          : entry.attributes;
      let wrapper = available.find(candidate =>
        equalValue(
          $attributesFromNode(candidate),
          getAttributes(candidate.getKey()),
        ),
      );
      if (!wrapper) {
        let parent = node.getParent();
        while (parent && $isInlineWrapper(parent, binding)) {
          if (
            parent.getType() === entry.type &&
            available.some(candidate => candidate.getKey() === parent!.getKey())
          ) {
            wrapper = parent;
            break;
          }
          parent = parent.getParent();
        }
      }
      if (!wrapper)
        wrapper = $createNode(binding.editor, entry.type) as ElementNode;
      const decoded = getAttributes(wrapper.getKey());
      if (!equalValue($attributesFromNode(wrapper), decoded))
        $applyAttributes(wrapper, decoded);
      used.add(wrapper.getKey());
      append(wrapper);
      children.set(wrapper, []);
      parents.push(wrapper);
    }
    append(node);
    previous = next;
  }
  // Children first: moving their shared text nodes leaves the outer splice small.
  for (const [parent, next] of Array.from(children).reverse()) {
    const current = parent.getChildren();
    if (
      current.length !== next.length ||
      current.some((node, i) => node.getKey() !== next[i].getKey())
    )
      parent.splice(0, current.length, next);
  }
  return result;
}

/** Canonicalize local wrappers before synchronization, using only Lexical data. */
export function registerInlineTransforms(binding: YBinding): () => void {
  const deferred = new Set<string>();
  const attempted = new Set<string>();
  const $canonicalize = (node: ElementNode) => {
    while (node.isInline()) {
      const parent = node.getParent();
      if (!parent) return;
      node = parent;
    }
    if (binding.editor.isComposing()) {
      deferred.add(node.getKey());
      return;
    }
    const content: InlineContent[] = [];
    let wrapped = false;
    const $append = (child: LexicalNode) => {
      if ($isInlineWrapper(child, binding)) {
        wrapped = true;
        child.getChildren().forEach($append);
      } else
        content.push({
          attributes: $inlineFormats(child, binding, false),
          node: child,
        });
    };
    node.getChildren().forEach($append);
    if (!wrapped || attempted.has(node.getKey())) return;
    // An application transform may intentionally split equal wrappers. Make
    // one projection attempt per commit instead of fighting that transform.
    attempted.add(node.getKey());
    const next = $readInlineChildren(content, binding, false);
    const previous = node.getChildren();
    if (
      previous.length !== next.length ||
      previous.some((child, i) => child.getKey() !== next[i].getKey())
    )
      node.splice(0, previous.length, next);
  };
  const removeTransforms = Array.from(binding.editor._nodes.values())
    .filter(({klass}) => klass.prototype instanceof ElementNode)
    .map(({klass}) =>
      binding.editor.registerNodeTransform(klass, node => {
        if ($isElementNode(node)) $canonicalize(node);
      }),
    );
  const removeListener = binding.editor.registerUpdateListener(
    () => attempted.clear(),
    {synchronous: true},
  );
  const removeComposition = binding.editor.registerCommand(
    COMPOSITION_END_COMMAND,
    () => {
      if (deferred.size) {
        const visit = (node: ElementNode) => {
          if (deferred.has(node.getKey())) node.markDirty();
          for (const child of node.getChildren())
            if ($isElementNode(child)) visit(child);
        };
        visit($getRoot());
        deferred.clear();
      }
      return false;
    },
    COMMAND_PRIORITY_LOW,
  );
  return () => {
    removeListener();
    removeComposition();
    removeTransforms.forEach(remove => remove());
  };
}
