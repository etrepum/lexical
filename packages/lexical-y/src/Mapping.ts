/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {Node as YNode} from '@y/y';
import type {LexicalNode, NodeKey, TextNode} from 'lexical';

export type Content = LexicalNode | TextNode[];

/** BindingV2's one-to-one elements and one-to-many text-run mapping. */
export class Mapping {
  readonly types = new Map<NodeKey, YNode>();
  readonly nodes = new Map<YNode, Content>();

  set(type: YNode, content: Content): void {
    this.delete(type);
    this.nodes.set(type, content);
    for (const node of Array.isArray(content) ? content : [content]) {
      this.types.set(node.getKey(), type);
    }
  }

  delete(type: YNode): void {
    const content = this.nodes.get(type);
    if (content) {
      for (const node of Array.isArray(content) ? content : [content]) {
        if (this.types.get(node.getKey()) === type)
          this.types.delete(node.getKey());
      }
    }
    this.nodes.delete(type);
  }

  clear(): void {
    this.types.clear();
    this.nodes.clear();
  }
}
