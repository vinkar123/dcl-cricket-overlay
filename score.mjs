export default async (request) => {
  try {
    const url = new URL(request.url);
    const match = (url.searchParams.get("match") || "5923").replace(/[^0-9]/g, "");
    if (!match) return new Response(JSON.stringify({error:"Invalid match"}), {status:400});

    const upstream = await fetch(`https://dallascricket.org:3000/api/getmatchdata/${match}`, {
      headers: {
        "Accept": "application/json,text/plain,*/*",
        "User-Agent": "Mozilla/5.0"
      }
    });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
        "cache-control": "no-store",
        "access-control-allow-origin": "*"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({error: String(e)}), {
      status: 500,
      headers: {"content-type":"application/json","cache-control":"no-store"}
    });
  }
};