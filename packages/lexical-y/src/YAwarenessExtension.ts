/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {effect, namedSignals} from '@lexical/extension';
import invariant from '@lexical/internal/invariant';
import {
  BLUR_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  defineExtension,
  FOCUS_COMMAND,
  mergeRegister,
  safeCast,
} from 'lexical';

import {equalValue} from './Schema';
import {$getYSelection, isYSelection, type YSelection} from './Selection';
import {YExtension} from './YExtension';

/** Presence can be supplied independently of the document transport. */
export interface YAwareness {
  clientID: number;
  getLocalState(): Record<string, unknown> | null;
  getStates(): Map<number, Record<string, unknown>>;
  setLocalStateField(field: string, value: unknown): void;
  on(event: 'change', listener: () => void): unknown;
  off(event: 'change', listener: () => void): unknown;
}

export interface YUser {
  name: string;
  color: string;
  textColor: string;
}

export interface YPresence {
  user: YUser;
  selection: YSelection | null;
}

export interface YAwarenessConfig {
  awareness: YAwareness | null;
  /** Use a distinct field for each editor sharing one Awareness instance. */
  field: string;
  user: YUser;
}

function isPresence(value: unknown): value is YPresence {
  if (!value || typeof value !== 'object') return false;
  const p = value as YPresence;
  return (
    !!p.user &&
    typeof p.user.name === 'string' &&
    typeof p.user.color === 'string' &&
    typeof p.user.textColor === 'string' &&
    (p.selection === null || isYSelection(p.selection))
  );
}

/** Publishes relative selections and exposes peers without requiring a DOM. */
export const YAwarenessExtension = defineExtension({
  build(_editor, config) {
    return namedSignals({
      peers: new Map<number, YPresence>(),
      user: config.user,
    });
  },
  config: safeCast<YAwarenessConfig>({
    awareness: null,
    field: 'lexical',
    user: {color: '#2563eb', name: 'Anonymous', textColor: '#fff'},
  }),
  dependencies: [YExtension],
  name: '@lexical/y/Awareness',
  register(editor, config, state) {
    const awareness = config.awareness;
    invariant(awareness !== null, '@lexical/y: configure awareness');
    const {binding} = state.getDependency(YExtension).output;
    const {user, peers} = state.getOutput();
    let focused = true;
    const publish = (currentUser = user.peek()) =>
      editor.read('latest', () => {
        const value: YPresence = {
          selection: focused ? $getYSelection(binding) : null,
          user: currentUser,
        };
        const localState = awareness.getLocalState();
        if (!equalValue(localState && localState[config.field], value))
          awareness.setLocalStateField(config.field, value);
      });
    const refresh = () => {
      const next = new Map<number, YPresence>();
      awareness.getStates().forEach((value, id) => {
        const presence = value[config.field];
        if (id !== awareness.clientID && isPresence(presence))
          next.set(id, presence);
      });
      peers.value = next;
    };
    const clear = () => {
      awareness.setLocalStateField(config.field, null);
    };
    awareness.on('change', refresh);
    const unregister = mergeRegister(
      editor.registerUpdateListener(() => publish()),
      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          focused = true;
          publish();
          return false;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          focused = false;
          clear();
          return false;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      effect(() => publish(user.value)),
    );
    refresh();
    return () => {
      unregister();
      awareness.off('change', refresh);
      clear();
      peers.value = new Map();
    };
  },
});
