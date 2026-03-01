import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  if (!req.url) {
    return new Response("Bad Request: Missing URL", { status: 400 });
  }

  const url = new URL(req.url);
  const key = url.searchParams.get("path");

  if (!key) {
    return new Response("Bad Request: Missing 'path' parameter", { status: 400 });
  }

  const R2 = getCloudflareContext().env.R2;
  const head = await R2.head(key);

  if (!head) {
    return new Response("Not Found", { status: 404 });
  }

  const clientEtag = req.headers.get("If-None-Match");
  const serverEtag = head.httpEtag;

  const sharedHeaders = {
    "Cache-Control": "private, max-age=180, must-revalidate",
    Vary: "Accept-Encoding",
    ETag: serverEtag,
  };

  if (clientEtag && serverEtag && clientEtag === serverEtag) {
    return new Response(null, {
      status: 304,
      headers: sharedHeaders,
    });
  }

  const object = await R2.get(key);
  if (!object) {
    return new Response("Not Found", { status: 404 });
  }

  const markdownContent = await object.text();

  return new Response(markdownContent, {
    status: 200,
    headers: {
      ...sharedHeaders,
      "Content-Type": "text/markdown",
    },
  });
};
