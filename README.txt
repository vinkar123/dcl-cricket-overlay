DCL MODERN OVERLAY — HIGH-CONTRAST EXTRAS/PARTNERSHIP FIX

This version fixes visibility of Extras and Current Partnership.

Cause found:
- Partnership text had an explicit dark color (#0a2440) on the dark infobar.
- The lower bar also had multiple inherited/responsive rules that could make
  Extras/Partnership difficult to see on a mobile PRISM renderer.

Fix:
- Extras is explicitly white, with a subtle cyan highlight and cyan left edge.
- Partnership is explicitly white, with a subtle gold highlight and gold left edge.
- display / visibility / opacity are explicitly forced.
- Mobile lower bar is slightly taller to keep both readable.
- All previous larger mobile font settings remain.
- Extras and partnership JavaScript population remain enabled.
- 2-second refresh remains.

PRISM URL is unchanged.
