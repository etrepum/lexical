/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {MdastExportHandler, MdastImportHandler} from '@lexical/mdast';
import type {
  BlockContent,
  Details,
  Html,
  Nodes,
  Parent,
  PhrasingContent,
  Root,
} from 'mdast';
import type {Extension as FromMarkdownExtension} from 'mdast-util-from-markdown';
import type {
  Handle,
  Options as ToMarkdownExtension,
} from 'mdast-util-to-markdown';

import {domOverride, DOMRenderExtension} from '@lexical/html';
import {MdastImportExtension} from '@lexical/mdast';
import {$insertNodeToNearestRoot, mergeRegister} from '@lexical/utils';
import {
  $createParagraphNode,
  $getSelection,
  $getSlot,
  $getSlotFrame,
  $getSlotHost,
  $isDecoratorNode,
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  configExtension,
  createCommand,
  defineExtension,
  INSERT_PARAGRAPH_COMMAND,
  type LexicalCommand,
  type LexicalNode,
} from 'lexical';
import {fromMarkdown} from 'mdast-util-from-markdown';

import {
  $createCollapsibleNode,
  $isCollapsibleNode,
  CollapsibleNode,
} from './CollapsibleNode';

// The mdast node the `<details>` construct is normalized into. Declared
// through interface merging — mdast's sanctioned extension point — so the
// import/export handlers need no casts and `details` participates in the
// `Nodes` / block-content unions.
declare module 'mdast' {
  interface Details extends Parent {
    type: 'details';
    /** Present (true) when the `<details>` tag carried the `open` attribute. */
    open?: boolean;
    /** The phrasing content of the `<summary>` line. */
    summary: PhrasingContent[];
    children: BlockContent[];
  }
  interface BlockContentMap {
    details: Details;
  }
  interface RootContentMap {
    details: Details;
  }
}

/* -------------------------------------------------------------------------- *
 * mdast tree transform: raw `<details>` html blocks -> `details` nodes       *
 * -------------------------------------------------------------------------- */

// CommonMark parses raw HTML blocks by blank lines, not by tag structure, so
// the GFM-style encoding arrives as a *sequence* of mdast nodes:
//
//   html('<details><summary>\n…\n</summary>')   <- runs until the blank line
//   paragraph(…)                                 <- ordinary markdown blocks
//   html('</details>')                           <- interrupts the paragraph
//
// (With no blank lines at all the whole construct is a single html node.)
// This from-markdown transform reassembles those sequences into structured
// `details` nodes before the import walk runs.

const DETAILS_OPEN_RE = /<details(?=[\s/>])/gi;
const DETAILS_CLOSE_RE = /<\/details\s*>/gi;
const OPENER_RE =
  /^<details([^>]*)>\s*(?:<summary[^>]*>([\s\S]*?)<\/summary\s*>)?\s*([\s\S]*)$/i;
const CLOSER_TAIL_RE = /(?:\s*<\/details\s*>)+\s*$/i;

/** Net `<details>` nesting change across one raw html value. */
function detailsDepthDelta(value: string): number {
  const opens = value.match(DETAILS_OPEN_RE);
  const closes = value.match(DETAILS_CLOSE_RE);
  return (opens ? opens.length : 0) - (closes ? closes.length : 0);
}

// The summary line and any content embedded in the raw html values are
// re-parsed as markdown of their own. Their positions would point into the
// wrong source, so they are stripped — the importer skips source-based
// syntax recovery for position-less nodes and uses its defaults.
function stripPositions<T extends Nodes>(node: T): T {
  delete node.position;
  if ('children' in node) {
    for (const child of node.children) {
      stripPositions(child);
    }
  }
  return node;
}

function parseMarkdownBlocks(value: string): BlockContent[] {
  const markdown = value.trim();
  if (markdown === '') {
    return [];
  }
  const root = stripPositions(fromMarkdown(markdown));
  // Blank-line-free constructs keep nested `<details>` inside one html
  // value; transform the re-parse so those still become structured nodes.
  transformDetailsInParent(root);
  return root.children as BlockContent[];
}

function parseSummaryPhrasing(value: string): PhrasingContent[] {
  const markdown = value.trim();
  if (markdown === '') {
    return [];
  }
  const phrasing: PhrasingContent[] = [];
  for (const child of stripPositions(fromMarkdown(markdown)).children) {
    if (child.type === 'paragraph') {
      phrasing.push(...child.children);
    }
  }
  return phrasing;
}

