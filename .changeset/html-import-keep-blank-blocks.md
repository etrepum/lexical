---
'@lexical/html': patch
'@lexical/list': patch
---

[fix] Keep blank blocks such as `<div><br></div>` when importing HTML through `DOMImportExtension`, so a Gmail or contenteditable paste keeps its empty lines as empty paragraphs (or line breaks inside a list item or code block)

Verify: pasting HTML with empty `<div><br></div>` or `<section><br></section>` lines through the extension importer now yields one empty paragraph per blank block at the root and in table cells, and one line break per blank block in list items and code. A leading empty block in an `<li>`, including an empty `<p>` or heading, now adds a leading line break. A trailing `<br>` after text, a sole `<br>` in `<p>`, and a custom `br` import rule that drops the element behave as before.
