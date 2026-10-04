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

Each editor also has shared-note actions. Add a live Y.Node in root NodeState,
mutate it, then remove its reference and release its binding-owned storage. Undo
restores the reference and value together. The storage readout shows live shared
values separately from document nodes.

Changing the retention dropdown takes effect when starting a fresh session.
Everything is in memory: refresh/reset discards the session and checkpoint.
The transport has no persistence, authentication, or server dependencies.

This demonstrates lifecycle and retention, not completed suggestion/attribution
UI or native IME correctness. The package tests cover shared-value release,
undo protection, filtered/manual collection, and concurrent moves/deletions.
