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

  const cacheKey = new Request(url.toString(), { method: "GET" });
  const edgeCache = await caches.open("review-markdown-v1");
  const cachedResponse = await edgeCache.match(cacheKey);
  const clientEtag = req.headers.get("If-None-Match");

  if (cachedResponse) {
    const cachedEtag = cachedResponse.headers.get("ETag");
    if (clientEtag && cachedEtag && clientEtag === cachedEtag) {
      return new Response(null, {
        status: 304,
        headers: cachedResponse.headers,
      });
    }

    return cachedResponse;
  }

  const { env, ctx } = getCloudflareContext();
  const R2 = env.R2;
  const head = await R2.head(key);

  if (!head) {
    return new Response("Not Found", { status: 404 });
  }

  const serverEtag = head.httpEtag;

  const sharedHeaders = {
    "Cache-Control": "public, max-age=300, s-maxage=300",
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

  const response = new Response(markdownContent, {
    status: 200,
    headers: {
      ...sharedHeaders,
      "Content-Type": "text/markdown",
    },
  });

  ctx.waitUntil(edgeCache.put(cacheKey, response.clone()));

  return response;
};
