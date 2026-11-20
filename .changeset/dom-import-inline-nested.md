---
'lexical': patch
'@lexical/code-core': patch
'@lexical/html': patch
'@lexical/clipboard': patch
'@lexical/list': patch
'@lexical/link': patch
'@lexical/rich-text': patch
'@lexical/table': patch
---

[fix] Preserve inline divs in monospace HTML pastes, retain a quiet legacy paste fallback for bare nested editors under a migrated parent, and finish graduating the DOM import pipeline's public API from experimental status.

Verify: Paste a Ghostty command with an inline prompt and confirm it stays on one line; block children still create separate lines. Paste bold HTML into a bare nested editor under a parent with `disableLegacyImport: true` and confirm formatting is preserved without a deprecation warning. Ordinary default legacy imports still warn once on first use.
