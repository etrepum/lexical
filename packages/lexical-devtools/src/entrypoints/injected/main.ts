/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {ExtensionState} from '../../store';
import type {CommandLogs} from '../../utils/ensureCommandLogger';
import type {StoreApi} from 'zustand';

import {registerRPCService} from '@webext-pegasus/rpc';

import {installLexicalDevtoolsAgentAPI} from '../../agent/agentAPI';
import {readEditorState} from '../../lexicalForExtension';
import {InjectedPegasusService} from './InjectedPegasusService';
import scanAndListenForEditors from './scanAndListenForEditors';

const commandLog: CommandLogs = new WeakMap();

export default async function main(
  tabID: number,
  extensionStore: StoreApi<ExtensionState>,
) {
  registerRPCService(
    'InjectedPegasusService',
    new InjectedPegasusService(tabID, extensionStore, commandLog),
  );

  scanAndListenForEditors(tabID, extensionStore, commandLog);

  // Scripted clients (test runners, agents driving the browser) cannot open
  // the DevTools panel, so expose the same views on the page itself. Nothing
  // it returns is beyond what the page can already read from its own editors.
  installLexicalDevtoolsAgentAPI(window, {
    commandLogs: commandLog,
    readEditorState,
  });

  // Serialized state is masked while no panel is open for this tab, so re-scan
  // whenever that changes to swap the relayed states between masked and clear.
  let wasPanelOpen = extensionStore.getState().isPanelOpen[tabID] === true;
  extensionStore.subscribe(state => {
    const isPanelOpen = state.isPanelOpen[tabID] === true;
    if (isPanelOpen !== wasPanelOpen) {
      wasPanelOpen = isPanelOpen;
      scanAndListenForEditors(tabID, extensionStore, commandLog);
    }
  });
}
