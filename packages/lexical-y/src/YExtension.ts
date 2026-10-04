/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {HistoryExtension} from '@lexical/history';

import {effect, namedSignals} from '@lexical/extension';
import invariant from '@lexical/internal/invariant';
import {Node as YNode} from '@y/y';
import {declarePeerDependency, defineExtension, safeCast} from 'lexical';

import {assertSchema} from './Schema';
import {YBinding} from './YBinding';

export interface YConfig {
  /** An application-owned, integrated root. May be nested or in a subdocument. */
  root: YNode | null;
  /** Application schema identifier. Different identifiers cannot edit the same root. */
  schemaId: string;
  /** Enable synchronization. Re-enabling reads the shared document. */
  disabled: boolean;
  /** Whether initial loading has finished. Gates optional bootstrap. */
  ready: boolean;
  /** Initialize an empty shared root after it is ready. Elect one initializer. */
  $initialState: (() => void) | null;
}

/** Schema-based Yjs 14 binding. No provider, awareness, or React is required. */
export const YExtension = defineExtension({
  $initialEditorState: null,
  build(editor, config) {
    invariant(
      config.root instanceof YNode,
      '@lexical/y: configure an integrated Y.Node root',
    );
    for (const {klass} of editor._nodes.values()) {
      if (klass.getType() !== 'artificial') assertSchema(klass);
    }
    return {
      binding: new YBinding(editor, config.root, config.schemaId),
      ...namedSignals({disabled: config.disabled, ready: config.ready}),
    };
  },
  config: safeCast<YConfig>({
    $initialState: null,
    disabled: false,
    ready: true,
    root: null,
    schemaId: 'default',
  }),
  name: '@lexical/y',
  peerDependencies: [
    declarePeerDependency<typeof HistoryExtension>('@lexical/history/History', {
      disabled: true,
    }),
  ],
  register(_editor, config, state) {
    const {binding, disabled, ready} = state.getOutput();
    let initialized = false;
    const unregister = effect(() =>
      disabled.value ? undefined : binding.register(),
    );
    const stopBootstrap = effect(() => {
      if (!disabled.value && ready.value && !initialized) {
        initialized = true;
        if (config.$initialState) binding.bootstrap(config.$initialState);
      }
    });
    return () => {
      stopBootstrap();
      unregister();
    };
  },
});
