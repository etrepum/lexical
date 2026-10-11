/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {namedSignals} from '@lexical/extension';
import {UndoManager} from '@y/y';
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CLEAR_HISTORY_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  defineExtension,
  mergeRegister,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical';

import {type YSelection} from './Selection';
import {YExtension} from './YExtension';

/** Collaborative history for local edits to the root and referenced shared types. */
export const YHistoryExtension = defineExtension({
  build() {
    return namedSignals({
      canRedo: false,
      canUndo: false,
      undoManager: null as UndoManager | null,
    });
  },
  config: {captureTimeout: 500},
  dependencies: [YExtension],
  name: '@lexical/y/History',
  register(editor, config, state) {
    const {binding} = state.getDependency(YExtension).output;
    const output = state.getOutput();
    const manager = new UndoManager(binding.root, {
      captureTimeout: config.captureTimeout,
      trackedOrigins: new Set([binding]),
    });
    output.undoManager.value = manager;
    const unregisterSharedTypes = binding.registerSharedTypeListener(type =>
      manager.addToScope(type),
    );
    const update = () => {
      const canUndo = manager.undoStack.length > 0;
      const canRedo = manager.redoStack.length > 0;
      output.canUndo.value = canUndo;
      output.canRedo.value = canRedo;
      editor.dispatchCommand(CAN_UNDO_COMMAND, canUndo);
      editor.dispatchCommand(CAN_REDO_COMMAND, canRedo);
    };
    const added: Parameters<typeof manager.on<'stack-item-added'>>[1] = ({
      stackItem,
    }) => {
      stackItem.meta.set('selection', binding.selectionBefore);
      update();
    };
    manager.on('stack-item-added', added);
    manager.on('stack-item-updated', update);
    manager.on('stack-item-popped', update);
    manager.on('stack-cleared', update);
    const apply = (redo: boolean) => {
      const stack = redo ? manager.redoStack : manager.undoStack;
      const item = stack[stack.length - 1];
      if (item) {
        const current = binding.selection;
        binding.restoringSelection = item.meta.get(
          'selection',
        ) as YSelection | null;
        binding.selectionBefore = current;
        try {
          if (redo) manager.redo();
          else manager.undo();
        } finally {
          binding.restoringSelection = undefined;
        }
      }
      return true;
    };
    const unregister = mergeRegister(
      editor.registerCommand(
        UNDO_COMMAND,
        () => apply(false),
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        REDO_COMMAND,
        () => apply(true),
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        CLEAR_HISTORY_COMMAND,
        () => {
          manager.clear();
          return false;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
    update();
    return () => {
      unregisterSharedTypes();
      unregister();
      manager.destroy();
      output.undoManager.value = null;
      output.canUndo.value = false;
      output.canRedo.value = false;
    };
  },
});
