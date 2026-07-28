/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {batch, namedSignals} from '@lexical/extension';
import {HistoryExtension} from '@lexical/history';
import {mergeRegister} from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  defineExtension,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';

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
      if ($isRangeSelection(selection)) {
        // `batch` coalesces the writes into a single signal notification so
        // subscribers re-render once per sync, not once per format flip.
        batch(() => {
          out.isBold.value = selection.hasFormat('bold');
          out.isItalic.value = selection.hasFormat('italic');
          out.isUnderline.value = selection.hasFormat('underline');
          out.isStrikethrough.value = selection.hasFormat('strikethrough');
        });
      }
    };
    return mergeRegister(
      editor.registerUpdateListener(({editorState}) => editorState.read($sync)),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $sync();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  },
});
