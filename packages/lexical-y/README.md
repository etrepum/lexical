# @lexical/y

Experimental, framework-independent collaboration extensions for Yjs 14
(`@y/y`). This is a new document format with no Yjs 13 compatibility layer.
Existing `@lexical/yjs` bindings and React plugins continue to use `yjs` 13.

## Getting started

```ts
import {buildEditorFromExtensions} from '@lexical/extension';
import {RichTextExtension} from '@lexical/rich-text';
import {YExtension, YHistoryExtension} from '@lexical/y';
import * as Y from '@y/y';
import {configExtension, defineExtension} from 'lexical';

const doc = new Y.Doc();
const editor = buildEditorFromExtensions(
  defineExtension({
    name: 'my-editor',
    dependencies: [
      RichTextExtension,
      configExtension(YExtension, {root: doc.get('content')}),
      YHistoryExtension,
    ],
  }),
);

// Optional: editor.setRootElement(contentEditable);
// Your application loads, persists, and exchanges updates for doc.
// Dispose the editor separately from the application's document/transport.
```

Only nodes that declare their own `$config()` are supported. Node properties
must use Lexical's JSON serialization schema (inherited fields are supported).
Use `nodeSchema`, schema values and `withField`/accessors to describe custom
properties; `stateConfigs` describes NodeState. Custom `exportJSON` and
`updateFromJSON` overrides are not the collaboration contract. Schema defaults
apply when a peer removes a property. Arbitrary private fields, legacy nodes,
and nested editor instances stored as properties are unsupported.

## Binding architecture

The binding keeps BindingV2's one-to-one non-text mapping and grouped text runs,
but stores nodes independently from their positions. Each non-text node has a
named `Y.Node`; adjacent TextNodes share an unnamed text run. The root's
`tree:node:` attributes retain these nodes. Child sequences and named slots hold
`{id, token}` placements; a node's `tree:placement` attribute selects its current
placement. Moving a node changes its placement without deleting its shared
content, so concurrent edits to that content survive the move.

Concurrent moves of the same node use Yjs attribute conflict resolution to choose
one placement. Concurrent reparenting can create a cycle: the visible projection
lifts the member with the smallest storage ID to the root. This deterministic
projection preserves content without generating repair transactions. Deleting a
parent hides its subtree; a concurrent move of a child outside that subtree can
survive. Stored nodes, including deleted nodes and losing placements, are retained
for undo and concurrent references. Storage reclamation requires a coordinated
application policy and is not automatic.

Text edits use CRDT insert/delete operations, and formatting boundaries map runs
back to Lexical TextNodes. Reconciliation skips unchanged subtrees. Ordinary text
and property transactions do not rebuild the topology; structural transactions
rebuild its projection. Selection bookmarks include ancestor positions so removal
of a selected container falls back to a nearby surviving boundary.

While active, the binding requests synchronous Lexical commits through
`registerUpdateListener(listener, {synchronous: true})`. Each completed update
reaches Yjs before another synchronous transaction can arrive; this disables
microtask batching, including for updates that skip transforms. Nested updates
still belong to their containing update. Do not mutate the Y document from inside
an editor update; use `binding.transact` between editor updates.

Schema properties use `p:` attributes. Each non-flat NodeState key uses an
independent `s:` attribute; flat state follows its JSON schema property. Values
remain structured JSON, including objects, arrays and null. Within text runs,
one-element arrays distinguish JSON null from Yjs's null formatting-removal
sentinel. No NodeState JSON strings are needed. Plain JSON NodeState values are
atomic at their key. Use a live `Y.Node` value when nested edits should merge.

Named slots use independent `slot:` attributes containing placements. Different
slots merge even when peers create them concurrently. The supplied root and its
node store belong to the binding; put unrelated application data elsewhere.

## Schema and persistence contract

Every root has a `tree:format` marker containing the format version and application
`schemaId` (default `"default"`). Configure the same `schemaId` on all editors of a
root. Change it when deploying incompatible node schemas; the binding rejects a
mismatch before editing. It does not migrate Yjs 13 data or infer application
schema compatibility. Coordinate migrations and offline-client upgrades outside
the binding.

