/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {type ElementNode, type LexicalNode} from 'lexical';

export function $wrapContinuousInlinesInPlace(
  nodes: LexicalNode[],
  $createWrapperFn: () => ElementNode,
): void {
  let j = 0;
  for (let i = 0, wrapper: undefined | ElementNode; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node.isInline()) {
      wrapper = undefined;
      nodes[j++] = node;
    } else {
      if (!wrapper) {
        nodes[j++] = wrapper = $createWrapperFn();
      }
      wrapper.append(node);
    }
  }
  nodes.length = j;
}
