/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {batch, namedSignals} from '@lexical/extension';
import {HistoryExtension} from '@lexical/history';
import {$getSelection, $isRangeSelection, defineExtension} from 'lexical';

/**
 * Owns the toolbar's reactive state. It is completely framework-agnostic — it
 * knows nothing about Octane; the `Toolbar` component reads these signals
 * through the `useSignal` bridge (the pattern the React `useExtensionSignalValue`
 * demos use, minus React).
 *
 * The four text-format flags are derived from the selection here. Undo/redo
 * availability is NOT re-derived: this extension depends on
 * `HistoryExtension` and re-exposes its `canUndo` / `canRedo` signals directly,
 * rather than mirroring `CAN_UNDO_COMMAND` / `CAN_REDO_COMMAND` (which exist for
 * the legacy imperative flow). Declaring the dependency is what makes those
 * signals available to `build`.
 */
export const ToolbarStateExtension = /* @__PURE__ */ defineExtension({
  build(_editor, _config, state) {
    const history = state.getDependency(HistoryExtension).output;
    return {
      ...namedSignals({
        isBold: false,
        isItalic: false,
        isStrikethrough: false,
        isUnderline: false,
      }),
      canRedo: history.canRedo,
      canUndo: history.canUndo,
    };
  },
  dependencies: [HistoryExtension],
  name: '@lexical/examples/octane/ToolbarState',
  register(editor, _config, state) {
    const out = state.getOutput();
    const $sync = () => {
      const selection = $getSelection();
      // Without a range selection (a NodeSelection on the review card, or no
      // selection at all) there is no active text format, so reset the flags to
      // `false` rather than leaving the previous selection's values stale.
      const isRange = $isRangeSelection(selection);
      // `batch` coalesces the writes into a single signal notification so
      // subscribers re-render once per sync, not once per format flip.
      batch(() => {
        out.isBold.value = isRange && selection.hasFormat('bold');
        out.isItalic.value = isRange && selection.hasFormat('italic');
        out.isUnderline.value = isRange && selection.hasFormat('underline');
        out.isStrikethrough.value =
          isRange && selection.hasFormat('strikethrough');
      });
    };
    // A DOM selection change commits as an update (Lexical's `onSelectionChange`
    // runs inside `updateEditorSync` and dispatches `SELECTION_CHANGE_COMMAND`
    // there), so the update listener already fires on selection-only changes —
    // reading the committed selection with its freshly-computed format. A
    // separate `SELECTION_CHANGE_COMMAND` handler would be redundant here.
    return editor.registerUpdateListener(({editorState}) =>
      editorState.read($sync),
    );
  },
});
