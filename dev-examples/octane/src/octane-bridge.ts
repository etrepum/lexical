/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/** @jsxImportSource octane */

// The bridge between Lexical's reactivity and Octane's. Lexical extensions
// expose state as `@preact/signals-core` signals, and the editor exposes its
// committed content through `registerUpdateListener`. Octane speaks React's
// `useSyncExternalStore`, so a couple of tiny adapters are all it takes to make
// either one drive an Octane component — no framework-specific plumbing in the
// extensions themselves.
//
// This module uses Octane hooks, so it opts into the Octane compiler with the
// `@jsxImportSource octane` pragma above.

import {type ReadableSignal} from '@lexical/extension';
import {
  type LexicalEditor,
  mountSlotContainer,
  type NodeKey,
  unmountSlotContainer,
} from 'lexical';
import {useCallback, useSyncExternalStore} from 'octane';

/**
 * A ref callback in the React-19 shape Octane also supports: it may return a
 * cleanup function that runs when the element detaches (or the ref changes).
 */
export type SlotRefCallback<T> = (element: T | null) => (() => void) | void;

/**
 * Subscribe an Octane component to a Lexical/preact signal. `subscribe` fires
 * once immediately and again on every change; `peek()` reads the current value
 * without creating a dependency, which is exactly the `getSnapshot` contract.
 */
export function useSignal<T>(signal: ReadableSignal<T>): T {
  return useSyncExternalStore(
    useCallback(onChange => signal.subscribe(() => onChange()), [signal]),
    () => signal.peek(),
  );
}

/**
 * Subscribe an Octane component to a value derived from the editor's committed
 * state. `read` runs against the latest reconciled state after every commit;
 * return a primitive so `useSyncExternalStore`'s snapshot stays stable between
 * commits. The `'latest'` mode is important: a bare `editor.read()` force-flushes
 * pending updates, which must never happen from a render-phase `getSnapshot`.
 */
export function useEditorRead<T>(editor: LexicalEditor, read: () => T): T {
  return useSyncExternalStore(
    useCallback(
      onChange => editor.registerUpdateListener(() => onChange()),
      [editor],
    ),
    () => editor.read('latest', read),
  );
}

/**
 * Octane port of `@lexical/react`'s `useLexicalSlotRef`. The reconciler renders
 * every slot subtree synchronously into a hidden placeholder container; attach
 * the returned ref to the element where the slot should live and this moves the
 * container there (revealing it) after each render, parking it back hidden on
 * cleanup. It is idempotent, so a slot added or recreated after the first
 * render is picked up with no extra wiring.
 */
export function useSlotRef<T extends HTMLElement = HTMLElement>(
  editor: LexicalEditor,
  nodeKey: NodeKey,
  slotName: string,
): SlotRefCallback<T> {
  return useCallback<SlotRefCallback<T>>(
    target => {
      if (target) {
        const container = mountSlotContainer(editor, nodeKey, slotName, target);
        if (container) {
          return unmountSlotContainer.bind(null, editor, nodeKey, container);
        }
      }
    },
    [editor, nodeKey, slotName],
  );
}
