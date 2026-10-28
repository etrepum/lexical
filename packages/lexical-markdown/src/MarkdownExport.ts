/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$isAutoLinkNode, $isLinkNode, LinkNode} from '@lexical/link';
import {$sliceSelectedTextNodeContent} from '@lexical/selection';
import {
  $findMatchingParent,
  $getRoot,
  $getState,
  $isDecoratorNode,
  $isElementNode,
  $isLineBreakNode,
  $isTextNode,
  type BaseSelection,
  type ElementNode,
  type LexicalNode,
  type LineBreakNode,
  type NodeKey,
  type TextFormatType,
  type TextNode,
} from 'lexical';

import {
  type ElementTransformer,
  getCodeSpanDelimiter,
  hardLineBreakState,
  type MultilineElementTransformer,
  rawInlineState,
  type TextFormatTransformer,
  type TextMatchTransformer,
  type Transformer,
} from './MarkdownTransformers';
import {
  CHARACTER_REFERENCE_START,
  isEmptyParagraph,
  isEscaped,
  transformersByType,
} from './utils';

/**
 * Renders string from markdown. The selection is moved to the start after the operation.
 */
export function createMarkdownExport(
  transformers: Transformer[],
  shouldPreserveNewLines: boolean = false,
): (node?: ElementNode) => string {
  const byType = transformersByType(transformers);
  const elementTransformers = [...byType.multilineElement, ...byType.element];
  const isNewlineDelimited = !shouldPreserveNewLines;

  // Export only uses text formats that are responsible for single format
  // e.g. it will filter out *** (bold, italic) and instead use separate ** and *
  const textFormatTransformers = byType.textFormat
    .filter(transformer => transformer.format.length === 1)
    // Make sure all text transformers that contain 'code' in their format are at the end of the array. Otherwise, formatted code like
    // <strong><code>code</code></strong> will be exported as `**Bold Code**`, as the code format will be applied first, and the bold format
    // will be applied second and thus skipped entirely, as the code format will prevent any further formatting.
    .sort((a, b) => {
      return (
        Number(a.format.includes('code')) - Number(b.format.includes('code'))
      );
    });

  const writesLinks = isWritingLinks(byType.textMatch);

  return node =>
    $withExportContext(null, writesLinks, () => {
      const output = [];
      const children = (node || $getRoot()).getChildren();

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const result = $exportTopLevelElements(
          child,
          elementTransformers,
          textFormatTransformers,
          byType.textMatch,
          shouldPreserveNewLines,
        );

        if (result != null) {
          output.push(
            // separate consecutive group of texts with a line break: eg. ["hello", "world"] -> ["hello", "/nworld"]
            isNewlineDelimited &&
              i > 0 &&
              !isEmptyParagraph(child) &&
              !isEmptyParagraph(children[i - 1])
              ? '\n'.concat(result)
              : result,
          );
        }
      }
      // Ensure consecutive groups of texts are at least \n\n apart while each empty paragraph render as a newline.
      // Eg. ["hello", "", "", "hi", "\nworld"] -> "hello\n\n\nhi\n\nworld"
      return output.join('\n');
    });
}

/**
 * Creates a markdown export function that only exports selected content.
 * Uses a recursive structure similar to $appendNodesToHTML to support
 * extractWithChild for proper handling of partial selections within
 * inline elements like links.
 */
export function createSelectionMarkdownExport(
  transformers: Transformer[],
  shouldPreserveNewLines: boolean = false,
): (selection: BaseSelection) => string {
  const byType = transformersByType(transformers);
  const elementTransformers = [...byType.multilineElement, ...byType.element];
  const isNewlineDelimited = !shouldPreserveNewLines;

  const textFormatTransformers = byType.textFormat
    .filter(transformer => transformer.format.length === 1)
    .sort((a, b) => {
      return (
        Number(a.format.includes('code')) - Number(b.format.includes('code'))
      );
    });

  const writesLinks = isWritingLinks(byType.textMatch);

  return selection =>
    $withExportContext(selection, writesLinks, () => {
      const output = [];
      // The separator depends on the previously *emitted* block, not on the
      // previous root child: unselected children produce no output, so keying
      // off the child index would prefix a newline to the first emitted block
      // whenever the selection starts below the top of the document.
      let previousExported: LexicalNode | null = null;

      for (const child of $getRoot().getChildren()) {
        const {shouldInclude, markdown} = $processNodeForSelection(
          child,
          selection,
          elementTransformers,
          textFormatTransformers,
          byType.textMatch,
          shouldPreserveNewLines,
        );

        if (shouldInclude && markdown != null) {
          output.push(
            isNewlineDelimited &&
              previousExported !== null &&
              !isEmptyParagraph(child) &&
              !isEmptyParagraph(previousExported)
              ? '\n'.concat(markdown)
              : markdown,
          );
          previousExported = child;
        }
      }
      return output.join('\n');
    });
}

