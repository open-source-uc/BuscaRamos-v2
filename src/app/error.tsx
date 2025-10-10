"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("🚨 Global Error:", error);
    console.error("Error digest:", error.digest);
    console.error("Stack trace:", error.stack);

    const clearAllCaches = async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cache) => caches.delete(cache)));

        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.unregister();
          }
        }
      } catch (err) {
        console.warn("⚠️ No se pudo limpiar la caché:", err);
      }
    };

    clearAllCaches();
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">🚨 Error de la aplicación</h1>

      <div>
        <p className="font-medium">Mensaje del error:</p>
        <p className="opacity-80">{error.message || "Ha ocurrido un error inesperado"}</p>
      </div>

      <details className="rounded border p-3">
        <summary className="cursor-pointer font-medium">Ver stack trace</summary>
        <pre className="mt-2 whitespace-pre-wrap text-sm opacity-80">{error.stack}</pre>
      </details>

      {error.digest ? (
        <p className="text-sm opacity-80">Digest: {error.digest}</p>
      ) : null}

      <div className="flex gap-3 pt-2">
        <button onClick={reset} className="rounded border px-3 py-1">
          Intentar nuevamente
        </button>
        <button onClick={() => window.location.reload()} className="rounded border px-3 py-1">
          Recargar página
        </button>
      </div>

      <p className="text-xs opacity-70">
        Si el problema persiste, por favor reporta este error con captura de pantalla del stack
        trace.
      </p>
    </div>
  );
}


