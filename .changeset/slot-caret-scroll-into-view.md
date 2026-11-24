---
'lexical': patch
---

[fix] Scroll a caret in a named slot or another editable island into view, and keep it in place through collaboration updates

Verify: with the caret in a named slot or a `$markSlotEditable` island, press Enter near the bottom of a scrolling editor; the editor keeps the caret in view. With the caret in such an island, a collaborator's edit to the same text leaves the local caret where it was instead of moving it to the start of the line.
