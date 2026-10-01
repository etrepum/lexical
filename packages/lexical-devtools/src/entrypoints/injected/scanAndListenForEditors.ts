/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {ExtensionState} from '../../store';
import type {StoreApi} from 'zustand';

import {serializeEditorState} from '../../serializeEditorState';
import {
  type CommandLogs,
  ensureCommandLogger,
} from '../../utils/ensureCommandLogger';
import queryLexicalNodes from './utils/queryLexicalNodes';

export default function scanAndListenForEditors(
  tabID: number,
  extensionStore: StoreApi<ExtensionState>,
  commandLog: CommandLogs,
) {
  const {setStatesForTab, lexicalState} = extensionStore.getState();
  const states = lexicalState[tabID] ?? {};

  // Editor text is only relayed unmasked while the user has the DevTools
  // panel open for this tab. The rest of the time the structure of the tree is
  // still reported -- so the popup can say how many editors are on the page --
  // but the text itself is masked before it leaves this script.
  const shouldObfuscate = () =>
    extensionStore.getState().isPanelOpen[tabID] !== true;

  const editors = queryLexicalNodes().map(node => node.__lexicalEditor);

  setStatesForTab(
    tabID,
    Object.fromEntries(
      editors.map(e => {
        return [
          e._key,
          serializeEditorState(e.getEditorState(), {
            obfuscateText: shouldObfuscate(),
          }),
        ];
      }),
    ),
  );

  editors.forEach(editor => {
    if (states[editor._key] !== undefined) {
      // already registered
      return;
    }
    editor.registerUpdateListener(event => {
      const oldVal = extensionStore.getState().lexicalState[tabID];
      setStatesForTab(tabID, {
        ...oldVal,
        [editor._key]: serializeEditorState(event.editorState, {
          obfuscateText: shouldObfuscate(),
        }),
      });
    });
    ensureCommandLogger(editor, commandLog);
  });
}
