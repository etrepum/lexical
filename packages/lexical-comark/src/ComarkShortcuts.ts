/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {ComarkTransformer} from './ComarkTransformers';
import type {ComarkParseFn} from 'comark';
import type {
  ElementNode,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  TextNode,
} from 'lexical';

import {$createCodeNode, $isCodeNode} from '@lexical/code-core';
import invariant from '@lexical/internal/invariant';
import {$createListItemNode, $createListNode, $isListNode} from '@lexical/list';
import {$createHeadingNode, $createQuoteNode} from '@lexical/rich-text';
import {mergeRegister} from '@lexical/utils';
import {createParse} from 'comark';
import {renderMarkdown} from 'comark/render';
import {
  $addUpdateTag,
  $createTextNode,
  $getNodeByKey,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  COLLABORATION_TAG,
  COMMAND_PRIORITY_LOW,
  HISTORIC_TAG,
  HISTORY_PUSH_TAG,
  KEY_ENTER_COMMAND,
} from 'lexical';

import {createImportContext} from './ComarkImport';
import {COMARK_TRANSFORMERS} from './ComarkTransformers';
import {
  comarkChildren,
  comarkTag,
  ComarkTransformersByType,
  isComarkElement,
  transformersByType,
} from './utils';

export interface ComarkShortcutOptions {
  /** Transformers to use. Defaults to {@link COMARK_TRANSFORMERS}. */
  transformers?: readonly ComarkTransformer[];
}

// Characters that may close an inline markdown construct and are therefore
// worth handing to comark for streaming detection.
const INLINE_TRIGGER_CHARS = new Set(['*', '_', '~', '`', ')']);

const CODE_FENCE_REGEXP = /^```(\w*)$/;

// ---------------------------------------------------------------------------
// Block shortcuts (synchronous, marker-prefix based).
//
// Block markers strip their syntax irreversibly (`# ` becomes a heading with no
// remaining `#`), so they cannot be re-derived from the resulting text. They
// fire the moment the marker is completed, exactly like `@lexical/markdown`.
// ---------------------------------------------------------------------------

function $consumeMarker(
  anchorNode: TextNode,
  anchorOffset: number,
): {leadingNode: TextNode; siblings: LexicalNode[]} {
  const nextSiblings = anchorNode.getNextSiblings();
  const [leadingNode, remainderNode] = anchorNode.splitText(anchorOffset);
  const siblings = remainderNode
    ? [remainderNode, ...nextSiblings]
    : nextSiblings;
  return {leadingNode, siblings};
}

function $replaceWithBlock(
  paragraph: ElementNode,
  anchorNode: TextNode,
  anchorOffset: number,
  makeNode: () => ElementNode,
): void {
  const {leadingNode, siblings} = $consumeMarker(anchorNode, anchorOffset);
  const node = makeNode();
  node.append(...siblings);
  paragraph.replace(node);
  node.selectStart();
  leadingNode.remove();
}

function $replaceWithListItem(
  paragraph: ElementNode,
  anchorNode: TextNode,
  anchorOffset: number,
  listType: 'bullet' | 'number' | 'check',
  start: number | undefined,
  checked: boolean | undefined,
): void {
  const {leadingNode, siblings} = $consumeMarker(anchorNode, anchorOffset);
  const item = $createListItemNode(
    listType === 'check' ? !!checked : undefined,
  );
  const previous = paragraph.getPreviousSibling();
  if ($isListNode(previous) && previous.getListType() === listType) {
    previous.append(item);
    paragraph.remove();
  } else {
    const list = $createListNode(listType, start);
    list.append(item);
    paragraph.replace(list);
  }
  item.append(...siblings);
  item.selectStart();
  leadingNode.remove();
}

