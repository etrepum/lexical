/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type {YBinding} from './YBinding';

import {namedSignals} from '@lexical/extension';
import invariant from '@lexical/internal/invariant';
import {
  applyUpdate,
  createRelativePositionFromTypeIndex,
  DiffRenderer,
  encodeStateAsUpdate,
  type Node as YNode,
} from '@y/y';
import {defineExtension, safeCast} from 'lexical';

import {YExtension} from './YExtension';

export interface YSuggestionsConfig {
  /** The accepted document's binding. The extension's own binding edits a fork. */
  base: YBinding | null;
}

function rootIdentity(root: YNode): string {
  const {type, tname} = createRelativePositionFromTypeIndex(root, root.length);
  return JSON.stringify({tname, type});
}

/** Review one proposal document. Transport/persistence for both docs stays external. */
export const YSuggestionsExtension = defineExtension({
  build(_editor, config, state) {
    const {binding} = state.getDependency(YExtension).output;
    const base = config.base;
    invariant(
      base !== null && base.doc !== binding.doc,
      '@lexical/y: suggestions require a separate base binding',
    );
    invariant(
      rootIdentity(base.root) === rootIdentity(binding.root),
      '@lexical/y: proposal root must originate from the base document',
    );
    invariant(
      binding.doc.isSuggestionDoc && !binding.doc.gc,
      '@lexical/y: use a suggestion document with gc: false',
    );
    const output = namedSignals({revision: 0});
    let renderer: DiffRenderer | null = null;
    const current = () => {
      invariant(
        renderer !== null,
        '@lexical/y: suggestion extension is not registered',
      );
      return renderer;
    };
    return {
      ...output,
      /** Accept the entire proposal atomically, including structural dependencies. */
      accept() {
        base.transact(() => current().acceptAllChanges());
      },

      getDelta: () => binding.root.toDeltaDeep({renderer: current()}),

      /** @internal */
      register() {
        // Resumed proposals can predate accepted edits made while they were offline.
        applyUpdate(binding.doc, encodeStateAsUpdate(base.doc));
        renderer = new DiffRenderer(base.doc, binding.doc);
        const refresh = () => {
          output.revision.value++;
        };
        base.doc.on('afterTransaction', refresh);
        binding.doc.on('afterTransaction', refresh);
        return () => {
          base.doc.off('afterTransaction', refresh);
          binding.doc.off('afterTransaction', refresh);
          current().destroy();
          renderer = null;
        };
      },

      /** Reject through Yjs so concurrent base changes remain present in the fork. */
      reject() {
        current().rejectAllChanges();
      },
    };
  },
  config: safeCast<YSuggestionsConfig>({base: null}),
  dependencies: [YExtension],
  name: '@lexical/y/Suggestions',
  register(_editor, _config, state) {
    return state.getOutput().register();
  },
});
