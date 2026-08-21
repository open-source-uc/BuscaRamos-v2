"use client";

import { useEffect, useState } from "react";

import {
  isChunkLoadError,
  recentlyRecovered,
  recoverFromChunkError,
} from "@/lib/chunkErrorRecovery";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Se decide en el primer render para que nadie alcance a ver la pantalla de
  // error crítico cuando en realidad solo hay que tomar el build nuevo.
  const [isRecovering] = useState(() => isChunkLoadError(error) && !recentlyRecovered());

  useEffect(() => {
    if (isRecovering) {
      console.warn("♻️ Chunk desactualizado tras un deploy, recargando…", error.message);
      recoverFromChunkError();
      return;
    }

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

        console.info("✅ Caché y service workers limpiados correctamente.");
      } catch (err) {
        console.warn("⚠️ No se pudo limpiar la caché:", err);
      }
    };

    clearAllCaches();
  }, [error, isRecovering]);

  if (isRecovering) {
    return (
      <html lang="es-CL">
        <body>
          <p>🔄 Actualizando BuscaRamos a la última versión…</p>
          <p>
            <small>Si esta pantalla no desaparece sola, recarga la página.</small>
          </p>
        </body>
      </html>
    );
  }

  return (
    <html>
      <body>
        <h1>🚨 ERROR CRÍTICO DE LA APLICACIÓN D:</h1>

        <p>
          <strong>Mensaje del error:</strong>
        </p>
        <p>{error.message || "Ha ocurrido un error grave inesperado"}</p>

        <hr />

        <h2>⚠️ IMPORTANTE - REPORTAR ERROR</h2>
        <p>Por favor, reporta este error enviando una captura de pantalla a:</p>
        <p>
          <strong>📱 Instagram: @osuc.dev</strong>
        </p>
        <p>Incluye el stack trace completo para ayudarnos a solucionarlo rápidamente.</p>

        <hr />

        <details>
          <summary>
            <strong>Ver stack trace completo (clic para expandir)</strong>
          </summary>
          <pre>{error.stack}</pre>
        </details>

        {error.digest ? (
          <div>
            <p>
              <strong>Error Digest:</strong> {error.digest}
            </p>
          </div>
        ) : null}

        <hr />

        <div>
          <button onClick={reset}>🔄 Intentar nuevamente (click aquí)</button>

          <button onClick={() => window.location.reload()}>
            🌐 Recargar página completa (click aquí)
          </button>
        </div>

        <hr />

        <p>
          <small>
            Una solución temporal puede ser limpiar la caché del navegador o intentar usar el modo
            incógnito. Sin embargo, por favor repórtalo a @osuc.dev en Instagram para que podamos
            resolver el problema. Asegúrate de enviar el stack trace completo.
          </small>
        </p>
      </body>
    </html>
  );
}
