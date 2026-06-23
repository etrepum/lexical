/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  ComarkElementTransformer,
  ComarkInlineTransformer,
  ComarkTextFormatTransformer,
  ComarkTransformer,
} from './ComarkTransformers';
import type {ComarkComment, ComarkElement, ComarkNode} from 'comark';

/**
 * comark represents the AST as compact tuples:
 *
 * - text is a bare `string`
 * - an element is `[tag, attributes, ...children]`
 * - a comment is `[null, attributes, content]`
 *
 * These guards narrow a {@link ComarkNode} to one of those shapes.
 */
export function isComarkElement(node: ComarkNode): node is ComarkElement {
  return Array.isArray(node) && typeof node[0] === 'string';
}

export function isComarkComment(node: ComarkNode): node is ComarkComment {
  return Array.isArray(node) && node[0] === null;
}

export function isComarkText(node: ComarkNode): node is string {
  return typeof node === 'string';
}

/** The tag name of a comark element, e.g. `'h1'`, `'strong'`, `'a'`. */
export function comarkTag(element: ComarkElement): string {
  return element[0];
}

/** The children of a comark element (everything after tag + attributes). */
export function comarkChildren(element: ComarkElement): ComarkNode[] {
  return element.slice(2) as ComarkNode[];
}

/**
 * The concatenated text content of a comark node, ignoring attributes and
 * element structure. Used to recover code-block and other literal text.
 */
export function comarkTextContent(node: ComarkNode): string {
  if (isComarkText(node)) {
    return node;
  }
  if (isComarkComment(node)) {
    return '';
  }
  let text = '';
  for (const child of comarkChildren(node)) {
    text += comarkTextContent(child);
  }
  return text;
}

export interface ComarkTransformersByType {
  readonly element: readonly ComarkElementTransformer[];
  readonly inline: readonly ComarkInlineTransformer[];
  readonly textFormat: readonly ComarkTextFormatTransformer[];
  readonly elementByTag: Readonly<Record<string, ComarkElementTransformer>>;
  readonly inlineByTag: Readonly<Record<string, ComarkInlineTransformer>>;
  readonly textFormatByTag: Readonly<
    Record<string, ComarkTextFormatTransformer>
  >;
}

/**
 * Split a flat list of transformers into per-kind buckets with tag lookup
 * tables, mirroring the `transformersByType` helper in `@lexical/markdown`.
 */
export function transformersByType(
  transformers: readonly ComarkTransformer[],
): ComarkTransformersByType {
  const element: ComarkElementTransformer[] = [];
  const inline: ComarkInlineTransformer[] = [];
  const textFormat: ComarkTextFormatTransformer[] = [];
  const elementByTag: Record<string, ComarkElementTransformer> = {};
  const inlineByTag: Record<string, ComarkInlineTransformer> = {};
  const textFormatByTag: Record<string, ComarkTextFormatTransformer> = {};

  for (const transformer of transformers) {
    switch (transformer.type) {
      case 'element':
        element.push(transformer);
        for (const tag of transformer.comarkTags) {
          elementByTag[tag] = transformer;
        }
        break;
      case 'inline':
        inline.push(transformer);
        for (const tag of transformer.comarkTags) {
          inlineByTag[tag] = transformer;
        }
        break;
      case 'text-format':
        textFormat.push(transformer);
        textFormatByTag[transformer.comarkTag] = transformer;
        break;
    }
  }

  return {
    element,
    elementByTag,
    inline,
    inlineByTag,
    textFormat,
    textFormatByTag,
  };
}