function $processNodeForSelection(
  node: LexicalNode,
  selection: BaseSelection,
  elementTransformers: (ElementTransformer | MultilineElementTransformer)[],
  textFormatTransformers: TextFormatTransformer[],
  textMatchTransformers: TextMatchTransformer[],
  shouldPreserveNewLines: boolean,
): {shouldInclude: boolean; markdown: string | null} {
  let shouldInclude = node.isSelected(selection);

  // For element transformers (heading, quote, list, code block, etc.)
  for (const transformer of elementTransformers) {
    if (!transformer.export) {
      continue;
    }
    const result = transformer.export(
      node,
      node_ =>
        $exportChildrenForSelection(
          node_,
          selection,
          textFormatTransformers,
          textMatchTransformers,
          shouldPreserveNewLines,
        ).markdown,
      selection,
    );

    if (result != null) {
      if (!shouldInclude) {
        // Check if any descendant is selected
        if ($isElementNode(node)) {
          const childResult = $exportChildrenForSelection(
            node,
            selection,
            textFormatTransformers,
            textMatchTransformers,
            shouldPreserveNewLines,
          );
          if (childResult.shouldInclude) {
            shouldInclude = true;
          }
        }
      }
      return {markdown: result, shouldInclude};
    }
  }

  if ($isElementNode(node)) {
    const childResult = $exportChildrenForSelection(
      node,
      selection,
      textFormatTransformers,
      textMatchTransformers,
      shouldPreserveNewLines,
    );
    return {
      markdown: childResult.markdown,
      shouldInclude: shouldInclude || childResult.shouldInclude,
    };
  } else if ($isDecoratorNode(node)) {
    return {markdown: node.getTextContent(), shouldInclude};
  } else {
    return {markdown: null, shouldInclude};
  }
}

function $exportChildrenForSelection(
  node: ElementNode,
  selection: BaseSelection,
  textFormatTransformers: TextFormatTransformer[],
  textMatchTransformers: TextMatchTransformer[],
  shouldPreserveNewLines: boolean,
  unclosedTags?: {format: TextFormatType; tag: string}[],
  unclosableTags?: {format: TextFormatType; tag: string}[],
): {shouldInclude: boolean; markdown: string} {
  const output = [];
  const children = node.getChildren();
  let anyChildIncluded = false;

  if (!unclosedTags) {
    unclosedTags = [];
  }
  if (!unclosableTags) {
    unclosableTags = [];
  }

  mainLoop: for (const child of children) {
    let childIncluded = child.isSelected(selection);

    // Try text match transformers (links, etc.)
    for (const transformer of textMatchTransformers) {
      if (!transformer.export) {
        continue;
      }

      const result = transformer.export(
        child,
        parentNode =>
          $exportChildrenForSelection(
            parentNode,
            selection,
            textFormatTransformers,
            textMatchTransformers,
            shouldPreserveNewLines,
            unclosedTags,
            [...unclosableTags, ...unclosedTags],
          ).markdown,
        (textNode, textContent) => {
          const slicedNode = $sliceSelectedTextNodeContent(
            selection,
            textNode,
            'clone',
          );
          return $exportTextFormat(
            textNode,
            slicedNode.getTextContent(),
            textFormatTransformers,
            unclosedTags,
            unclosableTags,
            shouldPreserveNewLines,
          );
        },
      );

      if (result != null) {
        // Check extractWithChild if this node wasn't directly selected
        if (
          !childIncluded &&
          $isElementNode(child) &&
          child.getChildren().some(c => c.isSelected(selection)) &&
          child.extractWithChild(child, selection, 'html')
        ) {
          childIncluded = true;
        }
        if (childIncluded) {
          output.push(result);
          anyChildIncluded = true;
        }
        continue mainLoop;
      }
    }

    if ($isLineBreakNode(child)) {
      if (childIncluded) {
        output.push($exportLineBreak(child));
        anyChildIncluded = true;
      }
    } else if ($isTextNode(child)) {
      if (childIncluded) {
        const target = $sliceSelectedTextNodeContent(selection, child, 'clone');
        output.push(
          $exportTextFormat(
            child,
            target.getTextContent(),
            textFormatTransformers,
            unclosedTags,
            unclosableTags,
            shouldPreserveNewLines,
          ),
        );
        anyChildIncluded = true;
      }
    } else if ($isElementNode(child)) {
      const childResult = $exportChildrenForSelection(
        child,
        selection,
        textFormatTransformers,
        textMatchTransformers,
        shouldPreserveNewLines,
        unclosedTags,
        unclosableTags,
      );

      // extractWithChild: if child has selected descendants, ask parent if it should be included
      if (
        !childIncluded &&
        childResult.shouldInclude &&
        child.extractWithChild(child, selection, 'html')
      ) {
        childIncluded = true;
      }

      if (childIncluded || childResult.shouldInclude) {
        output.push(childResult.markdown);
        anyChildIncluded = true;
      }
    } else if ($isDecoratorNode(child)) {
      if (childIncluded) {
        output.push(child.getTextContent());
        anyChildIncluded = true;
      }
    }
  }

  return {markdown: output.join(''), shouldInclude: anyChildIncluded};
}

