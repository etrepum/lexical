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
  chrome — an interactive star widget and two editable frames — is rendered with
  an Octane **`createPortal`** into the node's host DOM
  ([`src/ReviewCardExtension.tsx`](./src/ReviewCardExtension.tsx)). A **mutation
  listener** keeps a signal of the live `ReviewCardNode` keys (the
  framework-agnostic binding, as in `HorizontalRuleExtension`), and the App
  renders one portal per key — no `registerDecoratorListener`, which (with
  `decorate()`) exists only to feed React's `useDecorators`, so a
  framework-neutral node skips both. `createPortal` works in Octane's client and
  server renderers alike, so the same code path survives SSR.
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
  `WatchEditableExtension`, and `HistoryExtension`'s `canUndo` / `canRedo`);
  Octane reads them — and the editor's committed state — through small
  `useSyncExternalStore` adapters in
  [`src/octane-bridge.ts`](./src/octane-bridge.ts). The same signals would drive
  a React or Svelte view unchanged.
- **A readable tree view.** The panel at the bottom renders a compact tree of
  the editor state ([`src/editorTree.ts`](./src/editorTree.ts)) rather than raw
  JSON, surfacing the ReviewCard's named slots and `rating` NodeState inline.
- **Server-side rendering, then hydration.** A production build prerenders the
  whole page — including the editor's content — to HTML and the client adopts it
  (see [SSR / prerendering](#ssr--prerendering) below).

## SSR / prerendering

A production build ships a fully-rendered page and hydrates it, so the first
paint shows the document before any editor code runs — the same
prerender-then-hydrate shape as the
[`extension-sveltekit-ssr-hydration`](../../examples/extension-sveltekit-ssr-hydration)
example, done with Octane and Lexical's headless APIs.

- **Prerender (server).** [`entry-server.tsx`](./src/entry-server.tsx) builds
  the editor **headlessly** — Lexical needs no browser — inside
  [`withDOM`](./src/editor.ts) (a happy-dom polyfill so `exportDOM` can create
  elements) and serializes the seeded content with `$generateHtmlFromNodes`.
  Octane's `renderToString` then renders the page around that HTML, which is
  injected into the `contentEditable` via `dangerouslySetInnerHTML`.
- **Hydrate (client).** [`entry-client.tsx`](./src/entry-client.tsx) reads the
  prerendered editor HTML back out of the DOM and renders the **same**
  `dangerouslySetInnerHTML`, so Octane *adopts* the server markup during
  `hydrateRoot` instead of wiping it. The root ref then hands the container to
  Lexical, which re-imports that DOM through the **`DOMImportExtension`**
  pipeline (`$generateNodesFromDOMViaExtension`) — so the review card's import
  rule runs — and re-renders the reconstructed model. The document is therefore
  sent to the client exactly once, as HTML.
- **Single `vite build`.** An `octane-prerender` plugin in
  [`vite.config.ts`](./vite.config.ts) runs a nested SSR build of the server
  entry after the normal client build and splices the rendered page into the
  emitted `index.html`, so `build-dev-examples` produces a prerendered,
  hydrating page with no extra step. `vite dev` skips prerendering and boots a
  plain client SPA (empty `#root` → `createRoot` seeds the sample content).

## Running

From the monorepo root:

```sh
pnpm install
pnpm run start:dev-example octane
```

Then open the printed URL. Try the toolbar, click the stars, edit the quote and
the attribution, and paste rich content — everything is reflected live in the
tree view at the bottom. `start:dev-example` runs `vite dev`, a client-only SPA;
a production `vite build` additionally prerenders the page (see
[SSR / prerendering](#ssr--prerendering)).

## How the Octane compiler is scoped

`octane({requireDirective: true})` in [`vite.config.ts`](./vite.config.ts) makes
Octane compile a module only when it opens with a `@jsxImportSource octane`
pragma. That keeps Octane's compiler off of the Lexical package sources the
monorepo dev server resolves straight from `packages/*/src`; only this example's
own components and hook modules opt in.