/**
 * Attempts to reassemble a `details` node from the html node at
 * `parent.children[index]`, consuming siblings up to the balancing
 * `</details>`. Returns the spliced-in node, or null (leaving the tree
 * untouched) when the html node is not a `<details>` opener or is left
 * unclosed.
 */
function tryBuildDetails(parent: Parent, index: number): Details | null {
  const opener = parent.children[index];
  if (opener.type !== 'html') {
    return null;
  }
  const match = OPENER_RE.exec(opener.value);
  if (match === null) {
    return null;
  }
  const [, attrs, summaryText = '', restText = ''] = match;
  const children: BlockContent[] = [];
  let deleteCount = 1;
  const depth = detailsDepthDelta(opener.value);
  if (depth <= 0) {
    // Self-contained: the opener's own value holds the close tag (and any
    // content — no blank line ever ended the html block).
    children.push(...parseMarkdownBlocks(restText.replace(CLOSER_TAIL_RE, '')));
  } else {
    let closerIndex = -1;
    let balance = depth;
    for (let j = index + 1; j < parent.children.length; j++) {
      const sibling = parent.children[j];
      if (sibling.type === 'html') {
        balance += detailsDepthDelta(sibling.value);
        if (balance <= 0) {
          closerIndex = j;
          break;
        }
      }
    }
    if (closerIndex === -1) {
      return null;
    }
    children.push(...parseMarkdownBlocks(restText));
    children.push(
      ...(parent.children.slice(index + 1, closerIndex) as BlockContent[]),
    );
    const closer = parent.children[closerIndex] as Html;
    children.push(
      ...parseMarkdownBlocks(closer.value.replace(CLOSER_TAIL_RE, '')),
    );
    deleteCount = closerIndex - index + 1;
  }
  const details: Details = {
    children,
    summary: parseSummaryPhrasing(summaryText),
    type: 'details',
  };
  if (/(?:^|\s)open\b/i.test(attrs)) {
    details.open = true;
  }
  parent.children.splice(index, deleteCount, details);
  return details;
}

function transformDetailsInParent(parent: Parent): void {
  const children = parent.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.type === 'html') {
      const details = tryBuildDetails(parent, i);
      if (details !== null) {
        // Middle siblings may hold nested `<details>` sequences of their own.
        transformDetailsInParent(details);
        continue;
      }
    }
    if ('children' in child) {
      transformDetailsInParent(child);
    }
  }
}

const detailsFromMarkdown: FromMarkdownExtension = {
  transforms: [
    (tree: Root) => {
      transformDetailsInParent(tree);
    },
  ],
};

/* -------------------------------------------------------------------------- *
 * mdast <-> Lexical handlers                                                 *
 * -------------------------------------------------------------------------- */

const $importDetails: MdastImportHandler<Details> = (node, ctx) => {
  const collapsible = $createCollapsibleNode(node.open === true);
  // Drop the seeded body paragraph; imported blocks replace it (and the
  // node-level transform re-seeds one if the details body was empty).
  collapsible.clear();
  const summary = $getSlot(collapsible, 'summary');
  if ($isElementNode(summary)) {
    summary.append(
      ...ctx.importChildren({children: node.summary, type: 'paragraph'}),
    );
  }
  // Import each flow child as block-level content, wrapping any stray inline
  // output (e.g. from the raw-html fallback) in a paragraph — the same
  // normalization the top-level importer applies.
  const blocks: LexicalNode[] = [];
  let pending: LexicalNode[] = [];
  const flushPending = () => {
    if (pending.length > 0) {
      blocks.push($createParagraphNode().append(...pending));
      pending = [];
    }
  };
  for (const child of node.children) {
    for (const imported of ctx.importNode(child)) {
      if (
        ($isElementNode(imported) || $isDecoratorNode(imported)) &&
        !imported.isInline()
      ) {
        flushPending();
        blocks.push(imported);
      } else {
        pending.push(imported);
      }
    }
  }
  flushPending();
  return collapsible.append(...blocks);
};

