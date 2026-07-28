/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {ClipboardDOMImportExtension} from '@lexical/clipboard';
import {
  AutoFocusExtension,
  buildEditorFromExtensions,
  getExtensionDependencyFromEditor,
  HorizontalRuleExtension,
  TabIndentationExtension,
} from '@lexical/extension';
import {HistoryExtension} from '@lexical/history';
import {LinkExtension} from '@lexical/link';
import {CheckListExtension, ListExtension} from '@lexical/list';
import {$createHeadingNode, RichTextExtension} from '@lexical/rich-text';
import {$createParagraphNode, $createTextNode, $getRoot} from 'lexical';

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
export function createReviewEditor(): OctaneEditor {
  const editor = buildEditorFromExtensions({
    $initialEditorState: $prepopulate,
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
