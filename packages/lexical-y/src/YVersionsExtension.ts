/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import invariant from '@lexical/internal/invariant';
import {
  applyUpdate,
  createAbsolutePositionFromRelativePosition,
  createRelativePositionFromTypeIndex,
  DiffRenderer,
  Doc,
  encodeStateAsUpdate,
  type Node as YNode,
  type RelativePosition,
} from '@y/y';
import {defineExtension} from 'lexical';

import {YExtension} from './YExtension';

/** An independent encoded checkpoint, including identity and retained content. */
export interface YCheckpoint {
  update: Uint8Array;
  root: RelativePosition;
}

export interface YDocumentView {
  doc: Doc;
  root: YNode;
  dispose(): void;
}

/** Restore into a separate document. The caller owns the returned view. */
export function createYDocumentView(
  checkpoint: YCheckpoint,
  suggestion = false,
): YDocumentView {
  const doc = new Doc({gc: false, isSuggestionDoc: suggestion});
  try {
    applyUpdate(doc, checkpoint.update);
    const position = createAbsolutePositionFromRelativePosition(
      checkpoint.root,
      doc,
    );
    invariant(position !== null, '@lexical/y: checkpoint root is unavailable');
    return {dispose: () => doc.destroy(), doc, root: position.type};
  } catch (error) {
    doc.destroy();
    throw error;
  }
}

/** Compare checkpoints without installing a renderer on either live document. */
export function compareYCheckpoints(before: YCheckpoint, after: YCheckpoint) {
  const previous = createYDocumentView(before);
  let next: YDocumentView | undefined;
  try {
    invariant(
      JSON.stringify({tname: before.root.tname, type: before.root.type}) ===
        JSON.stringify({tname: after.root.tname, type: after.root.type}),
      '@lexical/y: comparison checkpoints must describe the same root',
    );
    next = createYDocumentView(after);
    const current = next;
    const renderer = new DiffRenderer(previous.doc, current.doc);
    return {
      after: current,
      before: previous,
      dispose() {
        renderer.destroy();
        previous.dispose();
        current.dispose();
      },
      getDelta: () => current.root.toDeltaDeep({renderer}),
      renderer,
    };
  } catch (error) {
    previous.dispose();
    if (next) next.dispose();
    throw error;
  }
}

/** Checkpoints are application-owned; capturing never changes the live document. */
export const YVersionsExtension = defineExtension({
  build(_editor, _config, state) {
    const {binding} = state.getDependency(YExtension).output;
    return {
      capture: (): YCheckpoint => ({
        root: createRelativePositionFromTypeIndex(
          binding.root,
          binding.root.length,
        ),
        update: encodeStateAsUpdate(binding.doc),
      }),
    };
  },
  dependencies: [YExtension],
  name: '@lexical/y/Versions',
});
