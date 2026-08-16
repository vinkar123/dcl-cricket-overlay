export default async (request) => {
  try {
    const url = new URL(request.url);

    /*
     * ============================================================
     * CURRENT DALLAS CRICKET LEAGUE WEBSITE LOGO
     * ============================================================
     * The overlay calls:
     *   /.netlify/functions/score?leagueLogo=1
     *
     * Rather than hard-coding logo192.png/logo512.png, this routine
     * inspects the current DCL website and its current JS assets for
     * the logo used by the site. This allows the overlay to follow a
     * future logo/path change without changing the PRISM URL.
     * ============================================================
     */
    if (url.searchParams.get("leagueLogo") === "1") {
      const SITE = "https://www.dallascricket.org/";

      async function fetchText(target) {
        const r = await fetch(target, {
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "text/html,application/javascript,text/javascript,*/*"
          }
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return await r.text();
      }

      async function sendImage(target) {
        try {
          const absolute = new URL(target, SITE).href;
          const r = await fetch(absolute, {
            headers: {
              "User-Agent": "Mozilla/5.0",
              "Accept": "image/avif,image/webp,image/png,image/jpeg,image/svg+xml,image/*,*/*"
            }
          });
          if (!r.ok) return null;
          const ct = r.headers.get("content-type") || "";
          if (!ct.startsWith("image/")) return null;

          return new Response(await r.arrayBuffer(), {
            status: 200,
            headers: {
              "content-type": ct,
              // Re-check periodically so a future DCL logo replacement is picked up.
              "cache-control": "public, max-age=1800",
              "access-control-allow-origin": "*"
            }
          });
        } catch {
          return null;
        }
      }

      try {
        const homeHtml = await fetchText(SITE);

        // 1) Prefer <img> elements clearly identified as DCL/Dallas/logo.
        const imgTags = [...homeHtml.matchAll(/<img\b[^>]*>/gi)].map(m => m[0]);
        const preferredTags = imgTags
          .filter(tag => /dallas|dcl|league|logo|brand/i.test(tag))
          .concat(imgTags);

        for (const tag of preferredTags) {
          const srcMatch =
            tag.match(/\bsrc=["']([^"']+)["']/i) ||
            tag.match(/\bdata-src=["']([^"']+)["']/i);
          if (!srcMatch) continue;
          const candidate = srcMatch[1];
          if (/logo192|logo512|favicon/i.test(candidate)) continue;
          const response = await sendImage(candidate);
          if (response) return response;
        }

        // 2) Look for common asset references in the HTML itself.
        const directAssets = [...homeHtml.matchAll(
          /["'(]([^"'()]+\.(?:png|jpe?g|webp|svg))["')]/gi
        )].map(m => m[1]);

        const rankedDirect = directAssets.sort((a,b) => {
          const score = x =>
            (/dallas/i.test(x)?8:0) +
            (/dcl/i.test(x)?7:0) +
            (/logo/i.test(x)?6:0) +
            (/brand/i.test(x)?4:0) -
            (/logo192|logo512|favicon/i.test(x)?20:0);
          return score(b)-score(a);
        });

        for (const candidate of rankedDirect) {
          if (/logo192|logo512|favicon/i.test(candidate)) continue;
          const response = await sendImage(candidate);
          if (response) return response;
        }

        // 3) React sites often keep the logo path only inside JS bundles.
        //    Read the current bundle URLs from the homepage, then look for
        //    image assets whose names suggest DCL/Dallas/logo branding.
        const scripts = [...homeHtml.matchAll(
          /<script[^>]+src=["']([^"']+\.js[^"']*)["']/gi
        )].map(m => new URL(m[1], SITE).href);

        for (const scriptUrl of scripts.slice(-8)) {
          let js;
          try { js = await fetchText(scriptUrl); } catch { continue; }

          const assets = [...js.matchAll(
            /["']([^"']*(?:dallas|dcl|logo|brand)[^"']*\.(?:png|jpe?g|webp|svg))["']/gi
          )].map(m => m[1]);

          const ranked = assets.sort((a,b) => {
            const score = x =>
              (/dallas/i.test(x)?8:0) +
              (/dcl/i.test(x)?7:0) +
              (/logo/i.test(x)?6:0) +
              (/brand/i.test(x)?4:0) -
              (/logo192|logo512|favicon/i.test(x)?20:0);
            return score(b)-score(a);
          });

          for (const candidate of ranked) {
            if (/logo192|logo512|favicon/i.test(candidate)) continue;
            const response = await sendImage(candidate);
            if (response) return response;
          }
        }

      } catch (e) {
        // index.html falls back to the exact DCL logo supplied by the user.
      }

      return new Response("Current DCL website logo could not be discovered", {
        status: 404,
        headers: {
          "cache-control": "no-store",
          "access-control-allow-origin": "*"
        }
      });
    }


        const logoPath = url.searchParams.get("logo");

    if (logoPath) {
      if (!logoPath.startsWith("/storage/")) {
        return new Response("Invalid logo path", {
          status: 400
        });
      }

      const logoSources = [
        `https://dallascricket.org:3000${logoPath}`,
        `https://www.dallascricket.org${logoPath}`,
        `https://dallascricket.org${logoPath}`
      ];

      for (const logoUrl of logoSources) {
        try {
          const logoResponse = await fetch(logoUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0",
              "Accept": "image/avif,image/webp,image/png,image/jpeg,image/*,*/*"
            }
          });

          if (logoResponse.ok) {
            const imageData = await logoResponse.arrayBuffer();

            return new Response(imageData, {
              status: 200,
              headers: {
                "content-type":
                  logoResponse.headers.get("content-type") || "image/png",
                "cache-control": "public, max-age=3600",
                "access-control-allow-origin": "*"
              }
            });
          }
        } catch (logoError) {
          // Try next logo source.
        }
      }

      return new Response("Team logo not found", {
        status: 404
      });
    }

    const match = (
      url.searchParams.get("match") || "5923"
    ).replace(/[^0-9]/g, "");

    if (!match) {
      return new Response(
        JSON.stringify({
          error: "Invalid match number"
        }),
        {
          status: 400,
          headers: {
            "content-type": "application/json"
          }
        }
      );
    }

    const dclApiUrl =
      `https://dallascricket.org:3000/api/getmatchdata/${match}`;

    const upstream = await fetch(dclApiUrl, {
      headers: {
        "Accept": "application/json,text/plain,*/*",
        "User-Agent": "Mozilla/5.0"
      }
    });

    const body = await upstream.text();

    return new Response(body, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") || "application/json",
        "cache-control":
          "no-store, no-cache, must-revalidate",
        "access-control-allow-origin":
          "*"
      }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: String(error),
        message:
          "Unable to retrieve Dallas Cricket League match data."
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
          "access-control-allow-origin": "*"
        }
      }
    );
  }
};
