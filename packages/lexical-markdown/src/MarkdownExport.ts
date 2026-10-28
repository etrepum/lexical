/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $isAutoLinkNode,
  $isLinkNode,
  AutoLinkNode,
  LinkNode,
} from '@lexical/link';
import {$isHeadingNode} from '@lexical/rich-text';
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
  ESCAPABLE,
  isEmptyParagraph,
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

  return node => {
    const context = createExportContext(
      byType,
      textFormatTransformers,
      shouldPreserveNewLines,
      null,
    );
    const output = [];
    const children = (node || $getRoot()).getChildren();

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const result = $exportTopLevelElements(
        child,
        elementTransformers,
        textFormatTransformers,
        byType.textMatch,
        context,
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
  };
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

  return selection => {
    const context = createExportContext(
      byType,
      textFormatTransformers,
      shouldPreserveNewLines,
      selection,
    );
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
        context,
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
  };
}

function $processNodeForSelection(
  node: LexicalNode,
  selection: BaseSelection,
  elementTransformers: (ElementTransformer | MultilineElementTransformer)[],
  textFormatTransformers: TextFormatTransformer[],
  textMatchTransformers: TextMatchTransformer[],
  context: ExportContext,
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
          context,
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
            context,
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
      context,
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
  context: ExportContext,
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
            context,
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
            context,
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
            context,
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
        context,
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
  context: ExportContext,
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
        context,
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
      context,
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
  unclosedTags: {format: TextFormatType; tag: string}[] | undefined,
  unclosableTags: {format: TextFormatType; tag: string}[] | undefined,
  context: ExportContext,
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
            context,
          ),
        (textNode, textContent) =>
          $exportTextFormat(
            textNode,
            textContent,
            textTransformersIndex,
            unclosedTags,
            unclosableTags,
            context,
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
          context,
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
          context,
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
  unclosableTags: {format: TextFormatType; tag: string}[] | undefined,
  context: ExportContext,
): string {
  // This function handles the case of a string looking like this: "   foo   "
  // Where it would be invalid markdown to generate: "**   foo   **"
  // If the node has no format, we use the original text.
  // Otherwise, we escape leading and trailing whitespaces to their corresponding code points,
  // ensuring the returned string maintains its original formatting, e.g., "**&#32;&#32;&#32;foo&#32;&#32;&#32;**".

  const isCode = node.hasFormat('code');

  const output = isCode ? textContent : $escapeText(node, textContent, context);

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

// What one export call shares, for escaping literal text.
type ExportContext = Readonly<{
  // The escapes in the text of each block or link, found once per export.
  escapes: Map<NodeKey, Map<NodeKey, Set<number>>>;
  // Import regular expressions of the element transformers, which read a
  // line start as block syntax.
  lineStartRegExps: RegExp[];
  selection: BaseSelection | null;
  // The selected nodes and their ancestors, when exporting a selection.
  selectedKeys: Set<NodeKey>;
  shouldPreserveNewLines: boolean;
  // The selected text of each text node, when exporting a selection.
  slices: Map<NodeKey, string | null>;
  // Formats written with delimiters around the text.
  taggedFormats: TextFormatType[];
  textMatchTransformers: TextMatchTransformer[];
  // Whether a LinkNode is written as `[text](url)`, as LINK writes it.
  // Otherwise its text is written as plain text.
  writesLinks: boolean;
}>;

function createExportContext(
  byType: ReturnType<typeof transformersByType>,
  textFormatTransformers: TextFormatTransformer[],
  shouldPreserveNewLines: boolean,
  selection: BaseSelection | null,
): ExportContext {
  return {
    escapes: new Map(),
    lineStartRegExps: [
      ...byType.element.map(transformer => transformer.regExp),
      ...byType.multilineElement.map(transformer => transformer.regExpStart),
    ],
    selectedKeys: new Set(),
    selection,
    shouldPreserveNewLines,
    slices: new Map(),
    taggedFormats: textFormatTransformers
      .map(transformer => transformer.format[0])
      .filter(format => format !== 'code'),
    textMatchTransformers: byType.textMatch,
    writesLinks: byType.textMatch.some(
      transformer =>
        transformer.export !== undefined &&
        transformer.dependencies.some(
          klass =>
            (klass === LinkNode || klass.prototype instanceof LinkNode) &&
            klass !== AutoLinkNode &&
            !(klass.prototype instanceof AutoLinkNode),
        ),
    ),
  };
}

// The spans of a node's text that are written as the raw inline syntax it was
// imported from: each place the text still holds that source. Text nodes with
// the same source merge, so it can occur more than once.
function $rawInlineSpans(
  node: TextNode,
  textContent: string,
): [number, number][] {
  const source = $getState(node, rawInlineState);
  const spans: [number, number][] = [];
  for (
    let start = source === '' ? -1 : textContent.indexOf(source);
    start !== -1;
    start = textContent.indexOf(source, start + source.length)
  ) {
    spans.push([start, start + source.length]);
  }
  return spans;
}

// The text of a node that the export writes, or null if it writes none.
function $exportedText(node: TextNode, context: ExportContext): string | null {
  const {selection, slices} = context;
  if (!selection) {
    return node.getTextContent();
  }
  let slice = slices.get(node.getKey());
  if (slice === undefined) {
    slice = node.isSelected(selection)
      ? $sliceSelectedTextNodeContent(selection, node, 'clone').getTextContent()
      : null;
    slices.set(node.getKey(), slice);
  }
  return slice;
}

// Whether the export writes a node, or anything in it.
function $isExported(node: LexicalNode, context: ExportContext): boolean {
  const {selection} = context;
  if (!selection) {
    return true;
  }
  const {selectedKeys} = context;
  if (selectedKeys.size === 0) {
    for (const selected of selection.getNodes()) {
      for (
        let current: LexicalNode | null = selected.isSelected(selection)
          ? selected
          : null;
        current !== null && !selectedKeys.has(current.getKey());
        current = current.getParent()
      ) {
        selectedKeys.add(current.getKey());
      }
    }
    // Marks the set as filled, even if nothing is selected.
    selectedKeys.add('');
  }
  return selectedKeys.has(node.getKey());
}

function $isMarkdownLinkNode(
  node: LexicalNode | null,
  context: ExportContext,
): boolean {
  return $isLinkNode(node) && !$isAutoLinkNode(node) && context.writesLinks;
}

// Escapes literal text that would otherwise read back as Markdown syntax.
// `*`, `_`, `` ` ``, `~` and backslashes are escaped anywhere. Other syntax
// depends on the text around it, which is read once for each block.
function $escapeText(
  node: TextNode,
  textContent: string,
  context: ExportContext,
): string {
  const escapes = $escapesIn(node, textContent, context);
  const raw = $rawInlineSpans(node, textContent);
  return textContent.replace(
    RegExp(ESCAPABLE, 'g'),
    (char: string, index: number) =>
      raw.some(([start, end]) => index >= start && index < end)
        ? char
        : escapes.has(index) ||
            (char === '\\'
              ? // When preserving source newlines, a backslash is written as it
                // is unless it would escape the character after it, or make a
                // hard line break.
                !context.shouldPreserveNewLines ||
                ESCAPABLE.test(textContent[index + 1] || '') ||
                textContent[index + 1] === '\n'
              : /[*_`~]/.test(char))
          ? '\\' + char
          : char,
  );
}

// The indices in a node's text that need an escape, from the escapes in the
// text of its block, or of the link around it.
function $escapesIn(
  node: TextNode,
  textContent: string,
  context: ExportContext,
): Set<number> {
  const container = $findMatchingParent(
    node,
    parent =>
      $isElementNode(parent) &&
      (!parent.isInline() || $isMarkdownLinkNode(parent, context)),
  );
  if (!$isElementNode(container)) {
    return new Set();
  }
  if (textContent !== $exportedText(node, context)) {
    // A transformer writes other text for the node, which is opaque to the
    // text around it.
    return new Set();
  }
  let escapes = context.escapes.get(container.getKey());
  if (!escapes) {
    escapes = new Map();
    for (const [piece, indices] of findEscapes(
      $collectPieces(container, context),
      $isMarkdownLinkNode(container, context),
      $isHeadingNode(container),
      context,
    )) {
      escapes.set(piece.getKey(), indices);
    }
    context.escapes.set(container.getKey(), escapes);
  }
  return escapes.get(node.getKey()) || new Set();
}

// A run of exported text: its node, the text as a reader sees it, whether it
// is literal text that can be escaped, and where it starts in the node's text.
type Piece = [LexicalNode, string, boolean, number];

// The exported text of a block or link, in order, looking into inline
// elements that are written as their children. A link nested in it is
// written as `[]()`, since only its brackets matter around it.
function $collectPieces(
  container: ElementNode,
  context: ExportContext,
): Piece[] {
  const pieces: Piece[] = [];
  const $visit = (parent: ElementNode) => {
    for (const child of parent.getChildren()) {
      if (!$isExported(child, context)) {
        continue;
      }
      if ($isMarkdownLinkNode(child, context)) {
        pieces.push([child, '[]()', false, 0]);
        continue;
      }
      const markdown = $exportWithTransformer(child, context);
      if (markdown !== null) {
        pieces.push([child, markdown, false, 0]);
      } else if ($isElementNode(child) && !child.isInline()) {
        // A block in a block, such as a nested list, starts a new line.
        pieces.push([child, '\n', false, 0]);
      } else if ($isElementNode(child)) {
        $visit(child);
      } else if ($isTextNode(child)) {
        const text = $exportedText(child, context) || '';
        if (child.hasFormat('code')) {
          // A code span starts with a backtick, and holds no syntax.
          pieces.push([child, '`', false, 0]);
          continue;
        }
        let offset = 0;
        for (const [start, end] of $rawInlineSpans(child, text)) {
          // Brackets in raw HTML are not link syntax.
          pieces.push(
            [child, text.slice(offset, start), true, offset],
            [
              child,
              text.slice(start, end).replace(/[[\]]/g, ' '),
              false,
              start,
            ],
          );
          offset = end;
        }
        pieces.push([child, text.slice(offset), true, offset]);
      } else {
        pieces.push([child, child.getTextContent(), false, 0]);
      }
    }
  };
  $visit(container);
  return pieces;
}

