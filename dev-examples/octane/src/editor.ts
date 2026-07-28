/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $insertGeneratedNodes,
  ClipboardDOMImportExtension,
} from '@lexical/clipboard';
import {
  AutoFocusExtension,
  buildEditorFromExtensions,
  getExtensionDependencyFromEditor,
  HorizontalRuleExtension,
  TabIndentationExtension,
} from '@lexical/extension';
import {withDOM} from '@lexical/headless/dom';
import {HistoryExtension} from '@lexical/history';
import {
  $generateHtmlFromNodes,
  $generateNodesFromDOMViaExtension,
} from '@lexical/html';
import {LinkExtension} from '@lexical/link';
import {CheckListExtension, ListExtension} from '@lexical/list';
import {$createHeadingNode, RichTextExtension} from '@lexical/rich-text';
import {
  $addUpdateTag,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $selectAll,
  HISTORY_MERGE_TAG,
  type InitialEditorStateType,
  type LexicalEditor,
} from 'lexical';

import {OctaneReviewCardExtension} from './ReviewCardExtension';
import {$createSampleReviewCardNode} from './ReviewCardNode';
import theme from './theme';
import {ToolbarStateExtension} from './ToolbarStateExtension';

/** Seed the editor with content that shows off each Octane-rendered surface. */
function $prepopulate(): void {
  const root = $getRoot();
  root.append(
    $createHeadingNode('h2').append(
      $createTextNode('A rich-text editor, rendered with Octane'),
    ),
    $createParagraphNode().append(
      $createTextNode(
        'The toolbar above and the review card below are both rendered by ',
      ),
      $createTextNode('Octane').toggleFormat('bold'),
      $createTextNode(
        ', reading from and writing to this Lexical editor. Try the toolbar, ' +
          'click the stars, and edit the quote and the attribution — each is an ' +
          'isolated slot inside one editor.',
      ),
    ),
    $createSampleReviewCardNode(),
    $createParagraphNode().append(
      $createTextNode('Everything is reflected in the tree below. '),
      $createTextNode('Edit away.').toggleFormat('italic'),
    ),
  );
}

export type ToolbarState = ReturnType<
  typeof getExtensionDependencyFromEditor<typeof ToolbarStateExtension>
>['output'];

export interface OctaneEditor {
  editor: ReturnType<typeof buildEditorFromExtensions>;
  toolbar: ToolbarState;
}

/**
 * Build the framework-agnostic editor with `buildEditorFromExtensions`. Every
 * feature is an extension — including our toolbar-state and Octane review-card
 * extensions — so there is no plugin/component tree here, just a
 * topologically-sorted list. The editor needs no DOM to exist: it is built
 * synchronously and the caller attaches a root element later via
 * `editor.setRootElement`. Returns the editor plus the signals the Octane view
 * layer reads.
 */
export function createReviewEditor(
  $initialEditorState: InitialEditorStateType = $prepopulate,
): OctaneEditor {
  const editor = buildEditorFromExtensions({
    $initialEditorState,
    dependencies: [
      RichTextExtension,
      ListExtension,
      CheckListExtension,
      LinkExtension,
      HorizontalRuleExtension,
      TabIndentationExtension,
      HistoryExtension,
      AutoFocusExtension,
      // Route real `text/html` pastes through the DOMImportExtension pipeline,
      // so the review card's import rule fires on pastes too, not just on load.
      ClipboardDOMImportExtension,
      // Reactive toolbar state consumed by the Octane view layer.
      ToolbarStateExtension,
      // The node + its Octane rendering.
      OctaneReviewCardExtension,
    ],
    name: '[root]',
    namespace: 'Lexical × Octane',
    theme,
  });

  return {
    editor,
    toolbar: getExtensionDependencyFromEditor(editor, ToolbarStateExtension)
      .output,
  };
}

/**
 * Prerender the seeded editor content to HTML on the server. Builds a throwaway
 * editor headlessly (no root element) inside `withDOM` — which polyfills a DOM
 * via happy-dom so `exportDOM` can create elements — and serializes it with
 * `$generateHtmlFromNodes`. The export form is what the client re-imports, so
 * the round-trip is lossless even for the review card (whose `createDOM` is an
 * empty host box, but whose `exportDOM` carries its slots and rating).
 */
export function prerenderEditorHtml(): string {
  return withDOM(() => {
    const {editor} = createReviewEditor($prepopulate);
    return editor.read(() => $generateHtmlFromNodes(editor));
  });
}

/**
 * Adopt server-prerendered editor DOM on the client. When the editor is still
 * empty, parse the prerendered HTML already sitting in `container` back into the
 * model through the DOM-import pipeline (so the review card's import rule runs),
 * tagged so it doesn't create an undo entry. After this the caller attaches the
 * container with `setRootElement`, which re-renders the (now-populated) state —
 * so the content is only ever sent to the client once, as HTML.
 */
export function hydrateFromDOM(
  editor: LexicalEditor,
  container: HTMLElement,
): void {
  if (!editor.getEditorState().isEmpty()) {
    return;
  }
  editor.update(
    () => {
      const nodes = $generateNodesFromDOMViaExtension(container);
      $insertGeneratedNodes(editor, nodes, $selectAll());
      $addUpdateTag(HISTORY_MERGE_TAG);
    },
    {tag: HISTORY_MERGE_TAG},
  );
}
