---
'@lexical/markdown': patch
---

[fix] Markdown export escapes `<` and `&` only where they could start HTML, an autolink or a numeric reference, so text such as `<3`, `1<2` and `a < b` exports unchanged

Verify: text with `<` before a digit, space or most punctuation, and `&` before anything but `#`, now exports without a `&#60;` or `&#38;` reference, also at the end of a text node when the next node's text cannot complete the markup. `<` before an ASCII letter, `/`, `!` or `?`, or before the local part of an email address, is still escaped.