const $exportCollapsible: MdastExportHandler = (node, ctx) => {
  if (!$isCollapsibleNode(node)) {
    return null;
  }
  const summary = $getSlot(node, 'summary');
  const details: Details = {
    children: ctx.exportChildren(node) as BlockContent[],
    summary: $isElementNode(summary) ? ctx.exportInline(summary) : [],
    type: 'details',
  };
  if (node.getOpen()) {
    details.open = true;
  }
  return details;
};

// Serializes a `details` node back to the GFM-style encoding. The summary
// phrasing and the body blocks go through the regular to-markdown machinery
// (escaping, nested constructs) — only the tag scaffolding is emitted raw.
const detailsToMarkdown: ToMarkdownExtension = {
  handlers: {
    details: ((node: Details, _parent, state, info) => {
      const tracker = state.createTracker(info);
      let value = tracker.move(
        `<details${node.open === true ? ' open' : ''}><summary>\n`,
      );
      value += tracker.move(
        state.containerPhrasing(
          {children: node.summary, type: 'paragraph'},
          {...tracker.current(), after: '\n', before: '\n'},
        ),
      );
      value += tracker.move('\n</summary>');
      const content = state.containerFlow(node, tracker.current());
      if (content !== '') {
        value += tracker.move('\n\n' + content);
      }
      value += tracker.move('\n</details>');
      return value;
    }) as Handle,
  },
};

/* -------------------------------------------------------------------------- *
 * The extension                                                              *
 * -------------------------------------------------------------------------- */

export const INSERT_COLLAPSIBLE_COMMAND: LexicalCommand<void> = createCommand(
  'INSERT_COLLAPSIBLE_COMMAND',
);

// Enter inside the summary slot is a core no-op (the slot value is a bare
// paragraph, a single-line field); map it to "open the section and move the
// caret to the body", mirroring how the playground's collapsible treats
// Enter in its title.
function $handleSummaryEnter(): boolean {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return false;
  }
  const frame = $getSlotFrame(selection.anchor.getNode());
  if (frame === null) {
    return false;
  }
  const host = $getSlotHost(frame);
  if (!$isCollapsibleNode(host)) {
    return false;
  }
  host.setOpen(true);
  const firstBlock = host.getFirstChild();
  if ($isElementNode(firstBlock)) {
    firstBlock.selectStart();
  }
  return true;
}

/**
 * Wires {@link CollapsibleNode} into the Markdown pipeline using the
 * GFM-style `<details><summary>…</summary>…</details>` encoding:
 *
 * - a from-markdown transform reassembles the raw html block sequence into a
 *   structured `details` mdast node,
 * - import/export rules map `details` <-> {@link CollapsibleNode} (the
 *   summary phrasing travels through the node's named `summary` slot),
 * - a to-markdown handler serializes it back to the same encoding, and
 * - a `$getSlotTargetElement` render override reveals the summary slot in
 *   the node's summary row within the same commit that renders it (the Card
 *   pattern from the playground — no React chrome needed).
 */
export const MdastCollapsibleExtension = defineExtension({
  dependencies: [
    configExtension(DOMRenderExtension, {
      overrides: [
        domOverride([CollapsibleNode], {
          $getSlotTargetElement: (_node, _slotName, hostDom) =>
            hostDom.querySelector<HTMLElement>(
              ':scope > .collapsible-summary-row',
            ),
        }),
      ],
    }),
    configExtension(MdastImportExtension, {
      exportRules: [{$export: $exportCollapsible, type: 'collapsible'}],
      importRules: [{$import: $importDetails, type: 'details'}],
      mdastExtensions: [detailsFromMarkdown],
      toMarkdownExtensions: [detailsToMarkdown],
    }),
  ],
  name: '@lexical/dev-mdast-editor-example/MdastCollapsible',
  nodes: [CollapsibleNode],
  register: editor =>
    mergeRegister(
      editor.registerCommand(
        INSERT_COLLAPSIBLE_COMMAND,
        () => {
          const collapsible = $createCollapsibleNode();
          $insertNodeToNearestRoot(collapsible);
          const summary = $getSlot(collapsible, 'summary');
          if ($isElementNode(summary)) {
            summary.selectStart();
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        INSERT_PARAGRAPH_COMMAND,
        $handleSummaryEnter,
        COMMAND_PRIORITY_LOW,
      ),
    ),
});
