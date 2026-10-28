/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import invariant from '@lexical/internal/invariant';
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

  const config = createEscapeConfig(
    byType,
    textFormatTransformers,
    shouldPreserveNewLines,
  );

  return node =>
    $withExportContext(null, config, () => {
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

  const config = createEscapeConfig(
    byType,
    textFormatTransformers,
    shouldPreserveNewLines,
  );

  return selection =>
    $withExportContext(selection, config, () => {
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

  const output = isLiteral ? $escapeText(node, textContent) : textContent;

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

// What escaping depends on in the transformers an export uses.
type EscapeConfig = Readonly<{
  // Import regular expressions of the element transformers, which read a
  // line start as block syntax.
  lineStartRegExps: RegExp[];
  shouldPreserveNewLines: boolean;
  // Formats written with delimiters around the text.
  taggedFormats: TextFormatType[];
  // Whether a LinkNode is written as `[text](url)`, as LINK writes it.
  // Otherwise its text is written as plain text.
  writesLinks: boolean;
}>;

function createEscapeConfig(
  byType: ReturnType<typeof transformersByType>,
  textFormatTransformers: TextFormatTransformer[],
  shouldPreserveNewLines: boolean,
): EscapeConfig {
  return {
    lineStartRegExps: [
      ...byType.element.map(transformer => transformer.regExp),
      ...byType.multilineElement.map(transformer => transformer.regExpStart),
    ],
    shouldPreserveNewLines,
    taggedFormats: textFormatTransformers
      .map(transformer => transformer.format[0])
      .filter(format => format !== 'code'),
    writesLinks: byType.textMatch.some(
      transformer =>
        transformer.export !== undefined &&
        transformer.dependencies.includes(LinkNode),
    ),
  };
}

// What one export call shares: its configuration, the selection it exports,
// if any, and the escapes in each block or link text, found once per export.
let exportContext:
  | (EscapeConfig & {
      escapes: Map<NodeKey, Map<NodeKey, Set<number>>>;
      selection: BaseSelection | null;
    })
  | null = null;

function $withExportContext<T>(
  selection: BaseSelection | null,
  config: EscapeConfig,
  fn: () => T,
): T {
  const previous = exportContext;
  exportContext = {...config, escapes: new Map(), selection};
  try {
    return fn();
  } finally {
    exportContext = previous;
  }
}

function getExportContext(): NonNullable<typeof exportContext> {
  invariant(exportContext !== null, 'Markdown export context is not set');
  return exportContext;
}

// Text imported from raw inline syntax is written as it was while unchanged.
function $isRawInlineText(node: TextNode, textContent: string): boolean {
  return textContent !== '' && $getState(node, rawInlineState) === textContent;
}

// The text of a node that the export writes, or null if it writes none.
function $exportedText(node: TextNode): string | null {
  const {selection} = getExportContext();
  if (!selection) {
    return node.getTextContent();
  }
  return node.isSelected(selection)
    ? $sliceSelectedTextNodeContent(selection, node, 'clone').getTextContent()
    : null;
}

// Whether the export writes a node, or anything in it.
function $isExported(node: LexicalNode): boolean {
  const {selection} = getExportContext();
  return (
    !selection ||
    node.isSelected(selection) ||
    ($isElementNode(node) &&
      node.getAllTextNodes().some(text => text.isSelected(selection)))
  );
}

function $isMarkdownLinkNode(node: LexicalNode | null): boolean {
  return (
    $isLinkNode(node) &&
    !$isAutoLinkNode(node) &&
    getExportContext().writesLinks
  );
}

// Escapes literal text that would otherwise read back as Markdown syntax.
// `*`, `_`, `` ` ``, `~` and backslashes are escaped anywhere. Other syntax
// depends on the text around it, which is read once for each block.
function $escapeText(node: TextNode, textContent: string): string {
  const {shouldPreserveNewLines} = getExportContext();
  const escapes = $escapesIn(node, textContent);
  let output = '';
  for (let i = 0; i < textContent.length; i++) {
    const char = textContent[i];
    // Backslashes are written as they are when preserving source newlines,
    // so one that already escapes a character escapes it in the output too.
    const escape =
      escapes.has(i) ||
      (/[*_`~\\]/.test(char) &&
        !(
          shouldPreserveNewLines &&
          (char === '\\' || isEscaped(textContent, i))
        ));
    output += escape ? '\\' + char : char;
  }
  return output;
}

// The indices in a node's text that need an escape, from the escapes in the
// text of its block, or of the link around it.
function $escapesIn(node: TextNode, textContent: string): Set<number> {
  const context = getExportContext();
  const container = $findMatchingParent(
    node,
    parent =>
      $isElementNode(parent) &&
      (!parent.isInline() || $isMarkdownLinkNode(parent)),
  );
  // A transformer may export text other than the node's own, which is read
  // on its own.
  if (!$isElementNode(container) || textContent !== $exportedText(node)) {
    return (
      findEscapes([[node, textContent, true]], false).get(node) || new Set()
    );
  }
  let escapes = context.escapes.get(container.getKey());
  if (!escapes) {
    escapes = new Map();
    for (const [piece, indices] of findEscapes(
      $collectPieces(container),
      $isMarkdownLinkNode(container),
    )) {
      escapes.set(piece.getKey(), indices);
    }
    context.escapes.set(container.getKey(), escapes);
  }
  return escapes.get(node.getKey()) || new Set();
}

// A run of exported text: its node, the text as a reader sees it, and whether
// it is literal text that can be escaped.
type Piece = [LexicalNode, string, boolean];

// Stands for a link nested in a block. Brackets before a link are
// deactivated, and a `!` before it makes it an image.
const LINK_PIECE = '￼';

// The exported text of a block or link, in order, looking into inline
// elements other than links.
function $collectPieces(container: ElementNode): Piece[] {
  const pieces: Piece[] = [];
  const $visit = (parent: ElementNode) => {
    for (const child of parent.getChildren()) {
      if ($isMarkdownLinkNode(child)) {
        if ($isExported(child)) {
          pieces.push([child, LINK_PIECE, false]);
        }
      } else if ($isElementNode(child)) {
        $visit(child);
      } else if ($isTextNode(child)) {
        const text = $exportedText(child);
        if (text !== null) {
          pieces.push(
            child.hasFormat('code')
              ? // A code span starts with a backtick, and holds no syntax.
                [child, '`', false]
              : [child, text, !$isRawInlineText(child, text)],
          );
        }
      } else if ($isExported(child)) {
        pieces.push([child, child.getTextContent(), false]);
      }
    }
  };
  $visit(container);
  return pieces;
}

// A line that would read back as a heading, block quote, list item, task
// list item, thematic break, setext heading underline or table delimiter
// row. Fences and HTML blocks start with characters escaped anywhere.
const LINE_START_SYNTAX =
  /^(?:#{1,6}(?:\s|$)|>|[-+](?:\s|$)|-[-:|\s]*$|=+\s*$|[:|][-:|\s]*-[-:|\s]*$|\[[ xX]?\](?:\s|$))/;

// Link text that import reads holds brackets nested this deep.
const LINK_TEXT_BRACKET_DEPTH = 3;

// Whether text ends with a backslash that escapes what follows it.
function endsWithEscape(text: string): boolean {
  return isEscaped(text + '!', text.length);
}

// Finds the escapes that the text of a block or link needs, by node: line
// starts that would read back as block syntax, `<` and `&` that would begin
// raw HTML, an autolink or a character reference, a `!` before a link, and
// the brackets a CommonMark reader would pair into a link, or that link text
// cannot hold.
function findEscapes(
  pieces: Piece[],
  inLink: boolean,
): Map<LexicalNode, Set<number>> {
  const {lineStartRegExps, shouldPreserveNewLines, taggedFormats} =
    getExportContext();
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
  // Whether the character is literal text that is not already escaped.
  const canEscape = (i: number): boolean => {
    if (i < 0 || i >= text.length) {
      return false;
    }
    const [, pieceText, isLiteral] = pieces[pieceOf[i]];
    return (
      isLiteral &&
      !(shouldPreserveNewLines && isEscaped(pieceText, i - starts[pieceOf[i]]))
    );
  };
  const escaped = new Set<number>();

  // When preserving source newlines, a backslash at the end of a node would
  // escape what the export writes next, unless that is a line ending.
  if (shouldPreserveNewLines) {
    pieces.forEach(([node, pieceText, isLiteral], index) => {
      const end = starts[index] + pieceText.length;
      if (
        isLiteral &&
        endsWithEscape(pieceText) &&
        text[end] !== '\n' &&
        (end < text.length ||
          inLink ||
          taggedFormats.some(format => hasFormat(node, format)))
      ) {
        escaped.add(end - 1);
      }
    });
  }

  // Line starts. A line of link text starts after the link's `[` unless a
  // line break starts it.
  for (
    let lineStart = inLink ? text.indexOf('\n') + 1 : 0;
    lineStart > 0 || !inLink;
    lineStart = text.indexOf('\n', lineStart) + 1
  ) {
    const lineEnd = text.indexOf('\n', lineStart);
    const line = text.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    const first = lineStart + line.length - line.trimStart().length;
    const rest = line.slice(first - lineStart);
    const piece = pieceOf[first];
    // A node that starts the line with its delimiters is not block syntax.
    const isTagged =
      piece !== undefined &&
      /^[ \t]*$/.test(text.slice(starts[piece], first)) &&
      taggedFormats.some(format => hasFormat(pieces[piece][0], format));
    const orderedList = /^\d+[.)](?:\s|$)/.exec(rest);
    if (rest === '' || isTagged) {
      // Nothing to escape.
    } else if (orderedList) {
      const delimiter = first + orderedList[0].trimEnd().length - 1;
      if (canEscape(delimiter)) {
        escaped.add(delimiter);
      }
    } else if (
      canEscape(first) &&
      /[!-/:-@[-`{-~]/.test(text[first]) &&
      (LINE_START_SYNTAX.test(rest) ||
        lineStartRegExps.some(regExp => line.search(regExp) !== -1))
    ) {
      escaped.add(first);
    }
    if (lineEnd === -1) {
      break;
    }
  }

  // `<` and `&` that would begin raw HTML, an autolink or a character
  // reference, and a `!` before a link.
  for (const match of text.matchAll(/<(?=[A-Za-z/!?])|!(?=￼)/g)) {
    if (canEscape(match.index)) {
      escaped.add(match.index);
    }
  }
  for (const match of text.matchAll(CHARACTER_REFERENCE_START)) {
    if (canEscape(match.index)) {
      escaped.add(match.index);
    }
  }

  // Brackets, paired the way a CommonMark reader pairs them. A link nested in
  // a block deactivates the brackets before it. Openers are kept as indices,
  // or -1 for one that link text holds too deep, escaped with its closer.
  // https://spec.commonmark.org/0.31.2/#look-for-link-or-image
  let openers: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === LINK_PIECE) {
      openers = [];
    } else if (
      (char !== '[' && char !== ']') ||
      !canEscape(i) ||
      escaped.has(i)
    ) {
      // Not a bracket a reader pairs.
    } else if (char === '[') {
      if (inLink && openers.length >= LINK_TEXT_BRACKET_DEPTH) {
        escaped.add(i);
        openers.push(-1);
      } else {
        openers.push(i);
      }
    } else if (
      openers.length > 0 &&
      openers[openers.length - 1] !== -1 &&
      /[(:]/.test(text[i + 1] || '')
    ) {
      // The reader would close a link here. Escaped, it keeps the opener.
      escaped.add(i);
    } else {
      const opener = openers.pop();
      if (opener === -1 || (opener === undefined && inLink)) {
        escaped.add(i);
      }
    }
  }
  if (inLink) {
    for (const opener of openers) {
      if (opener !== -1) {
        escaped.add(opener);
      }
    }
  }

  const escapes = new Map<LexicalNode, Set<number>>();
  for (const index of escaped) {
    const [node] = pieces[pieceOf[index]];
    const indices = escapes.get(node) || new Set();
    escapes.set(node, indices.add(index - starts[pieceOf[index]]));
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
