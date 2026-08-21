/**
 * Recuperación ante chunks huérfanos tras un deploy.
 *
 * Next.js le pone un hash de contenido al nombre de cada chunk. Al deployar,
 * los assets del build anterior dejan de existir (Workers Static Assets sirve
 * solo los de la versión actual), así que una pestaña abierta —o un HTML
 * cacheado en el navegador— pide un `/_next/static/chunks/*.js` que ya no está
 * y revienta con ChunkLoadError.
 *
 * La única salida real desde el cliente es recargar para tomar el HTML nuevo.
 * Guardamos la marca en sessionStorage para no caer en un loop de recargas si
 * el fallo no era por un deploy (por ejemplo, red caída).
 */

const CHUNK_ERROR_PATTERN =
  /ChunkLoadError|Loading chunk .* failed|Loading CSS chunk .* failed|Failed to fetch dynamically imported module|error loading dynamically imported module|importScripts|Unexpected token '<'/i;

const RELOAD_GUARD_KEY = "buscaramos:chunk-recovery-at";

/** Ventana mínima entre recargas automáticas. */
const RELOAD_GUARD_WINDOW_MS = 60_000;

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;

  if (typeof error === "string") return CHUNK_ERROR_PATTERN.test(error);

  const { name, message } = error as { name?: unknown; message?: unknown };
  const name_ = typeof name === "string" ? name : "";
  const message_ = typeof message === "string" ? message : "";

  return name_ === "ChunkLoadError" || CHUNK_ERROR_PATTERN.test(`${name_} ${message_}`);
}

/**
 * `true` si ya recargamos hace poco, es decir, si recargar de nuevo sería un
 * loop en vez de una recuperación.
 */
export function recentlyRecovered(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const last = Number(sessionStorage.getItem(RELOAD_GUARD_KEY));
    return Number.isFinite(last) && last > 0 && Date.now() - last < RELOAD_GUARD_WINDOW_MS;
  } catch {
    // sessionStorage bloqueado (modo incógnito estricto): sin guardia no
    // arriesgamos un loop, así que preferimos no recargar.
    return true;
  }
}

/**
 * Limpia cachés del navegador y recarga sin usar la caché de HTML.
 * No hace nada si ya se intentó dentro de la ventana de guardia.
 */
export async function recoverFromChunkError(): Promise<void> {
  if (typeof window === "undefined" || recentlyRecovered()) return;

  try {
    sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
  } catch {
    return;
  }

  try {
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cache) => caches.delete(cache)));
    }

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch {
    // Si no se pudo limpiar, la recarga igual vale la pena.
  }

  window.location.reload();
}
