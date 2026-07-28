/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {batch, namedSignals} from '@lexical/extension';
import {mergeRegister} from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  defineExtension,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';

/**
 * Owns the toolbar's reactive state as a small set of signals and keeps them in
 * sync with the editor. This extension is completely framework-agnostic — it
 * knows nothing about Octane. The Octane `Toolbar` component reads these signals
 * through the `useSignal` bridge, so the editor-side and view-side
 * responsibilities stay cleanly separated (exactly the pattern the React
 * `useExtensionSignalValue` demos use, minus React).
 */
export const ToolbarStateExtension = /* @__PURE__ */ defineExtension({
  build() {
    return namedSignals({
      canRedo: false,
      canUndo: false,
      isBold: false,
      isItalic: false,
      isStrikethrough: false,
      isUnderline: false,
    });
  },
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
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        payload => {
          out.canUndo.value = payload;
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        payload => {
          out.canRedo.value = payload;
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  },
});
