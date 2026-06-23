/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  ComarkImportContext,
  ComarkTransformer,
} from './ComarkTransformers';
import type {ComarkNode, ComarkTree} from 'comark';
import type {ElementNode, LexicalNode} from 'lexical';

import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  TEXT_TYPE_TO_FORMAT,
} from 'lexical';

import {COMARK_TRANSFORMERS} from './ComarkTransformers';
import {
  comarkChildren,
  comarkTag,
  ComarkTransformersByType,
  isComarkComment,
  isComarkText,
  transformersByType,
} from './utils';

// Block-level void tags that have no Lexical core node and are skipped rather
// than rendered as an empty paragraph. They can be handled by supplying a
// custom transformer.
const SKIPPED_BLOCK_TAGS = new Set(['hr', 'img', 'input']);

export interface ComarkGenerateNodesOptions {
  /** Transformers to use. Defaults to {@link COMARK_TRANSFORMERS}. */
  transformers?: readonly ComarkTransformer[];
}

export interface ComarkImportOptions extends ComarkGenerateNodesOptions {
  /**
   * The element whose children are replaced. Defaults to the root node.
   */
  node?: ElementNode;
}

function isEmptyParagraph(node: LexicalNode): boolean {
  if (!$isParagraphNode(node)) {
    return false;
  }
  const firstChild = node.getFirstChild();
  return (
    firstChild === null ||
    (node.getChildrenSize() === 1 &&
      firstChild.getType() === 'text' &&
      firstChild.getTextContent() === '')
  );
}

/**
 * Build the recursion helpers used by the transformers. Exposed for the
 * shortcut engine, which reuses `$importInline` to convert a matched inline
 * construct into Lexical nodes.
 */
export function createImportContext(
  byType: ComarkTransformersByType,
): ComarkImportContext {
  const $importInline = (
    children: ComarkNode[],
    format: number,
  ): LexicalNode[] => {
    const output: LexicalNode[] = [];
    for (const child of children) {
      if (isComarkText(child)) {
        const textNode = $createTextNode(child);
        if (format !== 0) {
          textNode.setFormat(format);
        }
        output.push(textNode);
        continue;
      }
      if (isComarkComment(child)) {
        continue;
      }
      const tag = comarkTag(child);
      const textFormat = byType.textFormatByTag[tag];
      if (textFormat) {
        output.push(
          ...$importInline(
            comarkChildren(child),
            format | TEXT_TYPE_TO_FORMAT[textFormat.format],
          ),
        );
        continue;
      }
      const inline = byType.inlineByTag[tag];
      if (inline) {
        const node = inline.$importInline(child, format, ctx);
        if (Array.isArray(node)) {
          output.push(...node);
        } else if (node) {
          output.push(node);
        }
        continue;
      }
      // Unknown inline element: keep its textual content (best effort).
      output.push(...$importInline(comarkChildren(child), format));
    }
    return output;
  };

  const $importBlocks = (children: ComarkNode[]): LexicalNode[] => {
    const output: LexicalNode[] = [];
    for (const child of children) {
      if (isComarkComment(child)) {
        continue;
      }
      if (isComarkText(child)) {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(child));
        output.push(paragraph);
        continue;
      }
      const tag = comarkTag(child);
      const element = byType.elementByTag[tag];
      if (element) {
        const result = element.$importElement(child, ctx);
        if (Array.isArray(result)) {
          output.push(...result);
          continue;
        }
        if (result) {
          output.push(result);
          continue;
        }
        // A null result means the transformer declined; fall through.
      }
      if (SKIPPED_BLOCK_TAGS.has(tag)) {
        continue;
      }
      // Default: a paragraph (covers `p` and any unhandled block element).
      const paragraph = $createParagraphNode();
      paragraph.append(...$importInline(comarkChildren(child), 0));
      output.push(paragraph);
    }
    return output;
  };

  const ctx: ComarkImportContext = {
    $importBlocks,
    $importInline,
    transformers: byType,
  };
  return ctx;
}

/**
 * Convert a parsed comark {@link ComarkTree} into top-level Lexical nodes.
 *
 * This is the synchronous core of the import path, mirroring
 * `$generateNodesFromDOM` from `@lexical/html`. It performs no editor mutation
 * and returns the generated nodes for the caller to insert, so it must be
 * called within an `editor.update()` or `editor.read()`.
 */
export function $generateNodesFromComarkTree(
  tree: ComarkTree,
  options: ComarkGenerateNodesOptions = {},
): LexicalNode[] {
  const byType = transformersByType(
    options.transformers ?? COMARK_TRANSFORMERS,
  );
  const nodes = createImportContext(byType).$importBlocks(tree.nodes);
  // Markdown has no concept of empty paragraphs (blank lines are delimiters),
  // so drop the stray empty paragraphs left by block separators.
  return nodes.length > 1
    ? nodes.filter(node => !isEmptyParagraph(node))
    : nodes;
}

/**
 * Replace the children of `options.node` (default: root) with the Lexical
 * nodes generated from `tree`, moving the selection to the start. Returns the
 * inserted nodes. Synchronous — call within an `editor.update()`.
 */
export function $importComarkTree(
  tree: ComarkTree,
  options: ComarkImportOptions = {},
): LexicalNode[] {
  const root = options.node ?? $getRoot();
  const nodes = $generateNodesFromComarkTree(tree, options);
  root.clear();
  for (const node of nodes) {
    root.append(node);
  }
  // Guarantee a non-empty container so the editor remains editable.
  if (root.getChildrenSize() === 0 && $isElementNode(root)) {
    root.append($createParagraphNode());
  }
  if ($getSelection() !== null) {
    root.selectStart();
  }
  return nodes;
}
