DCL COMPACT BROADCAST OVERLAY V5

Design goal:
- Maximize visible live-stream video area.
- Primary ribbon reduced to ~36 px height.
- Secondary ribbon reduced to ~18 px height.
- SECOND RIBBON IS DIRECTLY ATTACHED BELOW THE FIRST — NO GAP.
- Total score graphic is roughly 54 px tall before scaling.
- Dynamic batting-team color on the left, bowling-team color on the right.
- Sleek angled broadcast accents and blended center score zone.
- DCL logo remains top-left.

Primary ribbon:
- Batting team logo
- Two current batters with runs/balls and striker marker
- Batting team abbreviation
- Score and overs
- Current bowler figures
- Bowling team logo

Attached secondary ribbon:
- Extras total + WD/NB/B/LB
- Current partnership as CP - xx R IN xx B (when DCL exposes it)
- Target / Need / RRR only during innings 2
- CRR
- Current-over ball sequence

Refresh:
- 2 seconds.

GitHub:
index.html
netlify.toml
README.txt
netlify/functions/score.mjs

PRISM:
https://YOUR-SITE.netlify.app/?match=5923
