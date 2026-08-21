// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore `.open-next/worker.js` se genera en build (opennextjs-cloudflare build)
import handler from "./.open-next/worker.js";

export default {
  fetch: handler.fetch,

  async scheduled(controller: ScheduledController, env: CloudflareEnv, ctx: ExecutionContext) {
    console.log(`Cron ${controller.cron} triggered`);
    // Invoca la ruta /api/courses dentro del mismo worker (sin salir a la red);
    // la lógica de regeneración vive en el bundle de Next junto a courses-unified.ts.
    const response: Response = await handler.fetch(
      new Request("https://buscaramos.osuc.dev/api/courses", {
        headers: { Authorization: `Bearer ${env.API_SECRET}` },
      }),
      env,
      ctx
    );
    const body = await response.text();
    if (!response.ok) {
      throw new Error(`/api/courses failed: ${response.status} ${body}`);
    }
    console.log(`/api/courses: ${body}`);
  },
} satisfies ExportedHandler<CloudflareEnv>;

// OpenNext exporta estos Durable Objects desde el worker generado;
// al reemplazar el entrypoint hay que re-exportarlos.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore `.open-next/worker.js` se genera en build (opennextjs-cloudflare build)
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";
