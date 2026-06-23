/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {ListType} from '@lexical/list';
import type {HeadingTagType} from '@lexical/rich-text';
import type {ComarkElement, ComarkElementAttributes, ComarkNode} from 'comark';
import type {ElementNode, Klass, LexicalNode, TextFormatType} from 'lexical';

import {$createCodeNode, $isCodeNode, CodeNode} from '@lexical/code-core';
import {$createLinkNode, $isLinkNode, LinkNode} from '@lexical/link';
import {
  $createListItemNode,
  $createListNode,
  $isListNode,
  ListItemNode,
  ListNode,
} from '@lexical/list';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
  QuoteNode,
} from '@lexical/rich-text';
import {
  $createLineBreakNode,
  $createTextNode,
  $isLineBreakNode,
  $isTextNode,
} from 'lexical';

import {
  comarkChildren,
  comarkTag,
  comarkTextContent,
  ComarkTransformersByType,
  isComarkElement,
} from './utils';

/**
 * Context passed to the `$import*` hooks of a {@link ComarkTransformer}. It
 * exposes the engine's recursion helpers so a transformer can build the
 * Lexical children of the comark element it is handling.
 */
export interface ComarkImportContext {
  readonly transformers: ComarkTransformersByType;
  /**
   * Convert a list of inline comark nodes into Lexical nodes, applying the
   * given accumulated text-format bitmask (see lexical's `TextNode.setFormat`).
   */
  $importInline: (children: ComarkNode[], format: number) => LexicalNode[];
  /** Convert block-level comark nodes into top-level Lexical nodes. */
  $importBlocks: (children: ComarkNode[]) => LexicalNode[];
}

/**
 * Context passed to the `$exportNode` hooks of a {@link ComarkTransformer}.
 */
export interface ComarkExportContext {
  readonly transformers: ComarkTransformersByType;
  /** Export the inline children of an element node to comark nodes. */
  $exportInline: (node: ElementNode) => ComarkNode[];
  /** Export a single block-level Lexical node to comark node(s). */
  $exportBlock: (node: LexicalNode) => ComarkNode | null;
}

/**
 * Handles block-level comark elements (headings, quotes, lists, code blocks)
 * and their corresponding Lexical {@link ElementNode}s.
 */
export interface ComarkElementTransformer {
  readonly type: 'element';
  readonly dependencies: readonly Klass<LexicalNode>[];
  /** comark tag names handled on import, e.g. `['h1', ..., 'h6']`. */
  readonly comarkTags: readonly string[];
  /**
   * Build the Lexical node(s) for `element`, or return `null` to decline (the
   * engine then falls back to a paragraph). Mirrors the return-nodes contract
   * of `$generateNodesFromDOM`.
   */
  readonly $importElement: (
    element: ComarkElement,
    ctx: ComarkImportContext,
  ) => LexicalNode | LexicalNode[] | null;
  /**
   * Produce comark node(s) for a Lexical node, or `null` when this transformer
   * does not handle the node.
   */
  readonly $exportNode: (
    node: LexicalNode,
    ctx: ComarkExportContext,
  ) => ComarkNode | null;
}

/**
 * Handles inline comark elements that map to a dedicated Lexical node (links,
 * line breaks, ...) rather than a text format.
 */
export interface ComarkInlineTransformer {
  readonly type: 'inline';
  readonly dependencies: readonly Klass<LexicalNode>[];
  readonly comarkTags: readonly string[];
  readonly $importInline: (
    element: ComarkElement,
    format: number,
    ctx: ComarkImportContext,
  ) => LexicalNode | LexicalNode[] | null;
  readonly $exportNode: (
    node: LexicalNode,
    ctx: ComarkExportContext,
  ) => ComarkNode | null;
}

/**
 * Maps an inline comark element (e.g. `strong`) to a Lexical text format
 * (e.g. `'bold'`). This mirrors `TextFormatTransformer` in `@lexical/markdown`,
 * but keyed by comark tag instead of by markdown delimiter.
 */
export interface ComarkTextFormatTransformer {
  readonly type: 'text-format';
  /** The comark element tag, e.g. `'strong'`, `'em'`, `'del'`, `'code'`. */
  readonly comarkTag: string;
  /** The Lexical text format applied to descendant text nodes. */
  readonly format: TextFormatType;
}

export type ComarkTransformer =
  | ComarkElementTransformer
  | ComarkInlineTransformer
  | ComarkTextFormatTransformer;

const TASK_LIST_CLASS = 'contains-task-list';

function attrString(
  attrs: ComarkElementAttributes,
  key: string,
): string | undefined {
  const value = attrs[key];
  return typeof value === 'string' ? value : undefined;
}

export const HEADING: ComarkElementTransformer = {
  $exportNode: (node, ctx) => {
    if (!$isHeadingNode(node)) {
      return null;
    }
    return [node.getTag(), {}, ...ctx.$exportInline(node)];
  },
  $importElement: (element, ctx) => {
    const node = $createHeadingNode(comarkTag(element) as HeadingTagType);
    node.append(...ctx.$importInline(comarkChildren(element), 0));
    return node;
  },
  comarkTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  dependencies: [HeadingNode],
  type: 'element',
};

