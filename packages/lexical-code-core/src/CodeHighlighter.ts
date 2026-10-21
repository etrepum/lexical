/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $createLineBreakNode,
  $createTabNode,
  $createTextNode,
  $getNodeByKey,
  $getSelection,
  $isLineBreakNode,
  $isRangeSelection,
  $isTabNode,
  $isTextNode,
  $onUpdate,
  type LexicalEditor,
  type LexicalNode,
  mergeRegister,
  type NodeKey,
  TextNode,
  tokenizeRawText,
} from 'lexical';

import {registerCodeGutter} from './CodeGutter';
import {
  $createCodeHighlightNode,
  $isCodeHighlightNode,
  CodeHighlightNode,
} from './CodeHighlightNode';
import {$isCodeNode, CodeNode} from './CodeNode';

/**
 * @internal
 * The engine specific half of a code highlighter, driven by
 * {@link registerCodeHighlighter}.
 */
export interface CodeHighlighter {
  /**
   * Called from the {@link CodeNode} transform before highlighting. Fill in
   * defaults (language, theme), keep `isSyntaxHighlightSupported` current
   * and start loading whatever the engine is missing. Return `false` to skip
   * highlighting for now, after arranging for the node to be marked dirty
   * once the missing piece has loaded.
   */
  $prepare: (codeNode: CodeNode) => boolean;
  /**
   * Keep the style of a highlight node when only its style differs from
   * the freshly tokenized one, for a highlighter that never sets styles.
   */
  keepStyle?: boolean;
  /**
   * Return the children the code node should have: `CodeHighlightNode`s,
   * `LineBreakNode`s and `TabNode`s whose text content equals the node's.
   */
  $tokenize: (codeNode: CodeNode) => LexicalNode[];
}

interface TransformState {
  didTransform: boolean;
  // Using extra cache (`nodesCurrentlyHighlighting`) since both CodeNode and CodeHighlightNode
  // transforms might be called at the same time (e.g. new CodeHighlight node inserted) and
  // in both cases we'll rerun whole reformatting over CodeNode, which is redundant.
  // Especially when pasting code into CodeBlock.
  nodesCurrentlyHighlighting: Set<NodeKey>;
}

const DIFF_PREFIXES = '+->< ';
const DIFF_PREFIX_TYPES = [
  'inserted',
  'deleted',
  'inserted',
  'deleted',
  'unchanged',
];

/**
 * @internal
 * Build the children of a code node from lines of styled tokens, as Shiki
 * and Highlights produce them. With `diff`, a leading `+`, `-`, `>`, `<` or
 * space on a line becomes its own highlight node typed `inserted`,
 * `deleted` or `unchanged`, as for a `diff-xxx` language.
 *
 * @param lines The tokens of each line.
 * @param diff Whether the lines start with diff prefixes.
 * @param getStyle The inline style of a token's highlight nodes.
 * @returns `CodeHighlightNode`s, `LineBreakNode`s and `TabNode`s.
 */
export function $createCodeHighlightNodesFromTokens<
  T extends {content: string},
>(
  lines: readonly (readonly T[])[],
  diff: boolean,
  getStyle: (token: T) => string,
): LexicalNode[] {
  const nodes: LexicalNode[] = [];
  lines.forEach((line, idx) => {
    if (idx) {
      nodes.push($createLineBreakNode());
    }
    line.forEach((token, tidx) => {
      let text = token.content;
      if (diff && tidx === 0 && text.length > 0) {
        const prefixIndex = DIFF_PREFIXES.indexOf(text[0]);
        if (prefixIndex !== -1) {
          nodes.push(
            $createCodeHighlightNode(text[0], DIFF_PREFIX_TYPES[prefixIndex]),
          );
          text = text.slice(1);
        }
      }
      const style = getStyle(token);
      tokenizeRawText(text, {
        linebreak: () => nodes.push($createLineBreakNode()),
        tab: () => nodes.push($createTabNode()),
        text: part =>
          nodes.push($createCodeHighlightNode(part).setStyle(style)),
      });
    });
  });
  return nodes;
}

