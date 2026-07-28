/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/** @jsxImportSource octane */

import {
  getExtensionDependencyFromEditor,
  WatchEditableExtension,
} from '@lexical/extension';
import {
  BlockSchema,
  CoreImportExtension,
  defineImportRule,
  DOMImportExtension,
  sel,
} from '@lexical/html';
import {mergeRegister} from '@lexical/utils';
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSlot,
  $isParagraphNode,
  $setSlot,
  COMMAND_PRIORITY_EDITOR,
  configExtension,
  createCommand,
  defineExtension,
  type LexicalCommand,
  type LexicalEditor,
  type NodeKey,
} from 'lexical';
import {createRoot, type Root, useState} from 'octane';

import {
  type ReadableSignal,
  useEditorRead,
  useSignal,
  useSlotRef,
} from './octane-bridge';
import {
  $createReviewCardNode,
  $isReviewCardNode,
  ReviewCardNode,
} from './ReviewCardNode';
import {
  $createSlotContainerNode,
  SlotContainerNode,
} from './slot-host/SlotContainerNode';
import {
  $insertSlotHostAtRoot,
  $isSlotHostTextEmpty,
  registerSlotHostArrowEscape,
  registerSlotHostBackspace,
} from './slot-host/slotHostEscape';
import {$appendInline} from './slot-host/slotImport';

/** Insert a fresh ReviewCard at the current selection's nearest root. */
export const INSERT_REVIEW_CARD_COMMAND: LexicalCommand<void> =
  /* @__PURE__ */ createCommand('INSERT_REVIEW_CARD_COMMAND');

const STARS = [1, 2, 3, 4, 5];

interface ChromeProps {
  editor: LexicalEditor;
  nodeKey: NodeKey;
  editable: ReadableSignal<boolean>;
}

/**
 * The interactive part — an Octane component whose clicks write the rating back
 * to the model as NodeState, so the value participates in undo/redo, copy/paste
 * and JSON like any other model state. The committed rating is mirrored into
 * Octane through `useEditorRead`, and editability through `useSignal`.
 */
function ReviewStars({editor, nodeKey, editable}: ChromeProps) {
  const rating = useEditorRead(editor, () => {
    const node = $getNodeByKey(nodeKey);
    return $isReviewCardNode(node) ? node.getRating() : 0;
  });
  const isEditable = useSignal(editable);
  const [hover, setHover] = useState(0);
  const setStars = (value: number) =>
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isReviewCardNode(node)) {
        // Clicking the current top star clears the rating back to zero.
        node.setRating(value === rating ? 0 : value);
      }
    });
  const shown = (isEditable && hover) || rating;
  return (
    <div
      className="octane-review-stars"
      role="group"
      aria-label={`Rating: ${rating} of 5`}
      onMouseLeave={() => setHover(0)}>
      {STARS.map(value => (
        <button
          key={value}
          type="button"
          className={
            value <= shown
              ? 'octane-review-star octane-review-star-on'
              : 'octane-review-star'
          }
          aria-pressed={value <= rating}
          aria-label={`${value} star${value === 1 ? '' : 's'}`}
          disabled={!isEditable}
          onMouseEnter={() => setHover(value)}
          onClick={() => {
            if (isEditable) {
              setStars(value);
            }
          }}>
          ★
        </button>
      ))}
    </div>
  );
}

/**
 * The full chrome around a ReviewCard: the star widget plus the two frames the
 * `quote` and `attribution` slots mount into. `useSlotRef` moves each slot's
 * (hidden) container out of the host DOM and into these frames, revealing it —
 * the same editable regions the host editor owns, styled by this component.
 */
function ReviewCardChrome({editor, nodeKey, editable}: ChromeProps) {
  const quoteRef = useSlotRef<HTMLDivElement>(editor, nodeKey, 'quote');
  const attributionRef = useSlotRef<HTMLDivElement>(
    editor,
    nodeKey,
    'attribution',
  );
  return (
    <div className="octane-review-chrome">
      <div className="octane-review-head">
        <span className="octane-review-quote-mark" aria-hidden="true">
          {'“'}
        </span>
        <ReviewStars editor={editor} nodeKey={nodeKey} editable={editable} />
      </div>
      <div className="octane-review-body" ref={quoteRef} />
      <div className="octane-review-attribution">
        <span className="octane-review-dash" aria-hidden="true">
          {'—'}
        </span>
        <div className="octane-review-attribution-field" ref={attributionRef} />
      </div>
    </div>
  );
}

/**
 * Reconstruct a ReviewCard from its exported HTML (see
 * `ReviewCardNode.exportDOM`): a `<div class="octane-review-card" data-rating>`
 * wrapping a `data-lexical-slot="quote"` block region and a single-line
 * `data-lexical-slot="attribution"`. The `quote` imports as blocks into a
 * shadow-root container; the `attribution` flattens to its inline projection.
 */
const ReviewCardImportRule = /* @__PURE__ */ defineImportRule({
  $import: (ctx, el) => {
    const node = $createReviewCardNode();
    const rating = Number(el.getAttribute('data-rating'));
    if (Number.isFinite(rating)) {
      node.setRating(Math.max(0, Math.min(5, Math.round(rating))));
    }
    for (const domChild of Array.from(el.children)) {
      const slotName = domChild.getAttribute('data-lexical-slot');
      if (slotName === 'quote') {
        const container = $createSlotContainerNode();
        container.append(
          ...ctx.$importChildren(domChild, {schema: BlockSchema}),
        );
        $setSlot(node, 'quote', container);
      } else if (slotName === 'attribution') {
        const prev = $getSlot(node, 'attribution');
        const line = $isParagraphNode(prev) ? prev : $createParagraphNode();
        $appendInline(line, ctx.$importChildren(domChild));
        $setSlot(node, 'attribution', line);
      }
    }
    return [node];
  },
  match: sel.tag('div').classAll('octane-review-card'),
  name: '@lexical/examples/octane/review-card',
});

