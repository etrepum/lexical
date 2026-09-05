# Bundle size analysis

`analyze.mjs` builds a small application entry against this checkout, minifies
it, and attributes every byte of the output back to the source file and
declaration it came from (via the output sourcemap, so the numbers are
post-minification bytes rather than Rollup's pre-minification
`renderedLength`).

```sh
node scripts/bundle-size/analyze.mjs                       # every entry, from source
node scripts/bundle-size/analyze.mjs rich-text-dom-import  # one entry
node scripts/bundle-size/analyze.mjs --dist                # after pnpm run build-release
node scripts/bundle-size/analyze.mjs rich-text-dom-import --detail=LexicalSelection.ts
```

Two modes:

- **source** (default) resolves the `source` export condition and runs
  `@lexical/compiler` exactly as `scripts/vite/lexicalMonorepoPlugin` does, so
  the PURE/inline annotations that make extension definitions tree-shakeable
  are applied. Invariant messages are *not* replaced with error codes, so it
  reports about 4% higher than a real consumer's bundle. Use it to compare two
  working trees and to get per-file / per-function attribution.
- **`--dist`** measures `packages/*/dist` and needs `pnpm run build-release`
  first. This is the number a consumer actually downloads. Attribution stops at
  the package bundle, because that is as far as the published sourcemaps go.

Entries live in `entries/`. Adding one is a file that builds an editor from the
extensions you care about.

---

## Analysis: a rich text app that imports HTML through `DOMImportExtension`

Measured on `v0.50.0` (commit `c3b629d`) with the
`rich-text-dom-import` entry — `RichTextExtension` plus
`ClipboardDOMImportExtension`, which is what routes pastes and drops through
the `DOMImportExtension` rule pipeline.

### Headline

| Entry | minified | gzip |
| --- | ---: | ---: |
| `lexical-only` — `createEditor()`, no extension framework | 167,113 | 52,358 |
| `extension-builder` — `buildEditorFromExtensions({})` | 181,458 | 56,456 |
| `rich-text` — `+ RichTextExtension` | 235,061 | 73,019 |
| `rich-text-dom-import` — `+ ClipboardDOMImportExtension` | **235,635** | **73,150** |

(`--dist` mode, bytes.)

Two things fall out of that table immediately:

1. **The core is 71% of the bundle.** `lexical` alone is 167 kB minified before
   a single feature package is added. Everything else in this document is about
   the remaining 68 kB.
2. **`ClipboardDOMImportExtension` costs 574 bytes.** Not because the rule
   pipeline is cheap, but because `RichTextExtension` already depends on
   `CoreImportExtension` and `DOMImportExtension` — the whole pipeline is in
   the graph whether or not anything routes HTML through it. That is the first
   cost center below.

### Where the bytes are

Per-package, from source-mode attribution (245,707 minified total):

| Package | bytes | share |
| --- | ---: | ---: |
| `lexical` | 178,129 | 72.5% |
| `@lexical/rich-text` | 17,377 | 7.1% |
| `@lexical/html` | 16,529 | 6.7% |
| `@lexical/extension` | 13,664 | 5.6% |
| `@lexical/clipboard` | 9,204 | 3.7% |
| `@preact/signals-core` | 4,717 | 1.9% |
| `@lexical/dragon` | 2,168 | 0.9% |
| `@lexical/selection` | 1,337 | 0.5% |
| `@lexical/a11y` | 1,170 | 0.5% |
| `@lexical/utils` | 826 | 0.3% |

Largest single files:

| File | bytes |
| --- | ---: |
| `lexical/src/LexicalSelection.ts` | 33,270 |
| `lexical/src/LexicalUtils.ts` | 20,266 |
| `lexical/src/LexicalEvents.ts` | 16,882 |
| `lexical-rich-text/src/index.ts` | 15,196 |
| `lexical/src/LexicalReconciler.ts` | 14,816 |
| `lexical/src/nodes/LexicalTextNode.ts` | 10,152 |
| `lexical/src/LexicalEditor.ts` | 10,125 |
| `lexical/src/LexicalNode.ts` | 9,412 |
| `lexical/src/LexicalUpdates.ts` | 9,345 |
| `lexical/src/caret/LexicalCaret.ts` + `LexicalCaretUtils.ts` | 14,455 |