function $textNodeTransform(
  highlighter: CodeHighlighter,
  transformState: TransformState,
  node: TextNode,
): void {
  // Since CodeNode has flat children structure we only need to check
  // if node's parent is a code node and run highlighting if so
  const parentNode = node.getParent();
  if ($isCodeNode(parentNode)) {
    $codeNodeTransform(highlighter, transformState, parentNode);
  } else if ($isCodeHighlightNode(node)) {
    // When code block converted into paragraph or other element
    // code highlight nodes converted back to normal text
    node.replace($createTextNode(node.__text));
  }
}

function $codeNodeTransform(
  highlighter: CodeHighlighter,
  transformState: TransformState,
  node: CodeNode,
) {
  if (!highlighter.$prepare(node)) {
    return;
  }

  const nodeKey = node.getKey();
  const {nodesCurrentlyHighlighting} = transformState;
  if (nodesCurrentlyHighlighting.has(nodeKey)) {
    return;
  }

  nodesCurrentlyHighlighting.add(nodeKey);
  if (!transformState.didTransform) {
    transformState.didTransform = true;
    $onUpdate(() => {
      transformState.didTransform = false;
      nodesCurrentlyHighlighting.clear();
    });
  }

  $updateAndRetainSelection(nodeKey, () => {
    const currentNode = $getNodeByKey(nodeKey);

    if (!$isCodeNode(currentNode) || !currentNode.isAttached()) {
      return false;
    }

    const highlightNodes = highlighter.$tokenize(currentNode);
    const diffRange = $getDiffRange(
      currentNode.getChildren(),
      highlightNodes,
      !!highlighter.keepStyle,
    );
    const {from, to, nodesForReplacement} = diffRange;

    if (from !== to || nodesForReplacement.length) {
      node.splice(from, to - from, nodesForReplacement);
      return true;
    }

    return false;
  });
}

// Wrapping update function into selection retainer, that tries to keep cursor at the same
// position as before.
function $updateAndRetainSelection(
  nodeKey: NodeKey,
  updateFn: () => boolean,
): void {
  const node = $getNodeByKey(nodeKey);
  if (!$isCodeNode(node) || !node.isAttached()) {
    return;
  }
  const selection = $getSelection();
  // If it's not range selection (or null selection) there's no need to change it,
  // but we can still run highlighting logic
  if (!$isRangeSelection(selection)) {
    updateFn();
    return;
  }

  const anchor = selection.anchor;
  // The selection is restored by walking this code node's children, so it can
  // only be retained when it actually points inside this code node. When the
  // selection lives elsewhere there is nothing to retain and restoring would
  // drag the caret into the code block instead of leaving it where the user
  // put it.
  const anchorNode = anchor.getNode();
  if (anchorNode !== node && !node.isParentOf(anchorNode)) {
    updateFn();
    return;
  }

  const anchorOffset = anchor.offset;
  const isNewLineAnchor =
    anchor.type === 'element' &&
    $isLineBreakNode(node.getChildAtIndex(anchor.offset - 1));
  let textOffset = 0;

  // Calculating previous text offset (all text node prior to anchor + anchor own text offset)
  if (!isNewLineAnchor) {
    textOffset =
      anchorOffset +
      anchorNode.getPreviousSiblings().reduce((offset, _node) => {
        return offset + _node.getTextContentSize();
      }, 0);
  }

  const hasChanges = updateFn();
  if (!hasChanges) {
    return;
  }

  // Non-text anchors only happen for line breaks, otherwise
  // selection will be within text node (code highlight node)
  if (isNewLineAnchor) {
    anchor.getNode().select(anchorOffset, anchorOffset);
    return;
  }

  // If it was non-element anchor then we walk through child nodes
  // and looking for a position of original text offset. A LineBreakNode
  // consumes one unit of the offset but can't host a text point, so when the
  // offset lands on one we use an element point on the code node instead of
  // letting the offset go negative and selecting the next text node at an
  // out-of-range position.
  const children = node.getChildren();
  for (let index = 0; index < children.length; index++) {
    const child = children[index];
    if ($isTextNode(child)) {
      const textContentSize = child.getTextContentSize();
      if (textContentSize >= textOffset) {
        child.select(textOffset, textOffset);
        return;
      }
      textOffset -= textContentSize;
    } else if ($isLineBreakNode(child)) {
      if (textOffset === 0) {
        node.select(index, index);
        return;
      }
      textOffset -= 1;
    }
  }
  node.select(children.length, children.length);
}