An unknown node type or invalid remote schema is reported through Lexical's error
handler and `binding.error`. Outgoing writes are suspended after a failed read so
an incomplete local projection cannot overwrite shared content. Fix the shared
data or rebuild the editor with the required schema. A successful read clears the
error. Unknown NodeState keys remain in NodeState; ordinary schema properties are
owned by the configured schema, so `schemaId` must also change when peers cannot
safely interpret those properties.

Headless loading uses the same extension and requires no provider:

```ts
const doc = new Y.Doc();
Y.applyUpdate(doc, persistedUpdate);
const editor = buildEditorFromExtensions(
  defineExtension({
    name: 'index-document',
    dependencies: [
      RichTextExtension,
      configExtension(YExtension, {root: doc.get('content')}),
    ],
  }),
);
try {
  const searchableSnapshot = editor.getEditorState().toJSON(true);
  // Index the snapshot. Persist Y.encodeStateAsUpdate(doc) for future editing.
} finally {
  editor.dispose();
  doc.destroy();
}
```

Persist encoded Yjs updates to preserve identities and offline merge history.
A JSON snapshot is for export/indexing; importing it creates new collaborative
identities and is not a substitute for restoring the CRDT document.

## Live shared properties and NodeState

A schema property or NodeState value can hold a live `Y.Node`, including on
TextNodes and in flat NodeState. The schema getter must expose the shared node
itself; for a direct field, use `withField(rawValue<Y.Node>(), {field: '__value'})`.
NodeState parsers must accept live nodes. The binding preserves live values
before `unparse`, so normal JSON export can still use a separate snapshot codec:

```ts
import {getExtensionDependencyFromEditor} from '@lexical/extension';
import {$getRoot, $setState, createState} from 'lexical';

const sharedState = createState('shared', {
  parse: value => value instanceof Y.Node ? value : undefined,
  unparse: value => value && value.toJSON(),
});

const shared = new Y.Node();
editor.update(() => {
  $setState($getRoot(), sharedState, shared);
}, {discrete: true});

const {binding} = getExtensionDependencyFromEditor(editor, YExtension).output;
binding.transact(() => shared.insert(0, 'hello'));
```

This example parser accepts live values; applications importing standalone JSON
also need to parse their chosen snapshot representation. Persist Yjs updates to
retain shared identity, formatting and CRDT history. A plain JSON export does not
retain those relationships.

Detached values are integrated once into independent `shared:` attributes on the
binding root. Properties and text formats use `ref:` entries with stable storage
keys so shared-value undo/redo also works on remote peers. Aliases and text splits retain the same shared object. Types already
integrated elsewhere in the same document remain application-owned and are
referenced by Yjs identity. These external targets must outlive their references;
reassign a field if its target is recreated. Cross-document
values must be explicitly cloned before assignment. Shared types must be direct
property/NodeState values; use shared attributes or children for nested types,
rather than embedding them inside plain JSON objects or arrays.

Mutations to a referenced type or its descendants mark all owning Lexical nodes
dirty, including changes to externally owned types. `binding.transact` gives local
mutations the binding's undo origin; call it outside an editor update. Direct Yjs
transactions are also observed, but are excluded from local undo unless they use
that origin. Collaborative history covers the root and its referenced types.

Live values are mutable: older EditorStates reference the same live objects.
Lexical node copying also retains those references; clone explicitly for an
independent value, or use NodeState's `resetOnCopyNode` to discard it on copy.
Removing a reference does not destroy the value. Binding-owned values are retained
for the document's lifetime so aliases, concurrent references and undo remain
valid; automatic reclamation is not implemented. Disposing the editor removes its
observers and leaves shared data intact.

## Application-owned roots and loading

`YExtension` accepts an already-integrated root. It can be a top-level root, a
nested `Y.Node`, or a root in a subdocument. Existing content is read immediately.
Several editors can bind different roots in one document, with undo tracking each binding's local transactions. The application chooses documents/subdocuments and transports, and
owns connection, persistence and disposal. Disposing the editor removes its
listeners without destroying any of those objects.

This boundary accommodates database-backed and externally managed transports,
including the binding style used by Electric: the transport supplies document
updates and optional loading information. There is no Electric-specific adapter
or dependency, and a transport must itself support the chosen Yjs generation.

