/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {LexicalEditor} from 'lexical';

import {
  type LexicalCommandLog,
  registerLexicalCommandLogger,
} from '@lexical/devtools-core';

export type CommandLogs = WeakMap<LexicalEditor, LexicalCommandLog>;

const loggedEditors = new WeakMap<CommandLogs, WeakSet<LexicalEditor>>();

/**
 * Start recording the commands dispatched to `editor` into `commandLogs`,
 * unless that is already happening.
 */
export function ensureCommandLogger(
  editor: LexicalEditor,
  commandLogs: CommandLogs,
): void {
  let editors = loggedEditors.get(commandLogs);
  if (editors === undefined) {
    editors = new WeakSet();
    loggedEditors.set(commandLogs, editors);
  }
  if (editors.has(editor)) {
    return;
  }
  editors.add(editor);
  // TODO: validate that this will be garbage collected when the editor node is destroyed
  registerLexicalCommandLogger(editor, setter => {
    commandLogs.set(editor, setter(commandLogs.get(editor) ?? []));
  });
}
