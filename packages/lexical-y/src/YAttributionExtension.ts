/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {namedSignals} from '@lexical/extension';
import invariant from '@lexical/internal/invariant';
import {
  AttributionsRenderer,
  type ContentMap,
  createContentAttribute,
  createContentMapFromContentIds,
  decodeContentMap,
  encodeContentMap,
  mergeContentMaps,
  Node as YNode,
  type Transaction,
  UndoManager,
} from '@y/y';
import {defineExtension, safeCast} from 'lexical';

import {YExtension} from './YExtension';

export interface YAttributionConfig {
  /** Application-owned metadata root, outside the editor root in the same Doc. */
  storage: YNode | null;
  author: string;
}

/** Persist CRDT operation attribution, independently of ephemeral presence. */
export const YAttributionExtension = defineExtension({
  build(_editor, config, state) {
    const {binding} = state.getDependency(YExtension).output;
    const storage = config.storage;
    invariant(
      storage instanceof YNode && storage.doc === binding.doc,
      '@lexical/y: attribution storage must belong to the binding document',
    );
    for (let parent: YNode | null = storage; parent; parent = parent.parent)
      invariant(
        parent !== binding.root,
        '@lexical/y: attribution storage must be outside the editor root',
      );
    const signals = namedSignals({author: config.author, revision: 0});
    return {
      ...signals,
      getAttributions(): ContentMap {
        return mergeContentMaps(
          Object.values(storage.getAttrs()).map(value => {
            invariant(
              value instanceof Uint8Array,
              '@lexical/y: invalid attribution record',
            );
            return decodeContentMap(value);
          }),
        );
      },
      getDelta() {
        const renderer = new AttributionsRenderer(this.getAttributions());
        try {
          return binding.root.toDeltaDeep({renderer});
        } finally {
          renderer.destroy();
        }
      },
    };
  },
  config: safeCast<YAttributionConfig>({author: 'Anonymous', storage: null}),
  dependencies: [YExtension],
  name: '@lexical/y/Attribution',
  register(_editor, config, state) {
    const {binding} = state.getDependency(YExtension).output;
    const storage = config.storage!;
    const output = state.getOutput();
    const origin = {};
    const record = (transaction: Transaction) => {
      if (
        (transaction.origin === binding ||
          (transaction.origin instanceof UndoManager &&
            transaction.origin.trackedOrigins.has(binding))) &&
        (transaction.insertSet.clients.size ||
          transaction.deleteSet.clients.size)
      ) {
        const author = output.author.peek();
        const content = createContentMapFromContentIds(
          {deletes: transaction.deleteSet, inserts: transaction.insertSet},
          [createContentAttribute('insert', author)],
          [createContentAttribute('delete', author)],
        );
        // The clock includes all locally inserted items, including prior metadata.
        const key = `${binding.doc.clientID}:${binding.doc.store.getClock(binding.doc.clientID)}`;
        binding.doc.transact(
          () => storage.setAttr(key, encodeContentMap(content)),
          origin,
        );
      }
      if (
        transaction.origin !== origin ||
        transaction.changedParentTypes.has(storage)
      )
        output.revision.value++;
    };
    binding.doc.on('afterTransaction', record);
    return () => binding.doc.off('afterTransaction', record);
  },
});
