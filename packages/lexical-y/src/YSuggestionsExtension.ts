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
  createContentAttribute,
  createContentMapFromContentIds,
  createRelativePositionFromTypeIndex,
  diffIdMap,
  DiffRenderer,
  encodeStateAsUpdate,
  intersectUpdateWithContentIds,
  mergeContentMaps,
  type Node as YNode,
  UndoManager,
} from '@y/y';
import {defineExtension, safeCast} from 'lexical';

import {getSuggestionGroups} from './Suggestions';
import {acceptYAttributions} from './YAttributionExtension';
import {YExtension} from './YExtension';

export type {YSuggestion} from './Suggestions';

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
    const groups = () => getSuggestionGroups(binding, base, current());
    const groupByID = (id: string) => {
      const group = groups().find(candidate => candidate.suggestion.id === id);
      invariant(
        group !== undefined,
        '@lexical/y: suggestion is no longer pending',
      );
      return group;
    };
    return {
      ...output,
      /** Accept one dependency group, or the entire proposal when no ID is supplied. */
      accept(id?: string) {
        if (id === undefined) {
          base.transact(() => current().acceptAllChanges());
          return;
        }
        const group = groupByID(id);
        const update = intersectUpdateWithContentIds(
          encodeStateAsUpdate(binding.doc),
          group,
        );
        base.transact(() => {
          applyUpdate(base.doc, update);
          acceptYAttributions(binding, base, group);
        });
      },

      getDelta() {
        const attributions = mergeContentMaps(
          groups().map(group =>
            createContentMapFromContentIds(
              group,
              [createContentAttribute('suggestion', group.suggestion.id)],
              [createContentAttribute('suggestion', group.suggestion.id)],
            ),
          ),
        );
        const view = new DiffRenderer(base.doc, binding.doc, {attributions});
        // Canceled proposal insertions never existed in the base and must not
        // appear as proposed deletions, including after restoring a proposal.
        view.deletes = diffIdMap(view.deletes, view.inserts);
        try {
          return binding.root.toDeltaDeep({renderer: view});
        } finally {
          view.destroy();
        }
      },

      getSuggestions: () => groups().map(group => group.suggestion),

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
      reject(id?: string) {
        if (id === undefined) {
          current().rejectAllChanges();
          return;
        }
        const group = groupByID(id);
        const update = intersectUpdateWithContentIds(
          encodeStateAsUpdate(binding.doc),
          group,
        );
        base.doc.transact(() => {
          applyUpdate(base.doc, update);
          const undo = new UndoManager(base.doc);
          try {
            undo.undoStack.push({...group, meta: new Map()});
            undo.undo();
          } finally {
            undo.destroy();
          }
        });
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
