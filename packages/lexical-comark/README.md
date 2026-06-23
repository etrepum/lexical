# `@lexical/comark`

[![See API Documentation](https://lexical.dev/img/see-api-documentation.svg)](https://lexical.dev/docs/api/modules/lexical_comark)

An alternative to [`@lexical/markdown`](https://www.npmjs.com/package/@lexical/markdown)
that uses the [comark](https://comark.dev/) parser and renderer, exposed as a
single Lexical extension.

`ComarkExtension` provides:

- **Full document parsing** — parse a Markdown string into the comark AST and
  build Lexical nodes from it, or snapshot the editor as a comark AST and render
  it back to Markdown.
- **Streaming markdown shortcuts** — transform Markdown syntax into rich nodes
  as the user types, using comark's streaming parser. comark's `autoClose`
  feature understands partial input such as `**bol` or `# `, which makes it a
  natural fit for live editing.

It depends on the node extensions required by the default transformers
(`RichTextExtension`, `ListExtension`, `CodeExtension`, `LinkExtension`), so
adding it to an editor is all that is needed for the standard experience.

## Usage

```ts
import {
  buildEditorFromExtensions,
  getExtensionDependencyFromEditor,
} from '@lexical/extension';
import {ComarkExtension} from '@lexical/comark';

const editor = buildEditorFromExtensions([ComarkExtension]);
const {output} = getExtensionDependencyFromEditor(editor, ComarkExtension);

// Streaming markdown shortcuts are registered automatically.
```

### Importing a document

comark's parser is asynchronous. Rather than mutating the editor itself,
`parseMarkdown` parses off to the side and resolves to a function you call
inside your own `editor.update()`. The parse touches no editor state, so
overlapping imports (e.g. fast streaming input) can never race — you decide
when, and whether, to apply each result.

```ts
const $apply = await output.parseMarkdown('# Hello **world**');
editor.update(() => {
  $apply(); // replaces the root's children, returns the inserted nodes
});
```

If you already hold a comark tree (from comark's own `parse`), build nodes
synchronously with `output.$generateNodesFromComarkTree(tree)` — the analogue of
`$generateNodesFromDOM` in `@lexical/html`.

### Exporting a document

```ts
const markdown = await output.renderMarkdown();
```

The comark tree is captured synchronously inside an `editor.read()`, so this is
race-free. The synchronous core, `output.$generateComarkTreeFromNodes()` (the
analogue of `$generateDOMFromNodes`), is available for custom rendering.

## Configuration

`ComarkExtension` exposes two config fields:

- `disabled` (default `false`) — turn the streaming shortcuts off.
- `transformers` (default `COMARK_TRANSFORMERS`) — the transformers that drive
  import, export and the shortcuts.

```ts
import {configExtension, defineExtension} from 'lexical';
import {ComarkExtension, COMARK_TRANSFORMERS} from '@lexical/comark';

const MyEditorExtension = defineExtension({
  name: 'my-editor',
  dependencies: [
    configExtension(ComarkExtension, {
      transformers: [...COMARK_TRANSFORMERS /*, your custom transformers */],
    }),
  ],
});
```

The default transformers cover headings, quotes, ordered/unordered/check lists
(including nesting), code blocks, links, line breaks and the standard inline
text formats (bold, italic, strikethrough and inline code).
