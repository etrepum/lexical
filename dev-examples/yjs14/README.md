# Yjs 14 lifecycle example

A React-independent dev example for `@lexical/y`. It uses two Y.Docs and an
in-memory transport, rather than the playground's Yjs 13 setup.

From the repository root:

```sh
pnpm install
pnpm --dir dev-examples/yjs14 dev
```

Open the URL printed by Vite. To build:

```sh
pnpm --dir dev-examples/yjs14 build
```

## Try the lifecycle

1. Edit Alice and observe Bob. Disconnect peers and edit both; reconnect to merge.
   Disconnecting the transport does not detach either editor or clear history.
2. Disconnect again, move a paragraph on one side and edit it on the other, then
   reconnect. Moves retain identity. An explicit deletion wins over a concurrent
   move of the deleted node.
3. Save a checkpoint, delete a paragraph, and undo/redo. The live stored-node
   count changes. Undo protects the deleted content from collection.
4. Clear undo history and collect eligible content. Automatic mode uses Yjs's
   normal GC. Filtered mode retains content until the checkbox permits it.
   Manual mode uses `gc: false` and explicit `gcIdSet` calls.
5. View the saved checkpoint after collection: it restores an independently
   stored full Yjs update into a separate read-only editor, not the live document.
6. In manual mode, save a checkpoint and view its lightweight snapshot before
   collecting the historical content. Lightweight snapshots depend on retained
   source content and may be incomplete/unavailable after collection; full
   checkpoints do not depend on the live document retaining that content.

Each peer has a visible **Shared value** text area. Click **Add shared value**,
then edit either text area and observe the other peer update. Disconnect and edit
different parts before reconnecting to see the text merge. Undo/Redo also apply
to these edits. **Release shared value** removes its root NodeState reference and
binding-owned storage; both text areas become disabled. Undo restores the reference
and contents together. The storage readout shows live shared
values separately from document nodes.

Changing the retention dropdown takes effect when starting a fresh session.
Everything is in memory: refresh/reset discards the session and checkpoint.
The transport has no persistence, authentication, or server dependencies.

## Try review and tables

1. Start a proposal and edit its separate editor. Alice/Bob remain unchanged.
   Edit Alice while reviewing; that accepted edit appears in the proposal too.
2. Accept the proposal, then undo in Alice. Repeat with rejection instead of
   acceptance; concurrent accepted edits survive rejection.
3. Expand the proposal delta inspector to inspect native insert/delete metadata.
   Expand attribution after edits and undo to inspect the persisted author records.
4. Save a checkpoint, change the document, and compare. View the saved checkpoint
   after clearing history and collection; its content remains independently stored.
5. Insert a table and edit/select cells. Remote ranges and table selections
   appear as colored overlays in the other editor. Disconnect peers, edit both tables, and
   reconnect. Exercise undo/redo after reconnect and after row/cell changes.
6. Repeat proposal acceptance/rejection and checkpoint viewing in automatic,
   filtered and manual retention modes. Pending proposal documents retain history
   and are not included in the example's manual collection action.

Review uses native deep delta inspectors, not an inline tracked-changes theme.
The package browser tests cover selection overlays and transformed containers;
manual native IME/composition testing is still useful. The example is separate
from the playground and has no React or Yjs 13 dependencies.
