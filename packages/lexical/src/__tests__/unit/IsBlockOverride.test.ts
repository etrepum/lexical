/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  createEditor,
  ElementNode,
  INTERNAL_$isBlock,
} from 'lexical';
import {describe, expect, test} from 'vitest';

class InlineOverrideNode extends ElementNode {
  static getType(): string {
    return 'inline-override';
  }
  static clone(node: InlineOverrideNode): InlineOverrideNode {
    return new InlineOverrideNode(node.__key);
  }
  createDOM(): HTMLElement {
    return document.createElement('span');
  }
  updateDOM(): boolean {
    return false;
  }
  isInline(): true {
    return true;
  }
  isBlockOverride(): boolean | null {
    return true;
  }
}

class BlockOverrideNode extends ElementNode {
  static getType(): string {
    return 'block-override';
  }
  static clone(node: BlockOverrideNode): BlockOverrideNode {
    return new BlockOverrideNode(node.__key);
  }
  createDOM(): HTMLElement {
    return document.createElement('div');
  }
  updateDOM(): boolean {
    return false;
  }
  isBlockOverride(): boolean | null {
    return false;
  }
}

describe('ElementNode.isBlockOverride', () => {
  test('is consulted for non-inline elements only', () => {
    const editor = createEditor({
      nodes: [InlineOverrideNode, BlockOverrideNode],
      onError: error => {
        throw error;
      },
    });
    editor.update(
      () => {
        const inline = new InlineOverrideNode().append($createTextNode('i'));
        const block = new BlockOverrideNode().append($createTextNode('b'));
        const paragraph = $createParagraphNode().append(inline);
        $getRoot().clear().append(paragraph, block);
        // An inline element is never a block, whatever its override says.
        expect(INTERNAL_$isBlock(inline)).toBe(false);
        // A non-inline element's override wins over the first-child
        // heuristic (a leading text child would have made it a block).
        expect(INTERNAL_$isBlock(block)).toBe(false);
        expect(INTERNAL_$isBlock(paragraph)).toBe(true);
      },
      {discrete: true},
    );
  });
});