function $exportTopLevelElements(
  node: LexicalNode,
  elementTransformers: (ElementTransformer | MultilineElementTransformer)[],
  textTransformersIndex: TextFormatTransformer[],
  textMatchTransformers: TextMatchTransformer[],
  shouldPreserveNewLines: boolean,
): string | null {
  for (const transformer of elementTransformers) {
    if (!transformer.export) {
      continue;
    }
    const result = transformer.export(node, _node =>
      $exportChildren(
        _node,
        textTransformersIndex,
        textMatchTransformers,
        undefined,
        undefined,
        shouldPreserveNewLines,
      ),
    );

    if (result != null) {
      return result;
    }
  }

  if ($isElementNode(node)) {
    return $exportChildren(
      node,
      textTransformersIndex,
      textMatchTransformers,
      undefined,
      undefined,
      shouldPreserveNewLines,
    );
  } else if ($isDecoratorNode(node)) {
    return node.getTextContent();
  } else {
    return null;
  }
}

function $exportChildren(
  node: ElementNode,
  textTransformersIndex: TextFormatTransformer[],
  textMatchTransformers: TextMatchTransformer[],
  unclosedTags?: {format: TextFormatType; tag: string}[],
  unclosableTags?: {format: TextFormatType; tag: string}[],
  shouldPreserveNewLines: boolean = false,
): string {
  const output = [];
  const children = node.getChildren();
  // keep track of unclosed tags from the very beginning
  if (!unclosedTags) {
    unclosedTags = [];
  }
  if (!unclosableTags) {
    unclosableTags = [];
  }

  mainLoop: for (const child of children) {
    for (const transformer of textMatchTransformers) {
      if (!transformer.export) {
        continue;
      }

      const result = transformer.export(
        child,
        parentNode =>
          $exportChildren(
            parentNode,
            textTransformersIndex,
            textMatchTransformers,
            unclosedTags,
            // Add current unclosed tags to the list of unclosable tags - we don't want nested tags from
            // textmatch transformers to close the outer ones, as that may result in invalid markdown.
            // E.g. **text [text**](https://lexical.io)
            // is invalid markdown, as the closing ** is inside the link.
            //
            [...unclosableTags, ...unclosedTags],
            shouldPreserveNewLines,
          ),
        (textNode, textContent) =>
          $exportTextFormat(
            textNode,
            textContent,
            textTransformersIndex,
            unclosedTags,
            unclosableTags,
            shouldPreserveNewLines,
          ),
      );

      if (result != null) {
        output.push(result);
        continue mainLoop;
      }
    }

    if ($isLineBreakNode(child)) {
      output.push($exportLineBreak(child));
    } else if ($isTextNode(child)) {
      output.push(
        $exportTextFormat(
          child,
          child.getTextContent(),
          textTransformersIndex,
          unclosedTags,
          unclosableTags,
          shouldPreserveNewLines,
        ),
      );
    } else if ($isElementNode(child)) {
      // empty paragraph returns ""
      output.push(
        $exportChildren(
          child,
          textTransformersIndex,
          textMatchTransformers,
          unclosedTags,
          unclosableTags,
          shouldPreserveNewLines,
        ),
      );
    } else if ($isDecoratorNode(child)) {
      output.push(child.getTextContent());
    }
  }

  return output.join('');
}