By default an empty shared root stays empty. To initialize it, configure
`$initialState` on `YExtension` and set `ready: false` while loading. Set the
extension's `ready` output signal to true when loading finishes:

```ts
import {getExtensionDependencyFromEditor} from '@lexical/extension';

getExtensionDependencyFromEditor(editor, YExtension).output.ready.value = true;
```

Bootstrap runs at most once per editor, only if the shared root is empty, and
is excluded from undo. The application must elect one initializer when multiple
clients might bootstrap concurrently. Generic `$initialEditorState` is disabled
by the binding so it cannot overwrite the shared document. Readiness gates
bootstrap; it does not gate editing or incoming updates.

`YProviderExtension` optionally observes `{synced, on('sync'), off('sync')}`.
It samples already-synced providers and forwards later changes to readiness.
The `provider` output signal replaces the observed provider at runtime, removing
the old subscription while retaining the document and binding. This supports
transport replacement and credential refresh. It requires neither awareness nor
`connect`/`disconnect` methods. Applications
with other loading APIs can set the readiness signal directly.

The `disabled` output signal stops binding listeners. Re-enabling reloads the
shared root; edits made to the disconnected editor are not published.

## Optional extensions

- `YHistoryExtension` owns a `Y.UndoManager` scoped to the root and referenced
  shared types, tracking local binding transactions. It handles undo, redo and clear-history commands,
  restores relative selections, and exposes `canUndo`, `canRedo` and
  `undoManager` signals. `YExtension` disables a peer `HistoryExtension` to avoid
  competing local history. Bootstrap and normalization are excluded.
- `YAwarenessExtension` takes an application-owned awareness object separately
  from the transport. It publishes relative selections and user metadata,
  exposes a `peers` signal, and works headlessly. Use a distinct `field` for
  different roots sharing an awareness object. Disposal clears only that field.
- `YCursorsExtension` renders remote highlights, carets and labels in the root's
  owner document. User metadata includes `name`, `color` and `textColor`.
  Configure `className`, `zIndex`, and `container` for mounting/styling. The default
  renderer uses `lexical-y-highlight`, `lexical-y-caret`, and `lexical-y-label`
  classes. `renderCursor(context)` can replace rendering per peer; context contains
  `clientID`, `presence`, the resolved selection, viewport `rects`/`caret`, and the
  fixed-position overlay `container`. Append elements there and optionally return
  cleanup, which runs before refresh and disposal. A custom mount container must
  belong to the root's document and must not establish a transformed containing
  block for the fixed overlay. Layout, font loading, scrolling, editor updates,
  and awareness changes trigger refreshes.
  It depends on awareness and requires a configured `YAwarenessExtension`.

`$getYSelection` and `$resolveYSelection` are available for custom presence
renderers. They operate inside a Lexical read/update and resolve positions only
inside the binding's root.

## Dependencies and initial scope

`@y/y` is a peer dependency; applications provide one compatible instance. The
workspace tests against `14.0.0-rc.26`; its dependencies require Node.js 22 or newer. The separate `yjs` 13 dependency and its
workspace override are unchanged. `@y/protocols` is used only in tests; consumers
can supply any structurally compatible awareness implementation.

This initial package includes live synchronization, collaborative history,
presence and cursors. It does not yet expose Yjs 14 renderer-based suggestions,
attribution or snapshot-diff extensions. Its document format is experimental;
it neither reads nor migrates `@lexical/yjs` BindingV1/BindingV2 documents.


## Local presentation and autocomplete

Keep unaccepted suggestions, menus and hover state in extension signals or DOM
decorations. They do not belong in shared properties or NodeState. The playground's
current `AutocompleteExtension` already follows this design: its ghost is an
unmanaged DOM decoration, and accepting it performs a normal text edit. This
avoids broadcasting suggestions or adding them to undo/export. `SKIP_COLLAB_TAG`
is not an exclusion policy for persistent nodes; a later reconciliation can still
encounter those nodes. Use relative selection bookmarks to anchor local UI across
remote edits, and re-resolve them before accepting a suggestion.
