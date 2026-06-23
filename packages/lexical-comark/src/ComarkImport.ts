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

export interface ComarkImportOptions {
  /**
   * The element to import into. Defaults to the root node. Its existing
   * children are replaced.
   */
  node?: ElementNode;
  /** Transformers to use. Defaults to {@link COMARK_TRANSFORMERS}. */
  transformers?: readonly ComarkTransformer[];
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

  const $importBlocks = (children: ComarkNode[], parent: ElementNode): void => {
    for (const child of children) {
      if (isComarkComment(child)) {
        continue;
      }
      if (isComarkText(child)) {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(child));
        parent.append(paragraph);
        continue;
      }
      const tag = comarkTag(child);
      const element = byType.elementByTag[tag];
      if (element && element.$importElement(child, parent, ctx) !== false) {
        continue;
      }
      if (SKIPPED_BLOCK_TAGS.has(tag)) {
        continue;
      }
      // Default: a paragraph (covers `p` and any unhandled block element).
      const paragraph = $createParagraphNode();
      paragraph.append(...$importInline(comarkChildren(child), 0));
      parent.append(paragraph);
    }
  };

  const ctx: ComarkImportContext = {
    $importBlocks,
    $importInline,
    transformers: byType,
  };
  return ctx;
}

/**
 * Build Lexical nodes from a parsed comark {@link ComarkTree}. Must be called
 * within an `editor.update()`. To parse a markdown string first, use
 * {@link convertFromComarkString} which awaits comark's async parser.
 */
export function $importComarkTree(
  tree: ComarkTree,
  options: ComarkImportOptions = {},
): void {
  const byType = transformersByType(
    options.transformers ?? COMARK_TRANSFORMERS,
  );
  const root = options.node ?? $getRoot();
  root.clear();

  const ctx = createImportContext(byType);
  ctx.$importBlocks(tree.nodes, root);

  // Markdown has no concept of empty paragraphs (blank lines are delimiters),
  // so drop the stray empty paragraphs left by block separators.
  for (const child of root.getChildren()) {
    if (isEmptyParagraph(child) && root.getChildrenSize() > 1) {
      child.remove();
    }
  }

  // Guarantee a non-empty container so the editor remains editable.
  if (root.getChildrenSize() === 0 && $isElementNode(root)) {
    root.append($createParagraphNode());
  }

  if ($getSelection() !== null) {
    root.selectStart();
  }
}
