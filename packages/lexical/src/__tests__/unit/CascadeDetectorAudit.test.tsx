/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Audit harness for facebook/lexical#8635 (not part of the PR itself).
// Run on both the PR base and head to compare infinite-update-loop detector
// behavior:
//
//   pnpm exec vitest --project unit --no-watch \
//     packages/lexical/src/__tests__/unit/CascadeDetectorAudit.test.tsx
//
// Observed results (2026-06-10):
//   PR base 90cca2b: A fails (1 false-positive warning), B passes, C passes
//   PR head f902cf4: A passes, B passes, C fails (runaway goes undetected)
//
// A failing on base demonstrates the over-firing bug the PR fixes; A and B
// passing on head shows the fix works without losing canonical detection.
// C failing on head is a detection regression introduced by the
// command-dispatch reset in triggerCommandListeners: any command dispatched
// while editor._updating === false mid-cascade (mutation listeners run that
// way during $commitPendingUpdates, as does the internal
// SELECTION_CHANGE_COMMAND dispatch) resets the budget every cycle, so the
// loop never trips.

import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  createCommand,
  createEditor,
  LexicalEditor,
  TextNode,
} from 'lexical';
import {describe, expect, it} from 'vitest';

function makeEditor(warnings: Error[]): LexicalEditor {
  const editor = createEditor({
    namespace: 'cascade-audit',
    nodes: [],
    onError: error => {
      throw error;
    },
    onWarn: error => {
      warnings.push(error);
    },
  });
  const root = document.createElement('div');
  root.contentEditable = 'true';
  document.body.appendChild(root);
  editor.setRootElement(root);
  return editor;
}

const macrotask = () => new Promise<void>(resolve => setTimeout(resolve, 0));

async function microtasks(n: number): Promise<void> {
  for (let i = 0; i < n; i++) {
    await Promise.resolve();
  }
}

describe('cascade detector audit', () => {
  it('A: bounded re-enqueueing listener across 150 macrotask-separated actions', async () => {
    const warnings: Error[] = [];
    const editor = makeEditor(warnings);
    // Bounded: enqueues one no-op update per commit. The no-op produces no
    // commit (shouldUpdate === false), so on the PR base the queue is never
    // observed empty by $triggerEnqueuedUpdates and _cascadeCount leaks +1
    // per action.
    const unregister = editor.registerUpdateListener(() => {
      editor.update(() => {
        // no-op
      });
    });
    for (let i = 0; i < 150; i++) {
      editor.update(() => {
        $getRoot().markDirty();
      });
      // Each user action yields to the event loop, like real typing.
      await macrotask();
    }
    unregister();
    // Expected: head = 0 warnings, base = 1 warning (over-fire at ~action 100)
    expect(warnings).toHaveLength(0);
  });

  it('B: genuine synchronous runaway is still detected', async () => {
    const warnings: Error[] = [];
    const editor = makeEditor(warnings);
    const unregister = editor.registerUpdateListener(() => {
      editor.update(() => {
        $getRoot().markDirty();
      });
    });
    editor.update(() => {
      $getRoot().markDirty();
    });
    // Drain only microtasks: a genuine runaway never yields to the event
    // loop, so the macrotask reset must not save it.
    await microtasks(600);
    unregister();
    await macrotask();
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('C: runaway whose cycle dispatches a command from a mutation listener', async () => {
    const warnings: Error[] = [];
    const editor = makeEditor(warnings);
    const AUDIT_COMMAND = createCommand<void>('AUDIT_COMMAND');
    let textKey = '';
    editor.update(
      () => {
        const text = $createTextNode('a');
        $getRoot().clear().append($createParagraphNode().append(text));
        textKey = text.getKey();
      },
      {discrete: true},
    );
    await macrotask();
    // Mutation listeners run during $commitPendingUpdates with
    // _updating === false, so this dispatch hits the command-reset path on
    // the PR head on every cycle of the runaway.
    const unregisterMutation = editor.registerMutationListener(TextNode, () => {
      editor.dispatchCommand(AUDIT_COMMAND, undefined);
    });
    const unregisterUpdate = editor.registerUpdateListener(() => {
      editor.update(() => {
        const text = $getNodeByKey<TextNode>(textKey);
        if (text !== null) {
          text.setTextContent(text.getTextContent() === 'a' ? 'b' : 'a');
        }
      });
    });
    editor.update(() => {
      const text = $getNodeByKey<TextNode>(textKey);
      if (text !== null) {
        text.setTextContent('b');
      }
    });
    await microtasks(1200);
    unregisterUpdate();
    unregisterMutation();
    await macrotask();
    // Expected: base = detected (>0 warnings). Head: if 0, the command-reset
    // in triggerCommandListeners has defeated the detector for this loop.
    expect(warnings.length).toBeGreaterThan(0);
  });
});