/**
 * The ReviewCard model + behavior: registers the node, its insert command, its
 * slot-host editing helpers (arrow escape / backspace-to-delete), and its HTML
 * import rule. It is framework-agnostic — the Octane rendering lives in the
 * separate {@link OctaneReviewCardExtension} that depends on it, mirroring the
 * playground's split between a node extension and its React-render extension.
 */
export const ReviewCardExtension = /* @__PURE__ */ defineExtension({
  dependencies: [
    // CoreImportExtension supplies the paragraph/text rules the quote/attribution
    // imports rely on and orders this host rule ahead of the generic block rules.
    CoreImportExtension,
    /* @__PURE__ */ configExtension(DOMImportExtension, {
      rules: [ReviewCardImportRule],
    }),
  ],
  name: '@lexical/examples/octane/ReviewCard',
  // SlotContainerNode is the multi-block value of the `quote` slot, so it must
  // be registered alongside the host.
  nodes: [ReviewCardNode, SlotContainerNode],
  register: editor =>
    mergeRegister(
      editor.registerCommand(
        INSERT_REVIEW_CARD_COMMAND,
        () => {
          $insertSlotHostAtRoot($createReviewCardNode());
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      // ArrowUp/Down step in and out of the slots' shadow-root boundaries.
      registerSlotHostArrowEscape(editor, $isReviewCardNode),
      // Backspace at the start of an empty card deletes it (the rating is not
      // counted as content, matching the playground Review).
      registerSlotHostBackspace(
        editor,
        $isReviewCardNode,
        $isSlotHostTextEmpty,
      ),
    ),
});

/**
 * The Octane rendering for every ReviewCard: one Octane root per live card,
 * mounted into the card's (non-editable) host DOM and unmounted when the card
 * is destroyed. This is the whole "render part of the editor with Octane"
 * story — the chrome, the interactive rating and the slot frames are all
 * Octane.
 *
 * Rendering is driven by a **mutation listener**, the framework-agnostic way to
 * bind an external renderer to a node type (it's how `HorizontalRuleExtension`
 * renders its vanilla decorator). `registerDecoratorListener` is deliberately
 * avoided: it exists only to feed React's `useDecorators` and has no place in a
 * new, framework-neutral app. A `DOMRenderExtension` override could replace the
 * host box `createDOM` builds if it needed custom structure, but here an empty
 * box is all the Octane tree needs to mount into.
 */
export const OctaneReviewCardExtension = /* @__PURE__ */ defineExtension({
  dependencies: [ReviewCardExtension, WatchEditableExtension],
  name: '@lexical/examples/octane/OctaneReviewCard',
  register: editor => {
    const editable = getExtensionDependencyFromEditor(
      editor,
      WatchEditableExtension,
    ).output;
    // Keys of the live cards, and the Octane root + inner element each is
    // rendered into. The inner element keeps Octane's initial container-clear
    // off of the slot placeholders the reconciler parks in the host DOM.
    const liveKeys = new Set<NodeKey>();
    const mounts = new Map<
      NodeKey,
      {host: HTMLElement; container: HTMLElement; root: Root}
    >();

    const unmountKey = (key: NodeKey) => {
      const entry = mounts.get(key);
      if (entry) {
        entry.root.unmount();
        entry.container.remove();
        mounts.delete(key);
      }
    };

    const mountKey = (key: NodeKey) => {
      const host = editor.getElementByKey(key);
      if (host === null) {
        // The node's DOM isn't attached yet (e.g. a card seeded before the
        // root element was set); the root listener retries once it is.
        return;
      }
      const entry = mounts.get(key);
      if (entry) {
        if (entry.host === host) {
          return; // Already mounted on the current host DOM.
        }
        unmountKey(key); // Host element was recreated — remount into the new one.
      }
      const container = document.createElement('div');
      container.className = 'octane-review-root';
      host.appendChild(container);
      const root = createRoot(container);
      root.render(
        <ReviewCardChrome editor={editor} nodeKey={key} editable={editable} />,
      );
      mounts.set(key, {container, host, root});
    };

    return mergeRegister(
      editor.registerMutationListener(
        ReviewCardNode,
        nodes => {
          for (const [key, mutation] of nodes) {
            if (mutation === 'destroyed') {
              liveKeys.delete(key);
              unmountKey(key);
            } else {
              liveKeys.add(key);
              mountKey(key);
            }
          }
        },
        // Fire for cards already present when the editor is built (the seeded
        // sample), not just for later edits.
        {skipInitialization: false},
      ),
      // `setRootElement` commits pending updates (attaching node DOM) before it
      // fires root listeners, so `getElementByKey` resolves here. This mounts
      // cards whose host DOM only became available when the editor attached,
      // and tears every root down when it detaches (e.g. on dispose).
      editor.registerRootListener(rootElement => {
        if (rootElement === null) {
          for (const key of [...mounts.keys()]) {
            unmountKey(key);
          }
        } else {
          for (const key of liveKeys) {
            mountKey(key);
          }
        }
      }),
      () => {
        for (const key of [...mounts.keys()]) {
          unmountKey(key);
        }
      },
    );
  },
});
