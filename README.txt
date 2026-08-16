DCL ULTRA-SLEEK CONTINUOUS TEAM-COLOR OVERLAY V6

This version directly addresses the requested design:
- One compact visual unit, not separated tiles.
- First ribbon ~30px high.
- Second ribbon ~15px high and attached immediately below with NO GAP.
- Maximum video area remains visible.
- Batting-team dominant logo color flows from the LEFT.
- Bowling-team dominant logo color flows from the RIGHT.
- Both colors transition smoothly toward a dark broadcast center.
- Dynamic team-color extraction remains enabled.

Line 1:
- Batting team logo
- Batter 1 + runs/balls + striker marker
- Batter 2 + runs/balls
- Team abbreviation
- Score
- Overs
- Current bowler
- Bowler figures
- Bowling team logo

Line 2:
- Extras total
- WD / NB / B / LB
- CP - xx R IN xx B
- Target / Need / RRR ONLY when team 2 is batting
- CRR
- Current-over ball-by-ball

Partnership:
- Uses DCL partnership fields when available.
- Otherwise derives the current partnership from DCL ball-by-ball events.

Refresh:
- 2 seconds.

GitHub:
index.html
netlify.toml
README.txt
netlify/functions/score.mjs

PRISM:
https://YOUR-SITE.netlify.app/?match=5923
