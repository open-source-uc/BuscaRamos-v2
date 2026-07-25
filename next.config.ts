import { execSync } from "node:child_process";

import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

/**
 * Identificador único del deploy.
 *
 * Con esto Next agrega `?dpl=<id>` a los assets y compara el id del cliente
 * contra el del servidor en cada navegación: si no calzan (el usuario tiene una
 * pestaña del build anterior) hace una navegación dura en vez de pedir chunks
 * que ya no existen y morir con ChunkLoadError.
 *
 * Se usa el SHA del commit y no un timestamp porque Next carga esta config
 * varias veces durante un build; un valor distinto en cada carga dejaría el
 * HTML y el bundle desalineados y provocaría recargas infinitas.
 */
function resolveDeploymentId(): string | undefined {
  if (process.env.NEXT_DEPLOYMENT_ID) return process.env.NEXT_DEPLOYMENT_ID;

  try {
    const sha = execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
    return sha ? `git-${sha}` : undefined;
  } catch {
    // Sin repo git (o git no disponible) no hay id estable que usar.
    return undefined;
  }
}

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  deploymentId: resolveDeploymentId(),
};

export default nextConfig;
