---
'@lexical/html': patch
---

[fix] Preserve line breaks from empty block elements between inline siblings in DOM import extension rules.

Verify: Import `1<div></div>2` inside a block or list item through DOMImportExtension. The resulting text keeps a line break between `1` and `2`, matching legacy HTML import.
