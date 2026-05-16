import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./types";

let deployHash: string | null = null;

const hashMiddleware: Middleware = {
  onRequest({ request }) {
    const url = new URL(request.url);
    if (deployHash) url.searchParams.set("hash", deployHash);
    // Cachear datos estáticos de cursos por 1 hora
    return new Request(url, { ...request, next: { revalidate: 3600 } } as RequestInit);
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
