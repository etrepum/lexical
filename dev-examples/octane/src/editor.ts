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
  EditorStateExtension,
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
      $createTextNode('Everything round-trips through the JSON below. '),
      $createTextNode('Edit away.').toggleFormat('italic'),
    ),
  );
}

export type ToolbarState = ReturnType<typeof buildToolbarState>;

function buildToolbarState(
  editor: ReturnType<typeof buildEditorFromExtensions>,
) {
  return getExtensionDependencyFromEditor(editor, ToolbarStateExtension).output;
}

export interface OctaneEditor {
  editor: ReturnType<typeof buildEditorFromExtensions>;
  toolbar: ToolbarState;
  editorState: ReturnType<
    typeof getExtensionDependencyFromEditor<typeof EditorStateExtension>
  >['output'];
}

/**
 * Build the framework-agnostic editor with `buildEditorFromExtensions` and wire
 * it to `container`. Every feature is an extension — including our toolbar-state
 * and Octane review-card extensions — so there is no plugin/component tree here,
 * just a topologically-sorted list. Returns the editor plus the signals the
 * Octane view layer reads.
 */
export function createReviewEditor(container: HTMLElement): OctaneEditor {
  const editor = buildEditorFromExtensions({
    $initialEditorState: $prepopulate,
    afterRegistration(editorInstance) {
      editorInstance.setRootElement(container);
      return () => editorInstance.setRootElement(null);
    },
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
      // Reactive signals consumed by the Octane view layer.
      EditorStateExtension,
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
    editorState: getExtensionDependencyFromEditor(editor, EditorStateExtension)
      .output,
    toolbar: buildToolbarState(editor),
  };
}