// Finds minimal diff range between two nodes lists. It returns from/to range boundaries of prevNodes
// that needs to be replaced with `nodes` (subset of nextNodes) to make prevNodes equal to nextNodes.
function $getDiffRange(
  prevNodes: LexicalNode[],
  nextNodes: LexicalNode[],
  keepStyle: boolean,
): {
  from: number;
  nodesForReplacement: LexicalNode[];
  to: number;
} {
  let leadingMatch = 0;
  while (leadingMatch < prevNodes.length) {
    if (
      !$isEqual(prevNodes[leadingMatch], nextNodes[leadingMatch], keepStyle)
    ) {
      break;
    }
    leadingMatch++;
  }

  const prevNodesLength = prevNodes.length;
  const nextNodesLength = nextNodes.length;
  const maxTrailingMatch =
    Math.min(prevNodesLength, nextNodesLength) - leadingMatch;

  let trailingMatch = 0;
  while (trailingMatch < maxTrailingMatch) {
    trailingMatch++;
    if (
      !$isEqual(
        prevNodes[prevNodesLength - trailingMatch],
        nextNodes[nextNodesLength - trailingMatch],
        keepStyle,
      )
    ) {
      trailingMatch--;
      break;
    }
  }

  const from = leadingMatch;
  const to = prevNodesLength - trailingMatch;
  const nodesForReplacement = nextNodes.slice(
    leadingMatch,
    nextNodesLength - trailingMatch,
  );
  return {
    from,
    nodesForReplacement,
    to,
  };
}

function $isEqual(
  nodeA: LexicalNode,
  nodeB: LexicalNode,
  keepStyle: boolean,
): boolean {
  // Only checking for code highlight nodes, tabs and linebreaks. If it's regular text node
  // returning false so that it's transformed into code highlight node
  return (
    ($isCodeHighlightNode(nodeA) &&
      $isCodeHighlightNode(nodeB) &&
      nodeA.__text === nodeB.__text &&
      nodeA.__highlightType === nodeB.__highlightType &&
      (keepStyle || nodeA.__style === nodeB.__style)) ||
    ($isTabNode(nodeA) && $isTabNode(nodeB)) ||
    ($isLineBreakNode(nodeA) && $isLineBreakNode(nodeB))
  );
}

/**
 * @internal
 * Register the transforms that keep the children of every {@link CodeNode}
 * highlighted by `highlighter`, retaining the caret position across each
 * re-highlight, together with {@link registerCodeGutter}. No keyboard or
 * indent handlers: those belong to `registerCodeIndentation` /
 * `CodeIndentExtension`.
 *
 * Shared by `@lexical/code-prism`, `@lexical/code-shiki` and
 * `@lexical/code-highlights`, which differ only in the engine.
 *
 * @param editor The editor to highlight code blocks in.
 * @param highlighter The engine specific hooks.
 * @returns A teardown that removes the transforms and the gutter listener.
 */
export function registerCodeHighlighter(
  editor: LexicalEditor,
  highlighter: CodeHighlighter,
): () => void {
  const transformState: TransformState = {
    didTransform: false,
    nodesCurrentlyHighlighting: new Set(),
  };
  const $onTextNode = $textNodeTransform.bind(
    null,
    highlighter,
    transformState,
  );
  return mergeRegister(
    registerCodeGutter(editor),
    editor.registerNodeTransform(
      CodeNode,
      $codeNodeTransform.bind(null, highlighter, transformState),
    ),
    editor.registerNodeTransform(TextNode, $onTextNode),
    editor.registerNodeTransform(CodeHighlightNode, $onTextNode),
  );
}
