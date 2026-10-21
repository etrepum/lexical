# `@lexical/code-highlights`

[![See API Documentation](https://lexical.dev/img/see-api-documentation.svg)](https://lexical.dev/docs/api/modules/lexical_code-highlights)

This package contains the code highlighter for Lexical using the
[Highlights](https://www.npmjs.com/package/@pierre/highlights) engine, a
WebAssembly highlighter with built-in lexers for dozens of languages and Zed-compatible themes.
Its API mirrors `@lexical/code-shiki`, so either can be swapped in for the
other:

```ts
import {CodeHighlightsExtension} from '@lexical/code-highlights';
import {buildEditorFromExtensions, defineExtension} from 'lexical';

const editor = buildEditorFromExtensions(
  defineExtension({
    dependencies: [CodeHighlightsExtension],
    name: 'my-editor',
  }),
);
```

Every language is built in, so highlighting starts as soon as the theme of a
code block (`one-light` by default) has loaded.
