export default async (request) => {
  try {
    const url = new URL(request.url);

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