function $exportLineBreak(node: LineBreakNode): string {
  return $getState(node, hardLineBreakState) + '\n';
}

function $exportTextFormat(
  node: TextNode,
  textContent: string,
  textTransformers: TextFormatTransformer[],
  // unclosed tags include the markdown tags that haven't been closed yet, and their associated formats
  unclosedTags: {format: TextFormatType; tag: string}[],
  unclosableTags?: {format: TextFormatType; tag: string}[],
  shouldPreserveNewLines: boolean = false,
): string {
  // This function handles the case of a string looking like this: "   foo   "
  // Where it would be invalid markdown to generate: "**   foo   **"
  // If the node has no format, we use the original text.
  // Otherwise, we escape leading and trailing whitespaces to their corresponding code points,
  // ensuring the returned string maintains its original formatting, e.g., "**&#32;&#32;&#32;foo&#32;&#32;&#32;**".

  const isCode = node.hasFormat('code');

  const isLiteral = !isCode && !$isRawInlineText(node, textContent);

  const output = isLiteral
    ? $escapeText(node, textContent, shouldPreserveNewLines)
    : textContent;

  let leadingSpace: string;
  let trimmedOutput: string;
  let trailingSpace: string;
  let isWhitespaceOnly: boolean;

  if (isCode) {
    // Inline code is an atomic literal span with a content-derived fence, so
    // its whitespace stays inside the fence and other formats wrap around it.
    const {fence, padded} = getCodeSpanDelimiter(textContent);
    leadingSpace = '';
    trailingSpace = '';
    trimmedOutput = fence + padded + fence;
    isWhitespaceOnly = false;
  } else {
    // Extract leading and trailing whitespaces.
    // CommonMark flanking rules require formatting tags to be adjacent to non-whitespace characters.
    const match = output.match(/^(\s*)(.*?)(\s*)$/s) || ['', '', output, ''];
    leadingSpace = match[1];
    trimmedOutput = match[2];
    trailingSpace = match[3];
    isWhitespaceOnly = trimmedOutput === '';
  }

  // the opening tags to be added to the result
  let openingTags = '';
  // the closing tags to be added to the result
  let closingTagsBefore = '';
  let closingTagsAfter = '';

  const prevNode = getTextSibling(node, true);
  const nextNode = getTextSibling(node, false);

  const applied = new Set();

  for (const transformer of textTransformers) {
    const format = transformer.format[0];
    const tag = transformer.tag;

    // Inline code uses a content-derived fence handled above, not a static tag.
    if (format === 'code') {
      continue;
    }

    // dedup applied formats
    // `checkHasFormat` reads the node's whole text, but the text being
    // exported may be a selection slice of it. When the slice is entirely
    // whitespace the tags are dropped by the early return below, so
    // registering them here would leave an unclosed tag for a later node to
    // close. In the full-document path `checkHasFormat` already rejects
    // whitespace-only nodes, so this guard only affects sliced content.
    if (
      !isWhitespaceOnly &&
      checkHasFormat(node, format) &&
      !applied.has(format)
    ) {
      applied.add(format);

      // append the tag to openingTags, if it's not applied to the previous nodes,
      // or the nodes before that (which would result in an unclosed tag)
      if (
        !checkHasFormat(prevNode, format) ||
        !unclosedTags.find(element => element.tag === tag)
      ) {
        unclosedTags.push({format, tag});
        openingTags += tag;
      }
    }
  }

  // close any tags in the same order they were applied, if necessary
  for (let i = 0; i < unclosedTags.length; i++) {
    const nodeHasFormat = hasFormat(node, unclosedTags[i].format);
    const nextNodeHasFormat = hasFormat(nextNode, unclosedTags[i].format);

    // prevent adding closing tag if next sibling will do it
    if (nodeHasFormat && nextNodeHasFormat) {
      continue;
    }

    const unhandledUnclosedTags = [...unclosedTags]; // Shallow copy to avoid modifying the original array

    while (unhandledUnclosedTags.length > i) {
      const unclosedTag = unhandledUnclosedTags.pop();

      // If tag is unclosable, don't close it and leave it in the original array,
      // So that it can be closed when it's no longer unclosable
      if (
        unclosableTags &&
        unclosedTag &&
        unclosableTags.find(element => element.tag === unclosedTag.tag)
      ) {
        continue;
      }

      if (unclosedTag && typeof unclosedTag.tag === 'string') {
        if (!nodeHasFormat) {
          // Handles cases where the tag has not been closed before, e.g. if the previous node
          // was a text match transformer that did not account for closing tags of the next node (e.g. a link)
          closingTagsBefore += unclosedTag.tag;
        } else if (!nextNodeHasFormat) {
          closingTagsAfter += unclosedTag.tag;
        }
      }
      // Mutate the original array to remove the closed tag
      unclosedTags.pop();
    }
    break;
  }
  // If the node is entirely whitespace, we don't apply opening/closing tags around it.
  // However, it must still output closing tags from previous nodes.
  if (isWhitespaceOnly && !node.hasFormat('code')) {
    return closingTagsBefore + output;
  }

  if (isLiteral && closingTagsBefore === '' && openingTags === '') {
    trimmedOutput = $escapeLineStarts(node, trimmedOutput, trailingSpace);
  }

  // Flanking Compliance: Notice how openingTags and closingTagsAfter are placed INSIDE the whitespace boundaries!
  return (
    closingTagsBefore +
    leadingSpace +
    openingTags +
    trimmedOutput +
    closingTagsAfter +
    trailingSpace
  );
}

