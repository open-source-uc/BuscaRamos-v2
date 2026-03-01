import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./types";

let deployHash: string | null = null;

const hashMiddleware: Middleware = {
  onRequest({ request }) {
    if (!deployHash) return request;
    const url = new URL(request.url);
    url.searchParams.set("hash", deployHash);
    return new Request(url, request);
  },
  onResponse({ response }) {
    const hash = response.headers.get("x-deploy-hash");
    if (hash) deployHash = hash;
    return response;
  },
};

export const staticDataClient = createClient<paths>({
  baseUrl: "https://buscaramos-v2-static-data.osuc.workers.dev",
});

staticDataClient.use(hashMiddleware);
