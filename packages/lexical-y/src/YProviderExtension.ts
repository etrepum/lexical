/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {effect, namedSignals} from '@lexical/extension';
import invariant from '@lexical/internal/invariant';
import {defineExtension, safeCast} from 'lexical';

import {YExtension} from './YExtension';

/** The optional loading lifecycle, independent of awareness and the document. */
export interface YProvider {
  readonly synced: boolean;
  on(event: 'sync', listener: (synced: boolean) => void): unknown;
  off(event: 'sync', listener: (synced: boolean) => void): unknown;
}

export interface YProviderConfig {
  provider: YProvider | null;
}

/** Observe an existing provider. Its connection and destruction remain application-owned. */
export const YProviderExtension = defineExtension({
  build(_editor, config, state) {
    invariant(config.provider !== null, '@lexical/y: configure a provider');
    state.getDependency(YExtension).output.ready.value = config.provider.synced;
    return namedSignals({
      provider: config.provider,
      synced: config.provider.synced,
    });
  },
  config: safeCast<YProviderConfig>({provider: null}),
  dependencies: [YExtension],
  name: '@lexical/y/Provider',
  register(_editor, _config, state) {
    const {ready} = state.getDependency(YExtension).output;
    const {provider: currentProvider, synced} = state.getOutput();
    return effect(() => {
      const provider = currentProvider.value;
      const onSync = (value: boolean) => {
        synced.value = value;
        ready.value = value;
      };
      if (!provider) {
        onSync(false);
        return;
      }
      provider.on('sync', onSync);
      onSync(provider.synced);
      return () => {
        provider.off('sync', onSync);
      };
    });
  },
});
