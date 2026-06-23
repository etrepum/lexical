/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  ComarkExportContext,
  ComarkTransformer,
} from './ComarkTransformers';
import type {ComarkNode, ComarkTree} from 'comark';
import type {ElementNode, LexicalNode, TextNode} from 'lexical';

import {$getRoot, $isElementNode, $isParagraphNode, $isTextNode} from 'lexical';

import {COMARK_TRANSFORMERS} from './ComarkTransformers';
import {ComarkTransformersByType, transformersByType} from './utils';

export interface ComarkExportOptions {
  /** The element to export. Defaults to the root node. */
  node?: ElementNode;
  /** Transformers to use. Defaults to {@link COMARK_TRANSFORMERS}. */
  transformers?: readonly ComarkTransformer[];
  /** Frontmatter to attach to the exported tree. */
  frontmatter?: Record<string, unknown>;
}

function $exportTextNode(
  node: TextNode,
  byType: ComarkTransformersByType,
): ComarkNode {
  const text = node.getTextContent();
  // Per CommonMark, code spans are literal and take precedence over every
  // other inline format, so emit code on its own.
  const codeTransformer = byType.textFormat.find(t => t.format === 'code');
  if (codeTransformer && node.hasFormat('code')) {
    return [codeTransformer.comarkTag, {}, text];
  }

  let result: ComarkNode = text;
  // Wrapping in transformer order makes the last applicable format the
  // outermost element, which matches comark's own nesting (e.g. `em > strong`
  // for bold+italic, rendered as `***`).
  for (const transformer of byType.textFormat) {
    if (transformer.format === 'code') {
      continue;
    }
    if (node.hasFormat(transformer.format)) {
      result = [transformer.comarkTag, {}, result];
    }
  }
  return result;
}

function createExportContext(
  byType: ComarkTransformersByType,
): ComarkExportContext {
  const $exportInline = (node: ElementNode): ComarkNode[] => {
    const output: ComarkNode[] = [];
    for (const child of node.getChildren()) {
      if ($isTextNode(child)) {
        output.push($exportTextNode(child, byType));
        continue;
      }
      let handled = false;
      for (const transformer of byType.inline) {
        const result = transformer.$exportNode(child, ctx);
        if (result != null) {
          output.push(result);
          handled = true;
          break;
        }
      }
      if (handled) {
        continue;
      }
      // Fall back to the inline content of any other element node.
      if ($isElementNode(child)) {
        output.push(...$exportInline(child));
      }
    }
    return output;
  };

  const $exportBlock = (node: LexicalNode): ComarkNode | null => {
    for (const transformer of byType.element) {
      const result = transformer.$exportNode(node, ctx);
      if (result != null) {
        return result;
      }
    }
    if ($isParagraphNode(node)) {
      return ['p', {}, ...$exportInline(node)];
    }
    // Best-effort: treat any other block element as a paragraph.
    if ($isElementNode(node)) {
      return ['p', {}, ...$exportInline(node)];
    }
    return null;
  };

  const ctx: ComarkExportContext = {
    $exportBlock,
    $exportInline,
    transformers: byType,
  };
  return ctx;
}

/**
 * Build a comark {@link ComarkTree} from the current editor state. Mirrors
 * `$generateDOMFromNodes` from `@lexical/html`: it is the synchronous core of
 * the export path and must be called within an `editor.read()` or
 * `editor.update()`. Render the result to markdown with comark's async
 * `renderMarkdown`.
 */
export function $generateComarkTreeFromNodes(
  options: ComarkExportOptions = {},
): ComarkTree {
  const byType = transformersByType(
    options.transformers ?? COMARK_TRANSFORMERS,
  );
  const root = options.node ?? $getRoot();
  const ctx = createExportContext(byType);

  const nodes: ComarkNode[] = [];
  for (const child of root.getChildren()) {
    const exported = ctx.$exportBlock(child);
    if (exported != null) {
      nodes.push(exported);
    }
  }

  return {
    frontmatter: options.frontmatter ?? {},
    meta: {},
    nodes,
  };
}
