---
'@lexical/table': patch
---

[fix] Align a new table row as the row it is inserted beside, and a cell split by `$unmergeCellNode` as the rest of its column

Verify: the paragraph format of cells added by inserting a row or unmerging a cell in tables with aligned columns, including `@lexical/mdast` exports of GFM column alignment.