// Whether the transformers write a LinkNode as `[text](url)`, as LINK does.
// Otherwise its text is written as plain text.
function isWritingLinks(transformers: TextMatchTransformer[]): boolean {
  return transformers.some(
    transformer =>
      transformer.export && transformer.dependencies.includes(LinkNode),
  );
}

// What one export call shares: the selection it exports, if any, whether
// links are written as links, and the brackets to escape in each block or
// link text, paired once per export.
let exportContext: {
  brackets: Map<NodeKey, Map<NodeKey, Set<number>>>;
  selection: BaseSelection | null;
  writesLinks: boolean;
} | null = null;

function $withExportContext<T>(
  selection: BaseSelection | null,
  writesLinks: boolean,
  fn: () => T,
): T {
  const previous = exportContext;
  exportContext = {brackets: new Map(), selection, writesLinks};
  try {
    return fn();
  } finally {
    exportContext = previous;
  }
}

// Text imported from raw inline syntax is written as it was while unchanged.
function $isRawInlineText(node: TextNode, textContent: string): boolean {
  return textContent !== '' && $getState(node, rawInlineState) === textContent;
}

// The text of a node that the export writes, or null if it writes none.
function $exportedText(node: TextNode): string | null {
  const selection = exportContext && exportContext.selection;
  if (!selection) {
    return node.getTextContent();
  }
  return node.isSelected(selection)
    ? $sliceSelectedTextNodeContent(selection, node, 'clone').getTextContent()
    : null;
}

// Whether a node is part of what is exported.
function $isExported(node: LexicalNode): boolean {
  const selection = exportContext && exportContext.selection;
  return !selection || node.isSelected(selection);
}

function $isMarkdownLinkNode(node: LexicalNode | null): boolean {
  return (
    $isLinkNode(node) &&
    !$isAutoLinkNode(node) &&
    (!exportContext || exportContext.writesLinks)
  );
}

// The node whose Markdown follows a node's own, looking out of and into
// inline elements other than links.
function $nextInline(node: LexicalNode): LexicalNode | null {
  let current = node;
  let parent = current.getParent();
  while (
    current.getNextSibling() === null &&
    parent !== null &&
    parent.isInline() &&
    !$isMarkdownLinkNode(parent)
  ) {
    current = parent;
    parent = current.getParent();
  }
  let next = current.getNextSibling();
  while (
    $isElementNode(next) &&
    next.isInline() &&
    !$isMarkdownLinkNode(next) &&
    next.getFirstChild() !== null
  ) {
    next = next.getFirstChild();
  }
  return next;
}

