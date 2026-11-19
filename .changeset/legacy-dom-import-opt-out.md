---
'lexical': patch
'@lexical/extension': patch
'@lexical/html': patch
'@lexical/react': patch
---

[deprecation] Deprecate static `importDOM`, `$config().importDOM`, `html.import` conversion maps, and `$generateNodesFromDOM`. Legacy import remains enabled by default. The first legacy conversion builds the editor's cache and emits a one-time development warning; editor creation does neither.

Replacement: Contribute rules to `DOMImportExtension`, call `$generateNodesFromDOMViaExtension` for direct imports, and install `ClipboardDOMImportExtension` for HTML pastes and drops. Set `disableLegacyImport: true` once all paths have migrated, or `false` to keep legacy import without the warning.

Removal: not scheduled.