Inside the two biggest, the weight is concentrated in a handful of
declarations — `RangeSelection.deleteCharacter` (2,538),
`RangeSelection.insertNodes` (2,381), `RangeSelection.insertText` (1,957) and
`RangeSelection.modify` (1,268) are 8 kB of `LexicalSelection.ts` on their own,
and `registerRichText` is 6,336 of the 15,196 bytes of
`lexical-rich-text/src/index.ts`. These are load-bearing: they are what a rich
text editor does. They are worth knowing about, but they are not where a size
reduction comes from.

The reducible weight is elsewhere, in code the app is charged for and never
runs.

### Cost center 1: the app ships two complete HTML import pipelines

`RichTextExtension` depends on `CoreImportExtension` and
`configExtension(DOMImportExtension, {rules: RichTextImportRules})`, so the
rule-based pipeline (`compileImportRules`, `runImport`, `coreImportRules`,
`sel`, the schemas) is always in the graph. Meanwhile
`ClipboardImportExtension`'s default `text/html` handler
(`$defaultHtmlImporter`) statically references the legacy
`$generateNodesFromDOM`, which drags in the legacy walker
(`$createNodesFromDOM`, `getConversionFunction`, `wrapContinuousInlines`,
`$unwrapArtificialNodes`, `ArtificialNode__DO_NOT_USE`) *and* every node's
static `importDOM` conversion map, plus `initializeConversionCache` in
`LexicalEditor` and the `klass.importDOM` wiring in `getStaticNodeConfig`.

Adding `ClipboardDOMImportExtension` swaps the runtime behaviour over to the
rule pipeline but removes nothing from the bundle, because the default handler
is still a live reference.

So both directions are charged for code they do not run:

| Scenario | dead weight (minified / gzip) |
| --- | ---: |
| App uses `DOMImportExtension` → the legacy path is dead | 5,865 / 1,922 |
| App does *not* use `DOMImportExtension` → the rule pipeline is dead | 12,726 / 4,126 |

Split of the first row:

| | minified | gzip |
| --- | ---: | ---: |
| legacy walker in `@lexical/html` | 1,721 | 608 |
| per-node static `importDOM` maps + conversion cache | 4,135 | 1,311 |

### Cost center 2: `RichTextExtension`'s mandatory add-ons

`RichTextExtension` hard-depends on five extensions that are not part of rich
text editing itself. A `disabled` config flag would not help — the code is
still in the dependency graph, so it is still in the bundle. Only removing them
from the graph shrinks the output:

| Dependency | minified | gzip |
| --- | ---: | ---: |
| `DragonExtension` (`@lexical/dragon`, Dragon NaturallySpeaking support) | 2,183 | 738 |
| `HeadingAnnounceExtension` (+ `@lexical/a11y`) | 2,024 | 747 |
| `NormalizeInlineElementsExtension` + `NormalizeTripleClickSelectionExtension` | 1,596 | 537 |

### Cost center 3: drag and drop inside `registerRichText`

The `DROP_COMMAND`, `DRAGSTART_COMMAND` and `DRAGOVER_COMMAND` handlers are
registered unconditionally by `registerRichText`, and pull in
`$handleRichTextDrop`, `$doDrop`, `$resolveDropPointCaret`, `readDragMarker`,
`$writeDragSourceToDataTransfer` and `caretFromPoint` from
`@lexical/clipboard`. Because they live inside one 6 kB function, an editor
with no drag affordance still pays for them: **2,280 / 608**.

### Cost center 4: `sel` refinement builders

`buildSelector` returns an object literal whose `attr`, `classAll`, `classAny`
and `styleAny` methods each close over their predicate builder, so all four
predicate builders are retained as soon as any selector is constructed. A rich
text app only uses `sel.tag()` and `styleAny`; `.attr`, `.classAll` and
`.classAny` are used by `@lexical/mdast` and the playground only, and cost
**828 / 143** here.

(`sel.css` / `parseCss` is *not* in this bundle — the object literal in
`import/index.ts` does tree-shake its unused `css` property, which is worth
about 3.6 kB of pre-minification source. Only the builder methods, which are
created inside a function body, cannot be shaken.)