export const QUOTE: ComarkElementTransformer = {
  $exportNode: (node, ctx) => {
    if (!$isQuoteNode(node)) {
      return null;
    }
    return ['blockquote', {}, ...ctx.$exportInline(node)];
  },
  $importElement: (element, ctx) => {
    const node = $createQuoteNode();
    // A blockquote contains either inline children (single paragraph) or `p`
    // blocks (multiple paragraphs). Flatten `p` blocks, separating them with a
    // line break so the quote stays a single Lexical block.
    let needsSeparator = false;
    for (const child of comarkChildren(element)) {
      if (isComarkElement(child) && comarkTag(child) === 'p') {
        if (needsSeparator) {
          node.append($createLineBreakNode());
        }
        node.append(...ctx.$importInline(comarkChildren(child), 0));
        needsSeparator = true;
      } else {
        node.append(...ctx.$importInline([child], 0));
        needsSeparator = true;
      }
    }
    return node;
  },
  comarkTags: ['blockquote'],
  dependencies: [QuoteNode],
  type: 'element',
};

function listTypeOf(element: ComarkElement): ListType {
  if (comarkTag(element) === 'ol') {
    return 'number';
  }
  const className = attrString(element[1], 'class');
  return className && className.includes(TASK_LIST_CLASS) ? 'check' : 'bullet';
}

function $importComarkList(
  element: ComarkElement,
  ctx: ComarkImportContext,
): ListNode {
  const listType = listTypeOf(element);
  const startAttr =
    listType === 'number' ? attrString(element[1], 'start') : undefined;
  const start = startAttr != null ? Number(startAttr) : undefined;
  const list = $createListNode(listType, start);

  for (const child of comarkChildren(element)) {
    if (!isComarkElement(child) || comarkTag(child) !== 'li') {
      continue;
    }
    $appendComarkListItem(list, child, listType, ctx);
  }

  return list;
}

function $appendComarkListItem(
  list: ListNode,
  li: ComarkElement,
  listType: ListType,
  ctx: ComarkImportContext,
): void {
  const liChildren = comarkChildren(li);
  let checked: boolean | undefined;
  const inlineNodes: LexicalNode[] = [];
  const nestedLists: ComarkElement[] = [];

  for (const child of liChildren) {
    if (isComarkElement(child)) {
      const tag = comarkTag(child);
      if (tag === 'ul' || tag === 'ol') {
        nestedLists.push(child);
        continue;
      }
      if (tag === 'input') {
        // Task-list checkbox marker. comark emits it as the first child of a
        // `task-list-item` with a `:checked` attribute when ticked.
        checked = child[1][':checked'] === 'true';
        continue;
      }
      if (tag === 'p') {
        // Unwrap a paragraph so its inline content lands directly in the item.
        inlineNodes.push(...ctx.$importInline(comarkChildren(child), 0));
        continue;
      }
    }
    inlineNodes.push(...ctx.$importInline([child], 0));
  }

  // Task-list text content is emitted as " text" (with a leading space that
  // separates it from the checkbox). Drop that single leading space.
  if (
    listType === 'check' &&
    inlineNodes.length > 0 &&
    $isTextNode(inlineNodes[0])
  ) {
    const first = inlineNodes[0];
    const text = first.getTextContent();
    if (text.startsWith(' ')) {
      first.setTextContent(text.slice(1));
    }
  }

  const item = $createListItemNode(
    listType === 'check' ? !!checked : undefined,
  );
  item.append(...inlineNodes);
  list.append(item);

  // Lexical represents a nested list as a list item whose only child is the
  // nested ListNode, appended as a sibling of the item it nests under.
  for (const nested of nestedLists) {
    const wrapper = $createListItemNode();
    wrapper.append($importComarkList(nested, ctx));
    list.append(wrapper);
  }
}

const LIST_INDENT_SIZE = 4;

function $exportComarkList(
  listNode: ListNode,
  ctx: ComarkExportContext,
  depth = 0,
): ComarkElement {
  const listType = listNode.getListType();
  const tag = listType === 'number' ? 'ol' : 'ul';
  const attrs: ComarkElementAttributes = {};
  if (listType === 'check') {
    attrs.class = TASK_LIST_CLASS;
  }
  const start = listNode.getStart();
  if (listType === 'number' && start !== 1) {
    attrs.start = String(start);
  }

  const items: ComarkNode[] = [];
  for (const item of listNode.getChildren()) {
    if (!(item instanceof ListItemNode)) {
      continue;
    }
    const firstChild = item.getFirstChild();
    // A list item that only wraps a nested list folds into the previous item.
    if (item.getChildrenSize() === 1 && $isListNode(firstChild)) {
      const nested = $exportComarkList(firstChild, ctx, depth + 1);
      const previous = items[items.length - 1];
      if (isComarkElement(previous)) {
        previous.push(nested);
      } else {
        items.push(['li', {}, nested]);
      }
      continue;
    }

    const liAttrs: ComarkElementAttributes = {};
    const liChildren: ComarkNode[] = [];
    if (listType === 'check') {
      liAttrs.class = 'task-list-item';
      const inputAttrs: ComarkElementAttributes = {type: 'checkbox'};
      if (item.getChecked()) {
        inputAttrs[':checked'] = 'true';
      }
      // The leading space mirrors comark's own task-list serialization.
      liChildren.push(['input', inputAttrs], ' ', ...ctx.$exportInline(item));
    } else {
      liChildren.push(...ctx.$exportInline(item));
    }
    items.push(['li', liAttrs, ...liChildren]);
  }

  return [tag, attrs, ...items];
}