// The Markdown a text match transformer other than for links writes for a
// node, which is opaque to escaping, or null.
function $exportWithTransformer(
  node: LexicalNode,
  context: ExportContext,
): string | null {
  for (const transformer of context.textMatchTransformers) {
    const result =
      transformer.export &&
      transformer.export(
        node,
        element => element.getTextContent(),
        (_textNode, textContent) => textContent,
      );
    if (result != null) {
      return result;
    }
  }
  return null;
}

// A line that would read back as a heading, block quote, list item, task
// list item, thematic break, setext heading underline or table delimiter
// row. Fences and HTML blocks start with characters escaped anywhere.
const LINE_START_SYNTAX =
  /^(?:#{1,6}(?:\s|$)|>|[-+](?:\s|$)|-[-:|\s]*$|=+\s*$|[:|][-:|\s]*-[-:|\s]*$|\[[ xX]?\](?:\s|$))/;

// Finds the escapes that the text of a block or link needs, by node: line
// starts that would read back as block syntax, `<` and `&` that would begin
// raw HTML, an autolink or a character reference, a `!` before a link, and
// the brackets a CommonMark reader would pair into a link, or that link text
// cannot hold. Link and heading text start mid-line, after `[` or `# `.
function findEscapes(
  pieces: Piece[],
  inLink: boolean,
  isHeading: boolean,
  context: ExportContext,
): Map<LexicalNode, Set<number>> {
  const startsMidLine = inLink || isHeading;
  const {lineStartRegExps, shouldPreserveNewLines, taggedFormats} = context;
  const starts: number[] = [];
  const pieceOf: number[] = [];
  let text = '';
  pieces.forEach(([, pieceText], index) => {
    starts.push(text.length);
    text += pieceText;
    for (let i = 0; i < pieceText.length; i++) {
      pieceOf.push(index);
    }
  });
  const isLiteral = (i: number): boolean =>
    i >= 0 && i < text.length && pieces[pieceOf[i]][2];
  const escaped = new Set<number>();

  // When preserving source newlines, a backslash at the end of a node would
  // escape what the export writes next, or make a hard line break.
  if (shouldPreserveNewLines) {
    pieces.forEach(([node, pieceText, literal], index) => {
      const end = starts[index] + pieceText.length;
      if (
        literal &&
        pieceText.endsWith('\\') &&
        (end < text.length ||
          inLink ||
          taggedFormats.some(format => hasFormat(node, format)))
      ) {
        escaped.add(end - 1);
      }
    });
  }

  for (
    let lineStart = startsMidLine ? text.indexOf('\n') + 1 : 0;
    lineStart > 0 || !startsMidLine;
    lineStart = text.indexOf('\n', lineStart) + 1
  ) {
    const lineEnd = text.indexOf('\n', lineStart);
    const line = text.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    const first = lineStart + line.length - line.trimStart().length;
    const rest = line.slice(first - lineStart);
    const piece = pieceOf[first];
    // A node that starts the line with its delimiters is not block syntax,
    // unless the text before it carries the format on and opens no tag.
    let previous = piece === undefined ? -1 : piece - 1;
    while (previous >= 0 && !$isTextNode(pieces[previous][0])) {
      previous--;
    }
    const isTagged =
      piece !== undefined &&
      /^[ \t]*$/.test(text.slice(starts[piece], first)) &&
      taggedFormats.some(
        format =>
          hasFormat(pieces[piece][0], format) &&
          (previous < 0 || !hasFormat(pieces[previous][0], format)),
      );
    const orderedList = /^\d+[.)](?:\s|$)/.exec(rest);
    if (rest === '' || (isTagged && !/^=+\s*$/.test(rest))) {
      // Nothing to escape. A tagged node's delimiters come first, except
      // that `==` around `=` would still read as a setext heading underline.
    } else if (isTagged) {
      if (isLiteral(first)) {
        escaped.add(first);
      }
    } else if (orderedList) {
      const delimiter = first + orderedList[0].trimEnd().length - 1;
      if (isLiteral(delimiter)) {
        escaped.add(delimiter);
      }
    } else if (
      isLiteral(first) &&
      ESCAPABLE.test(text[first]) &&
      (LINE_START_SYNTAX.test(rest) ||
        lineStartRegExps.some(regExp => line.search(regExp) !== -1))
    ) {
      escaped.add(first);
    }
    if (lineEnd === -1) {
      break;
    }
  }

  // A heading's closing sequence of `#`, which a reader drops.
  const closing = isHeading ? /(?:^|[ \t])(#+)[ \t]*$/.exec(text) : null;
  if (closing) {
    const hash = closing.index + closing[0].indexOf('#');
    if (isLiteral(hash)) {
      escaped.add(hash);
    }
  }

  // `<` and `&` that would begin raw HTML, an autolink or a character
  // reference, and a `!` before a link that the export writes.
  const lastClose = text.lastIndexOf('>');
  for (const match of text.matchAll(/<(?=[A-Za-z/!?])|!(?=\[)/g)) {
    if (
      isLiteral(match.index) &&
      (match[0] === '<' ? match.index < lastClose : !isLiteral(match.index + 1))
    ) {
      escaped.add(match.index);
    }
  }
  for (const match of text.matchAll(CHARACTER_REFERENCE_START)) {
    if (isLiteral(match.index)) {
      escaped.add(match.index);
    }
  }

  // Brackets, paired the way a CommonMark reader pairs them.
  // https://spec.commonmark.org/0.31.2/#look-for-link-or-image
  let openers: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const literal = isLiteral(i);
    if ((char !== '[' && char !== ']') || escaped.has(i)) {
      // Not a bracket a reader pairs.
    } else if (char === '[') {
      openers.push(i);
    } else if (
      openers.length > 0 &&
      (text[i + 1] === '(' ||
        // A link reference definition, which only starts a paragraph.
        (text[i + 1] === ':' &&
          !startsMidLine &&
          openers[0] === text.length - text.trimStart().length))
    ) {
      const opener = openers[openers.length - 1];
      if (literal) {
        // Escaped, the bracket keeps the opener.
        escaped.add(i);
      } else if (text[opener - 1] === '!' && !escaped.has(opener - 1)) {
        // An image the export writes.
        openers.pop();
      } else {
        // A link the export writes, which deactivates the brackets before it.
        openers = [];
      }
    } else if (openers.pop() === undefined && literal && inLink) {
      escaped.add(i);
    }
  }
  if (inLink) {
    for (const opener of openers) {
      if (isLiteral(opener)) {
        escaped.add(opener);
      }
    }
  }

  const escapes = new Map<LexicalNode, Set<number>>();
  for (const index of escaped) {
    const [node, , , offset] = pieces[pieceOf[index]];
    const indices = escapes.get(node) || new Set();
    escapes.set(node, indices.add(index - starts[pieceOf[index]] + offset));
  }
  return escapes;
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
