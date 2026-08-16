export default async (request) => {
  try {
    const url = new URL(request.url);

    /*
     * ============================================================
     * TEAM LOGO PROXY
     * ============================================================
     *
     * The DCL match API returns logo paths for the two teams.
     *
     * Example:
     * /storage/teams/xxxx.png
     *
     * The browser/PRISM may not be able to retrieve these images
     * directly because of cross-origin restrictions.
     *
     * This section retrieves the logo through our Netlify function.
     * ============================================================
     */

    const logoPath = url.searchParams.get("logo");

    if (logoPath) {

      // Security check: only allow DCL storage paths.
      if (!logoPath.startsWith("/storage/")) {
        return new Response("Invalid logo path", {
          status: 400
        });
      }

      /*
       * Try the possible DCL locations.
       * The API server is tried first because that is where
       * the match-data API is hosted.
       */
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
                  logoResponse.headers.get("content-type") ||
                  "image/png",

                /*
                 * Team logos do not normally change during a match,
                 * so caching them reduces unnecessary requests.
                 */
                "cache-control": "public, max-age=3600",

                "access-control-allow-origin": "*"
              }
            });
          }

        } catch (logoError) {
          // If one DCL logo location fails, try the next one.
        }
      }

      return new Response("Team logo not found", {
        status: 404
      });
    }


    /*
     * ============================================================
     * LIVE MATCH DATA
     * ============================================================
     *
     * Example PRISM URL:
     *
     * https://YOUR-SITE.netlify.app/?match=5923
     *
     * index.html calls:
     *
     * /.netlify/functions/score?match=5923
     *
     * This function then retrieves:
     *
     * https://dallascricket.org:3000/api/getmatchdata/5923
     * ============================================================
     */

    const match = (
      url.searchParams.get("match") || "5923"
    ).replace(/[^0-9]/g, "");


    /*
     * Make sure the match number is valid.
     */
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


    /*
     * Build the DCL API URL.
     */
    const dclApiUrl =
      `https://dallascricket.org:3000/api/getmatchdata/${match}`;


    /*
     * Request the live match information from DCL.
     */
    const upstream = await fetch(dclApiUrl, {

      headers: {

        "Accept":
          "application/json,text/plain,*/*",

        "User-Agent":
          "Mozilla/5.0"

      }

    });


    /*
     * Read the response from DCL.
     */
    const body = await upstream.text();


    /*
     * Return the DCL response to our overlay.
     *
     * The access-control header allows index.html / PRISM
     * to access the information without the CORS problem
     * you encountered earlier.
     */
    return new Response(body, {

      status: upstream.status,

      headers: {

        "content-type":
          upstream.headers.get("content-type") ||
          "application/json",

        /*
         * Do not cache live cricket scores.
         */
        "cache-control":
          "no-store, no-cache, must-revalidate",

        "access-control-allow-origin":
          "*"
      }

    });


  } catch (error) {

    /*
     * ============================================================
     * ERROR HANDLING
     * ============================================================
     */

    return new Response(

      JSON.stringify({

        error: String(error),

        message:
          "Unable to retrieve Dallas Cricket League match data."

      }),

      {

        status: 500,

        headers: {

          "content-type":
            "application/json",

          "cache-control":
            "no-store",

          "access-control-allow-origin":
            "*"

        }

      }

    );

  }
};
