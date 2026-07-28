/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$appendNodeToHTML} from '@lexical/html';
import {
  $create,
  $createParagraphNode,
  $createTextNode,
  $getSlot,
  $getSlotNames,
  $getState,
  $setSlot,
  $setState,
  createState,
  DecoratorNode,
  type DOMExportOutput,
  type LexicalEditor,
  type LexicalNode,
  type NodeStateVersion,
  type StateConfigValue,
  type StateValueOrUpdater,
} from 'lexical';

import {$createSlotContainerNode} from './slot-host/SlotContainerNode';

/**
 * The star rating (0–5), persisted as NodeState rather than a bespoke
 * serialized field, so it rides copy/paste, undo, collab and JSON for free.
 * `parse()` doubles as the default (0) and the clamp for untrusted input.
 */
const ratingState = /* @__PURE__ */ createState('rating', {
  parse: (v): number =>
    typeof v === 'number' && v >= 0 && v <= 5 ? Math.round(v) : 0,
});

/**
 * `ReviewCardNode` is the centerpiece of the example: a single node that
 * exercises three of the newest Lexical model APIs at once.
 *
 * - **`$config()`** declares the node's type, its two named **slots**
 *   (`quote` and `attribution`) and its **NodeState** (`rating`) in one place.
 * - **Named slots** replace what used to require nested editors: `quote` is a
 *   multi-block region (a shadow-root `SlotContainerNode`) and `attribution`
 *   is a single-line field (a bare paragraph). Both are edited by the *host*
 *   editor — every extension (rich text, links, history…) applies inside them
 *   — yet selection, history and serialization stay isolated per region.
 * - The node is a **`DecoratorNode`**, so its visible chrome (the star rating
 *   widget plus the frames the two slots mount into) is rendered by an outside
 *   framework. Here that framework is **Octane** — see `ReviewCardExtension`.
 *
 * The DOM produced by `createDOM` is just an empty, non-editable host box; the
 * Octane chrome is mounted into it and reveals the slot containers the
 * reconciler parks inside (hidden) on every commit.
 */
export class ReviewCardNode extends DecoratorNode<string> {
  $config() {
    return this.config('octane-review-card', {
      extends: DecoratorNode,
      // Declared order is canonical, so `quote` renders/serializes before
      // `attribution` regardless of code-unit ordering.
      slots: ['quote', 'attribution'],
      stateConfigs: [{flat: true, stateConfig: ratingState}],
    });
  }

  getRating(version?: NodeStateVersion): StateConfigValue<typeof ratingState> {
    return $getState(this, ratingState, version);
  }

  setRating(valueOrUpdater: StateValueOrUpdater<typeof ratingState>): this {
    return $setState(this, ratingState, valueOrUpdater);
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'octane-review-card';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): false {
    return false;
  }

  /**
   * The rendering is owned by Octane (mounted per node key by
   * `ReviewCardExtension`), not by a decorator framework wired into the
   * reconciler, so the value here is just the node key that keys that mount.
   */
  decorate(): string {
    return this.__key;
  }

  /**
   * Round-trip through HTML (copy/paste, `getHTML`). The slots ride a separate
   * Map, so the exporter never descends into them on its own — emit each into a
   * `data-lexical-slot` wrapper the import rule maps back with `$setSlot`, and
   * carry the rating as a data attribute (it is NodeState, not a child).
   */
  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const host = document.createElement('div');
    host.className = 'octane-review-card';
    host.setAttribute('data-rating', String(this.getRating()));
    for (const name of $getSlotNames(this)) {
      const slot = $getSlot(this, name);
      if (slot) {
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-lexical-slot', name);
        $appendNodeToHTML(editor, slot, wrapper);
        host.append(wrapper);
      }
    }
    return {element: host};
  }
}

export function $createReviewCardNode(): ReviewCardNode {
  const node = $create(ReviewCardNode);
  // `quote` is legitimately multi-block, so its value is a shadow-root
  // container; `attribution` is a single-line field, so a bare paragraph is the
  // slot value directly. The placeholder hints are CSS, so the model carries no
  // placeholder TextNodes.
  $setSlot(
    node,
    'quote',
    $createSlotContainerNode().append($createParagraphNode()),
  );
  $setSlot(node, 'attribution', $createParagraphNode());
  return node;
}

/**
 * A seeded ReviewCard with sample content, used to prepopulate the demo.
 */
export function $createSampleReviewCardNode(): ReviewCardNode {
  const node = $create(ReviewCardNode);
  node.setRating(5);
  $setSlot(
    node,
    'quote',
    $createSlotContainerNode().append(
      $createParagraphNode().append(
        $createTextNode(
          'Slots gave us per-region isolation without the nested-editor tax — ' +
            'and Octane renders the chrome around them.',
        ),
      ),
    ),
  );
  $setSlot(
    node,
    'attribution',
    $createParagraphNode().append($createTextNode('A very happy adopter')),
  );
  return node;
}

export function $isReviewCardNode(
  node: LexicalNode | null | undefined,
): node is ReviewCardNode {
  return node instanceof ReviewCardNode;
}
