# Lexical × Octane

A Lexical rich-text editor whose **page shell, in-editor toolbar, and an
in-editor review card are all rendered with [Octane](https://github.com/octanejs/octane)**
— a compiled, React-shaped UI framework — while the editor itself is built
entirely from the newest Lexical APIs.

This example deliberately does **not** use `@octane/lexical` (a mechanical port
of the legacy plugin APIs). It wires Octane to Lexical through small,
framework-neutral seams so the modern extension model stays front and center.

## What it demonstrates

- **Extensions, not plugins.** The editor is assembled with
  `buildEditorFromExtensions` from a flat, topologically-sorted list of
  extensions (`RichTextExtension`, `HistoryExtension`, `ListExtension`,
  `LinkExtension`, …). See [`src/editor.ts`](./src/editor.ts).
- **A `DecoratorNode` rendered by Octane.** `ReviewCardNode`
  ([`src/ReviewCardNode.ts`](./src/ReviewCardNode.ts)) is an atomic block whose
  chrome — an interactive star widget and two editable frames — is an Octane
  component mounted per node key into the node's host DOM
  ([`src/ReviewCardExtension.tsx`](./src/ReviewCardExtension.tsx)).
- **`$config`, NodeState and named slots.** One `$config()` call declares the
  node's type, its `rating` NodeState (`createState`) and its `quote` /
  `attribution` **slots**. Slots replace nested editors: both regions are edited
  by the host editor yet stay isolated for selection, history and
  serialization. The `quote` is a multi-block shadow-root container; the
  `attribution` is a single-line field.
- **The `DOMImportExtension` pipeline.** `ClipboardDOMImportExtension` routes
  real pastes through the DOM-import pipeline, and the review card registers its
  own import rule so it round-trips through HTML.
- **Signals as the framework bridge.** Editor-side state lives in extensions as
  `@preact/signals-core` signals (`ToolbarStateExtension`,
  `EditorStateExtension`, `WatchEditableExtension`); Octane reads them through a
  three-line `useSyncExternalStore` adapter in
  [`src/octane-bridge.ts`](./src/octane-bridge.ts). The same signals would drive
  a React or Svelte view unchanged.

## Running

From the monorepo root:

```sh
pnpm install
pnpm run start:dev-example octane
```

Then open the printed URL. Try the toolbar, click the stars, edit the quote and
the attribution, and paste rich content — everything is reflected live in the
JSON panel at the bottom.

## How the Octane compiler is scoped

`octane({requireDirective: true})` in [`vite.config.ts`](./vite.config.ts) makes
Octane compile a module only when it opens with a `@jsxImportSource octane`
pragma. That keeps Octane's compiler off of the Lexical package sources the
monorepo dev server resolves straight from `packages/*/src`; only this example's
own components and hook modules opt in.