### Cost center 5: the default `$inlineStylesFromStyleSheets` preprocessor

`DOMImportConfig.preprocess` defaults to `[$inlineStylesFromStyleSheets]`.
On its own, dropping it saves 24 bytes — the same
`$inlineStylesFromStyleSheetsDOM` is also called by the legacy
`$generateNodesFromDOM`. It only becomes a real 698-byte saving once cost
center 1 is fixed, which is why it is listed last and measured only in
combination.

## Proposal

Everything below is additive: the existing `RichTextExtension`,
`registerRichText` and `ClipboardImportExtension` keep their current
composition and behaviour, and applications opt down.

1. **Break the static reference from `ClipboardImportExtension` to
   `$generateNodesFromDOM`.** Move the legacy `text/html` handler into its own
   `ClipboardLegacyHtmlImportExtension`, keep it as a default dependency of
   `ClipboardImportExtension` for backwards compatibility, and have
   `ClipboardDOMImportExtension` declare it as replaced (`conflictsWith`) so an
   app that composes the rule pipeline can drop the legacy dependency from its
   graph.
2. **Move each node's legacy static `importDOM` out of `$config`.** The maps
   are only read by `initializeConversionCache`, which is only reachable from
   the legacy walker. Registering them from the legacy extension instead of
   from the node class lets them shake with it. This is the larger half of cost
   center 1 and the more invasive change — it touches `TextNode`,
   `ParagraphNode`, `LineBreakNode`, `HeadingNode`, `QuoteNode` and
   `HorizontalRuleNode`, and every downstream package that defines
   `importDOM`, so it needs a deprecation cycle rather than a single PR.
3. **Split `RichTextExtension` into `RichTextCoreExtension` plus the add-ons.**
   `RichTextExtension` stays exactly what it is today —
   `RichTextCoreExtension` plus `DragonExtension`,
   `HeadingAnnounceExtension`, the two normalizers, and the import rules — and
   apps that want the floor depend on `RichTextCoreExtension` and add back what
   they need. Same treatment for `CoreImportExtension` /
   `DOMImportExtension`, which lets an app that does not import HTML at all
   drop 12.7 kB.
4. **Split `registerRichText` into `registerRichTextCore` and
   `registerRichTextDragAndDrop`**, with `registerRichText` calling both, and
   have the drag-and-drop half register from its own extension.
5. **Expose `sel` refinements as importable helpers** (`sel.tag('a').with(attr(…))`
   or similar) so unused predicate builders shake, instead of methods on an
   object built inside `buildSelector`.
6. **Make `$inlineStylesFromStyleSheets` opt-in** in `DOMImportConfig`
   (or keep it default and let apps clear `preprocess`) once (1) lands.

### Measured total

Applying all six to the `rich-text-dom-import` entry:

| | before | after | saved |
| --- | ---: | ---: | ---: |
| minified (`--dist`) | 235,635 | 220,220 | **15,415 (6.5%)** |
| gzip (`--dist`) | 73,150 | 68,296 | **4,854 (6.6%)** |
| minified (source mode) | 245,707 | 230,141 | 15,566 (6.3%) |
| gzip (source mode) | 76,442 | 71,470 | 4,972 (6.5%) |

The savings are close to additive; the only interaction is cost center 5,
which needs cost center 1 to pay off.

### Considered and not proposed

- **Replacing `@preact/signals-core` (4,717 bytes).** `@lexical/extension`
  re-exports `signal`/`computed`/`effect`/`batch`/`untracked` as public API, and
  applications pair it with `@preact/signals-react`. A private reimplementation
  would be smaller but would stop those graphs from interoperating.
- **Splitting `RangeSelection`'s methods.** `deleteCharacter`, `insertNodes`,
  `insertText` and `modify` are 8 kB, but they are class methods on a class the
  editor always instantiates, so no bundler can drop them, and moving them off
  the class is a breaking change for every caller.
- **Making the keyboard shortcut table opt-in** (`buildKeyDownShortcuts` plus
  `LexicalKeyboardShortcuts.ts`, 2,423 bytes). Every editor needs most of it,
  and the ones an individual app does not need are individually tiny.