// Escapes literal text that would otherwise read back as inline syntax.
function $escapeText(
  node: TextNode,
  textContent: string,
  shouldPreserveNewLines: boolean,
): string {
  const brackets = $bracketsToEscape(node, textContent);
  // Backslashes are written as they are when preserving source newlines, so
  // one that already escapes a character escapes it in the output too.
  const isWritten = (text: string, char: string, index: number) =>
    shouldPreserveNewLines && (char === '\\' || isEscaped(text, index));
  let output = textContent
    .replace(
      // `<` here would begin raw HTML or an autolink.
      /[*_`~\\[\]]|<(?=[A-Za-z/!?])/g,
      (char, index: number) =>
        ((char === '[' || char === ']') && !brackets.has(index)) ||
        isWritten(textContent, char, index)
          ? char
          : '\\' + char,
    )
    .replace(CHARACTER_REFERENCE_START, (char, index: number, text: string) =>
      isWritten(text, char, index) ? char : '\\' + char,
    );
  // A `!` before a link would make it an image.
  if (output.endsWith('!') && $isMarkdownLinkNode($nextInline(node))) {
    output = output.slice(0, -1) + '\\!';
  }
  return output;
}

// The text of a node as a reader pairs brackets in it. Brackets in a code span
// or raw inline syntax are not link syntax.
function $bracketText(node: TextNode, text: string): string {
  return node.hasFormat('code') || $isRawInlineText(node, text)
    ? text.replace(/[[\]]/g, ' ')
    : text;
}

// The indices of the brackets in a node's text that would read back as a
// link, an image or a link reference definition. In link text, every bracket
// that is not part of a balanced pair is escaped as well.
function $bracketsToEscape(node: TextNode, textContent: string): Set<number> {
  const container = /[[\]]/.test(textContent)
    ? $findMatchingParent(
        node,
        parent =>
          $isElementNode(parent) &&
          (!parent.isInline() || $isMarkdownLinkNode(parent)),
      )
    : null;
  if (!$isElementNode(container)) {
    return new Set();
  }
  const cache = exportContext ? exportContext.brackets : new Map();
  let brackets = cache.get(container.getKey());
  if (!brackets) {
    brackets = $pairBrackets(container);
    cache.set(container.getKey(), brackets);
  }
  return brackets.get(node.getKey()) || new Set();
}

// Link text that import reads holds brackets nested this deep.
const LINK_TEXT_BRACKET_DEPTH = 3;

// Pairs the brackets in the exported text of a block or link the way a
// CommonMark reader does, and returns the ones to escape by text node. A link
// nested in it starts a new run, since it deactivates the brackets before it.
// https://spec.commonmark.org/0.31.2/#look-for-link-or-image
function $pairBrackets(container: ElementNode): Map<NodeKey, Set<number>> {
  const inLink = $isMarkdownLinkNode(container);
  const brackets = new Map<NodeKey, Set<number>>();
  let pieces: [NodeKey, number][] = [];
  let text = '';
  const flush = () => {
    const escaped: number[] = [];
    // Openers, or -1 for an escaped one whose closer is escaped with it.
    const openers: number[] = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '[') {
        if (inLink && openers.length >= LINK_TEXT_BRACKET_DEPTH) {
          escaped.push(i);
          openers.push(-1);
        } else {
          openers.push(i);
        }
      } else if (text[i] === ']') {
        if (
          openers.length > 0 &&
          openers[openers.length - 1] !== -1 &&
          /[(:]/.test(text[i + 1] || '')
        ) {
          // The reader would close a link here. Escaped, it keeps the opener.
          escaped.push(i);
        } else {
          const opener = openers.pop();
          if ((opener === undefined && inLink) || opener === -1) {
            escaped.push(i);
          }
        }
      }
    }
    if (inLink) {
      escaped.push(...openers.filter(opener => opener !== -1));
    }
    escaped.sort((a, b) => a - b);
    let piece = 0;
    for (const index of escaped) {
      while (piece + 1 < pieces.length && pieces[piece + 1][1] <= index) {
        piece++;
      }
      const [key, start] = pieces[piece];
      const indices = brackets.get(key) || new Set();
      brackets.set(key, indices.add(index - start));
    }
    pieces = [];
    text = '';
  };
  const $visit = (parent: ElementNode) => {
    for (const child of parent.getChildren()) {
      if ($isMarkdownLinkNode(child)) {
        flush();
      } else if ($isElementNode(child)) {
        $visit(child);
      } else {
        const childText = $isTextNode(child)
          ? $exportedText(child)
          : $isExported(child)
            ? child.getTextContent()
            : null;
        if (childText !== null) {
          pieces.push([child.getKey(), text.length]);
          text += $isTextNode(child)
            ? $bracketText(child, childText)
            : childText;
        }
      }
    }
  };
  $visit(container);
  flush();
  return brackets;
}

// Whether a node exports as whitespace alone, or not at all.
function $isBlank(node: LexicalNode): boolean {
  return (
    !$isExported(node) ||
    (!$isLineBreakNode(node) &&
      !$isMarkdownLinkNode(node) &&
      !($isTextNode(node) && node.hasFormat('code')) &&
      /^\s*$/.test(node.getTextContent()))
  );
}

// Whether the text of a node starts a line of its block, where block syntax
// can begin. A line break inside link text starts a line as well.
function $isAtLineStart(node: LexicalNode): boolean {
  for (let current = node; ; ) {
    let previous = current.getPreviousSibling();
    while (previous !== null && $isBlank(previous)) {
      previous = previous.getPreviousSibling();
    }
    if (previous !== null) {
      return $isLineBreakNode(previous);
    }
    const parent = current.getParent();
    if (parent === null || !parent.isInline()) {
      return true;
    }
    if ($isMarkdownLinkNode(parent)) {
      return false;
    }
    current = parent;
  }
}

// Whether a node follows plain digits that start a line, which its own text
// could make an ordered list marker.
function $followsLineStartDigits(node: LexicalNode): boolean {
  let digits = '';
  for (
    let previous = node.getPreviousSibling();
    $isTextNode(previous) &&
    previous.getFormat() === 0 &&
    /^\d+$/.test(previous.getTextContent());
    previous = previous.getPreviousSibling()
  ) {
    digits = previous.getTextContent() + digits;
    if ($isAtLineStart(previous)) {
      return digits.length <= 9;
    }
  }
  return false;
}

// A line that would read back as a heading, block quote, list item, thematic
// break, setext heading underline or table delimiter row. Fences and HTML
// blocks start with characters that are escaped anywhere.
const LINE_START_SYNTAX =
  /^(?:#{1,6}(?:[ \t]|$)|>|[-+](?:[ \t]|$)|-[-:| \t]*$|=+[ \t]*$|[:|][-:| \t]*-[-:| \t]*$)/;

// Escapes the lines in a node's text that would read back as block syntax:
// the first character of the line, or the delimiter of an ordered list item.
function $escapeLineStarts(
  node: TextNode,
  output: string,
  trailingSpace: string,
): string {
  // The rest of the last line, from the nodes that follow.
  let rest = trailingSpace;
  for (let next = node.getNextSibling(); ; next = next.getNextSibling()) {
    if (next === null || $isLineBreakNode(next) || !$isExported(next)) {
      break;
    } else if (!$isTextNode(next)) {
      // Any other node continues the line with content.
      rest += 'x';
      break;
    }
    rest += next.getTextContent();
  }
  const inLink = $findMatchingParent(node, $isMarkdownLinkNode) !== null;
  const lines = output.split('\n');
  return lines
    .map((line, i) => {
      const fullLine = i === lines.length - 1 ? line + rest : line;
      if (i === 0 && !$isAtLineStart(node)) {
        return /^[.)](?:[ \t]|$)/.test(fullLine) &&
          $followsLineStartDigits(node)
          ? '\\' + line
          : line;
      }
      const [, indent, content] = /^( {0,3})([^]*)$/.exec(line) || [];
      if (indent === undefined) {
        return line;
      }
      const tail = fullLine.slice(indent.length);
      if (/^\d{1,9}[.)](?:[ \t]|$)/.test(tail)) {
        // Digits alone leave the delimiter to the node that holds it.
        return indent + content.replace(/^\d+(?=[.)])/, '$&\\');
      }
      return LINE_START_SYNTAX.test(tail) ||
        // A task list marker, which import reads at the start of any line. In
        // link text it cannot start a list item.
        (!inLink && /^\[[ xX]?\](?:[ \t]|$)/.test(tail))
        ? indent + '\\' + content
        : line;
    })
    .join('\n');
}

function getTextSibling(node: TextNode, backward: boolean): TextNode | null {
  const sibling = backward ? node.getPreviousSibling() : node.getNextSibling();

  if ($isTextNode(sibling)) {
    return sibling;
  }

  return null;
}

function hasFormat(
  node: LexicalNode | null | undefined,
  format: TextFormatType,
): boolean {
  return $isTextNode(node) && node.hasFormat(format);
}

function checkHasFormat(n: TextNode | null, f: TextFormatType): boolean {
  if (!hasFormat(n, f)) {
    return false;
  }
  if (f === 'code') {
    return true;
  }
  if (n && /^\s*$/.test(n.getTextContent())) {
    return false;
  }
  return true;
}
