# `@lexical/code-highlights`

[![See API Documentation](https://lexical.dev/img/see-api-documentation.svg)](https://lexical.dev/docs/api/modules/lexical_code-highlights)

This package contains the code highlighter for Lexical using the
[Highlights](https://www.npmjs.com/package/@pierre/highlights) engine, a
WebAssembly highlighter with built-in lexers for dozens of languages and
Zed-compatible themes. Its API mirrors `@lexical/code-shiki`, so either can be
swapped in for the other:

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

Every language is built into the engine. The engine and the theme of a code
block (`one-light` by default) are loaded on first use, and highlighting starts
once both have loaded. `getCodeLanguageOptions()` and `getCodeThemeOptions()`
return the `[id, name]` pairs for a language or theme picker.

The engine is WebAssembly that uses SIMD, so highlighting needs Chrome 91,
Firefox 89 or Safari 16.4 or later, and a Content Security Policy that allows
WebAssembly (`'wasm-unsafe-eval'` in `script-src`). Where the engine can't
load, code blocks are left uncolored and the editor otherwise works as usual.