export const LIST: ComarkElementTransformer = {
  $exportNode: (node, ctx) => {
    if (!$isListNode(node)) {
      return null;
    }
    return $exportComarkList(node, ctx);
  },
  $importElement: (element, ctx) => $importComarkList(element, ctx),
  comarkTags: ['ul', 'ol'],
  dependencies: [ListNode, ListItemNode],
  type: 'element',
};

export const CODE: ComarkElementTransformer = {
  $exportNode: node => {
    if (!$isCodeNode(node)) {
      return null;
    }
    const language = node.getLanguage();
    const text = node.getTextContent();
    const codeAttrs: ComarkElementAttributes = language
      ? {class: `language-${language}`}
      : {};
    return ['pre', {}, ['code', codeAttrs, text]];
  },
  $importElement: element => {
    let language = attrString(element[1], 'language');
    let text = '';
    for (const child of comarkChildren(element)) {
      if (isComarkElement(child) && comarkTag(child) === 'code') {
        const className = attrString(child[1], 'class');
        if (!language && className) {
          const match = /language-(\S+)/.exec(className);
          if (match) {
            language = match[1];
          }
        }
        text = comarkTextContent(child);
        break;
      }
    }
    const node = $createCodeNode(language);
    if (text) {
      node.append($createTextNode(text));
    }
    return node;
  },
  comarkTags: ['pre'],
  dependencies: [CodeNode],
  type: 'element',
};

export const LINK: ComarkInlineTransformer = {
  $exportNode: (node, ctx) => {
    if (!$isLinkNode(node)) {
      return null;
    }
    const attrs: ComarkElementAttributes = {href: node.getURL()};
    const title = node.getTitle();
    if (title != null) {
      attrs.title = title;
    }
    return ['a', attrs, ...ctx.$exportInline(node)];
  },
  $importInline: (element, format, ctx) => {
    const url = attrString(element[1], 'href') || '';
    const title = attrString(element[1], 'title');
    const link = $createLinkNode(url, title != null ? {title} : undefined);
    link.append(...ctx.$importInline(comarkChildren(element), format));
    return link;
  },
  comarkTags: ['a'],
  dependencies: [LinkNode],
  type: 'inline',
};

export const LINE_BREAK: ComarkInlineTransformer = {
  $exportNode: node => ($isLineBreakNode(node) ? ['br', {}] : null),
  $importInline: () => $createLineBreakNode(),
  comarkTags: ['br'],
  dependencies: [],
  type: 'inline',
};

export const BOLD: ComarkTextFormatTransformer = {
  comarkTag: 'strong',
  format: 'bold',
  type: 'text-format',
};

export const ITALIC: ComarkTextFormatTransformer = {
  comarkTag: 'em',
  format: 'italic',
  type: 'text-format',
};

export const STRIKETHROUGH: ComarkTextFormatTransformer = {
  comarkTag: 'del',
  format: 'strikethrough',
  type: 'text-format',
};

export const INLINE_CODE: ComarkTextFormatTransformer = {
  comarkTag: 'code',
  format: 'code',
  type: 'text-format',
};

export const COMARK_ELEMENT_TRANSFORMERS: readonly ComarkElementTransformer[] =
  [HEADING, QUOTE, LIST, CODE];

export const COMARK_INLINE_TRANSFORMERS: readonly ComarkInlineTransformer[] = [
  LINK,
  LINE_BREAK,
];

export const COMARK_TEXT_FORMAT_TRANSFORMERS: readonly ComarkTextFormatTransformer[] =
  [BOLD, ITALIC, STRIKETHROUGH, INLINE_CODE];

/**
 * The default set of transformers, covering headings, quotes, lists (including
 * check lists), code blocks, links, line breaks and the standard inline text
 * formats. Mirrors `TRANSFORMERS` from `@lexical/markdown`.
 */
export const COMARK_TRANSFORMERS: readonly ComarkTransformer[] = [
  ...COMARK_ELEMENT_TRANSFORMERS,
  ...COMARK_INLINE_TRANSFORMERS,
  ...COMARK_TEXT_FORMAT_TRANSFORMERS,
];

export {LIST_INDENT_SIZE};
