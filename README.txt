DCL MODERN PRISM OVERLAY — WEBSITE LOGO DISCOVERY + 2 SECOND REFRESH

GitHub structure:
  index.html
  netlify.toml
  README.txt
  netlify/functions/score.mjs

DCL league logo:
- Displayed at the TOP-LEFT of the overlay.
- Primary source is dynamic:
    /.netlify/functions/score?leagueLogo=1
- The Netlify function inspects the CURRENT Dallas Cricket League website
  (and its current JavaScript asset bundles) to locate the logo actually
  used by the website.
- It intentionally ignores generic PWA icons such as logo192/logo512.
- The discovered website logo is re-checked every 30 minutes.
- If DCL changes its logo or asset filename in the future, the overlay can
  follow that change automatically as long as the current website exposes it.
- If website discovery fails, index.html falls back to the exact DCL logo
  supplied by the user. The fallback is embedded directly in index.html;
  there is NO assets folder.

Live score:
- DCL API is proxied by netlify/functions/score.mjs.
- Default score refresh interval: 2 seconds.

PRISM URL:
  https://YOUR-SITE.netlify.app/?match=5923

Future matches:
  Only change the match number.
