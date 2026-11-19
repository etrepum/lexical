---
'lexical': patch
'@lexical/extension': patch
'@lexical/html': patch
'@lexical/react': patch
'@lexical/y': patch
---

[feature] Deprecate legacy DOM import and let migrated editors skip initializing legacy node converters with `disableLegacyImport: true`. Legacy import still works by default, with a one-time development warning. Set `disableLegacyImport: false` to keep it enabled without a warning while migrating to `DOMImportExtension`.