function $tryBlockShortcut(
  paragraph: ElementNode,
  anchorNode: TextNode,
  anchorOffset: number,
): boolean {
  if (
    !$isParagraphNode(paragraph) ||
    !$isRootOrShadowRoot(paragraph.getParent()) ||
    paragraph.getFirstChild() !== anchorNode
  ) {
    return false;
  }

  const prefix = anchorNode.getTextContent().slice(0, anchorOffset);
  let match: RegExpExecArray | null;

  if ((match = /^(#{1,6}) $/.exec(prefix))) {
    const level = match[1].length;
    $replaceWithBlock(paragraph, anchorNode, anchorOffset, () =>
      $createHeadingNode(`h${level}` as 'h1'),
    );
    return true;
  }
  if (/^> $/.test(prefix)) {
    $replaceWithBlock(paragraph, anchorNode, anchorOffset, $createQuoteNode);
    return true;
  }
  if ((match = /^\[([ xX])\] $/.exec(prefix))) {
    const checked = match[1].toLowerCase() === 'x';
    $replaceWithListItem(
      paragraph,
      anchorNode,
      anchorOffset,
      'check',
      undefined,
      checked,
    );
    return true;
  }
  if (/^[-*+] $/.test(prefix)) {
    $replaceWithListItem(
      paragraph,
      anchorNode,
      anchorOffset,
      'bullet',
      undefined,
      undefined,
    );
    return true;
  }
  if ((match = /^(\d+)[.)] $/.exec(prefix))) {
    $replaceWithListItem(
      paragraph,
      anchorNode,
      anchorOffset,
      'number',
      Number(match[1]),
      undefined,
    );
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Inline shortcuts (asynchronous, comark-powered).
//
// comark's streaming parser with `autoClose: false` only reports *complete*
// inline constructs, which is exactly the trigger condition we want. The
// matched element is converted back to Lexical nodes by reusing the import
// engine, so bold/italic/strikethrough/inline-code/links and their nesting all
// flow through the same code path as full-document import.
// ---------------------------------------------------------------------------

interface InlineCandidate {
  anchorKey: NodeKey;
  caret: number;
  nodeText: string;
}

const EXPECTED_CLOSE_CHARS: Record<string, readonly string[]> = {
  a: [')'],
  code: ['`'],
  del: ['~'],
  em: ['*', '_'],
  strong: ['*', '_'],
};

function isSupportedInlineTag(
  tag: string,
  byType: ComarkTransformersByType,
): boolean {
  return (
    byType.textFormatByTag[tag] !== undefined ||
    byType.inlineByTag[tag] !== undefined
  );
}

async function $maybeApplyInlineShortcut(
  editor: LexicalEditor,
  candidate: InlineCandidate,
  parse: ComarkParseFn,
  byType: ComarkTransformersByType,
): Promise<void> {
  const {nodeText, caret} = candidate;
  const before = nodeText.slice(0, caret);

  let lastParagraphChild;
  try {
    const tree = await parse(before);
    const paragraph = tree.nodes[tree.nodes.length - 1];
    if (!isComarkElement(paragraph) || comarkTag(paragraph) !== 'p') {
      return;
    }
    const children = comarkChildren(paragraph);
    lastParagraphChild = children[children.length - 1];
  } catch {
    return;
  }

  // The construct must be an element that ends exactly at the caret.
  if (!isComarkElement(lastParagraphChild)) {
    return;
  }
  const tag = comarkTag(lastParagraphChild);
  if (!isSupportedInlineTag(tag, byType)) {
    return;
  }
  const expectedCloseChars = EXPECTED_CLOSE_CHARS[tag];
  if (expectedCloseChars && !expectedCloseChars.includes(nodeText[caret - 1])) {
    return;
  }

  // Recover the exact source span by rendering the matched element back to
  // markdown; its length locates the opening delimiter in the source text.
  let source: string;
  try {
    source = (
      await renderMarkdown({
        frontmatter: {},
        meta: {},
        nodes: [['p', {}, lastParagraphChild]],
      })
    ).trimEnd();
  } catch {
    return;
  }

  const sourceStart = caret - source.length;
  if (sourceStart < 0) {
    return;
  }
  // While the closing delimiter of a longer run is still being typed, comark
  // reports a shorter complete construct (e.g. `**bold*` parses as `*bold*`).
  // The tell-tale is a delimiter character immediately before the detected
  // span: defer until the full run is closed (`**bold**`).
  if (sourceStart > 0 && nodeText[sourceStart - 1] === nodeText[caret - 1]) {
    return;
  }
  const expectedSource = nodeText.slice(sourceStart, caret);
  if (/^\s/.test(expectedSource)) {
    return;
  }

  const element = lastParagraphChild;
  editor.update(() => {
    const node = $getNodeByKey(candidate.anchorKey);
    if (!$isTextNode(node) || node.hasFormat('code')) {
      return;
    }
    const current = node.getTextContent();
    // Bail if the source span moved or changed since detection (stale parse).
    if (current.slice(sourceStart, caret) !== expectedSource) {
      return;
    }

    const format = node.getFormat();
    const imported = createImportContext(byType).$importInline(
      [element],
      format,
    );
    if (imported.length === 0) {
      return;
    }

    const left = current.slice(0, sourceStart);
    const right = current.slice(caret);

    if (left) {
      const leftNode = $createTextNode(left);
      leftNode.setFormat(format);
      node.insertBefore(leftNode);
    }
    for (const importedNode of imported) {
      node.insertBefore(importedNode);
    }
    let rightNode: TextNode | null = null;
    if (right) {
      rightNode = $createTextNode(right);
      rightNode.setFormat(format);
      node.insertBefore(rightNode);
    }
    node.remove();

    // Place the caret immediately after the transformed content.
    const lastImported = imported[imported.length - 1];
    if (rightNode) {
      rightNode.select(0, 0);
    } else if ($isTextNode(lastImported)) {
      const size = lastImported.getTextContentSize();
      lastImported.select(size, size);
    } else {
      lastImported.selectNext(0, 0);
    }

    $addUpdateTag(HISTORY_PUSH_TAG);
  });
}

// ---------------------------------------------------------------------------

function assertDependencies(
  editor: LexicalEditor,
  transformers: readonly ComarkTransformer[],
): void {
  for (const transformer of transformers) {
    if (transformer.type === 'text-format') {
      continue;
    }
    for (const klass of transformer.dependencies) {
      if (!editor.hasNode(klass)) {
        invariant(
          false,
          'registerComarkShortcuts: missing dependency %s for transformer. Ensure node dependency is included in editor initial config.',
          klass.getType(),
        );
      }
    }
  }
}

/**
 * Register streaming markdown shortcuts on an editor.
 *
 * Block-level shortcuts (`# `, `> `, `- `, `1. `, `[ ] `, and a fenced
 * <code>```</code> on Enter) are applied synchronously the moment their marker
 * is completed. Inline shortcuts (bold, italic, strikethrough, inline code and
 * links) are detected with comark's streaming parser and applied a microtask
 * later, reusing the same transformers as full-document import.
 *
 * @returns a function that removes the registered listeners.
 */
export function registerComarkShortcuts(
  editor: LexicalEditor,
  options: ComarkShortcutOptions = {},
): () => void {
  const transformers = options.transformers ?? COMARK_TRANSFORMERS;
  const byType = transformersByType(transformers);
  assertDependencies(editor, transformers);

  // `autoClose: false` reports only complete inline constructs.
  const parse: ComarkParseFn = createParse({autoClose: false});

  return mergeRegister(
    editor.registerUpdateListener(
      ({tags, dirtyLeaves, editorState, prevEditorState}) => {
        if (tags.has(COLLABORATION_TAG) || tags.has(HISTORIC_TAG)) {
          return;
        }
        if (editor.isComposing()) {
          return;
        }

        const selection = editorState.read($getSelection);
        const prevSelection = prevEditorState.read($getSelection);
        if (
          !$isRangeSelection(selection) ||
          !$isRangeSelection(prevSelection) ||
          !selection.isCollapsed() ||
          selection.is(prevSelection)
        ) {
          return;
        }

        const anchorKey = selection.anchor.key;
        const anchorOffset = selection.anchor.offset;
        if (
          !dirtyLeaves.has(anchorKey) ||
          (anchorOffset !== 1 && anchorOffset > prevSelection.anchor.offset + 1)
        ) {
          return;
        }

        const nodeText = editorState.read(() => {
          const node = $getNodeByKey(anchorKey);
          return $isTextNode(node) ? node.getTextContent() : null;
        });
        if (nodeText === null) {
          return;
        }

        const typedChar = nodeText[anchorOffset - 1];
        if (typedChar === ' ') {
          editor.update(() => {
            const node = $getNodeByKey(anchorKey);
            if (!$isTextNode(node)) {
              return;
            }
            const parent = node.getParent();
            if (parent === null || $isCodeNode(parent)) {
              return;
            }
            if ($tryBlockShortcut(parent, node, anchorOffset)) {
              $addUpdateTag(HISTORY_PUSH_TAG);
            }
          });
        } else if (INLINE_TRIGGER_CHARS.has(typedChar)) {
          void $maybeApplyInlineShortcut(
            editor,
            {anchorKey, caret: anchorOffset, nodeText},
            parse,
            byType,
          );
        }
      },
    ),
    editor.registerCommand(
      KEY_ENTER_COMMAND,
      event => {
        if (event !== null && event.shiftKey) {
          return false;
        }
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }
        const anchorNode = selection.anchor.getNode();
        if (!$isTextNode(anchorNode)) {
          return false;
        }
        const paragraph = anchorNode.getParent();
        if (
          !$isParagraphNode(paragraph) ||
          !$isRootOrShadowRoot(paragraph.getParent()) ||
          paragraph.getFirstChild() !== anchorNode
        ) {
          return false;
        }
        const text = anchorNode.getTextContent();
        if (selection.anchor.offset !== text.length) {
          return false;
        }
        const match = CODE_FENCE_REGEXP.exec(text);
        if (match === null) {
          return false;
        }
        const code = $createCodeNode(match[1] || undefined);
        paragraph.replace(code);
        code.selectStart();
        if (event !== null) {
          event.preventDefault();
        }
        return true;
      },
      COMMAND_PRIORITY_LOW,
    ),
  );
}
