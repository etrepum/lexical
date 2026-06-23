# `@lexical/comark`

[![See API Documentation](https://lexical.dev/img/see-api-documentation.svg)](https://lexical.dev/docs/api/modules/lexical_comark)

An alternative to [`@lexical/markdown`](https://www.npmjs.com/package/@lexical/markdown)
that uses the [comark](https://comark.dev/) parser and renderer instead of the
hand-written regular-expression engine.

It provides two complementary capabilities:

- **Full document parsing** — convert a complete Markdown string to and from a
  Lexical editor state by parsing it into the comark AST (`parse`) and rendering
  the AST back to Markdown (`renderMarkdown`).
- **Streaming markdown shortcuts** — transform Markdown syntax into rich nodes
  as the user types, using comark's streaming parser. comark's `autoClose`
  feature understands partial input such as `**bol` or `# `, which makes it a
  natural fit for live editing.

Because comark's parser and renderer are asynchronous, the document conversion
helpers return Promises. The `$`-prefixed helpers operate on an already-parsed
comark tree and remain synchronous so they can be used inside `editor.update()`
/ `editor.read()`.

## Usage

```ts
import {
  convertFromComarkString,
  convertToComarkString,
  registerComarkShortcuts,
} from '@lexical/comark';

// Import a Markdown document into the editor
await convertFromComarkString(editor, '# Hello **world**');

// Export the editor contents back to Markdown
const markdown = await convertToComarkString(editor);

// Transform Markdown shortcuts while typing
const unregister = registerComarkShortcuts(editor);
```

The set of nodes that participate in conversion and shortcuts is controlled by
an array of `ComarkTransformer`s, mirroring the design of `@lexical/markdown`.
The default `COMARK_TRANSFORMERS` cover headings, quotes, lists (including
check lists), code blocks, links, line breaks and the standard inline text
formats (bold, italic, strikethrough and inline code).
