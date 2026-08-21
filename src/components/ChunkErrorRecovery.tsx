"use client";

import { useEffect } from "react";

import { isChunkLoadError, recoverFromChunkError } from "@/lib/chunkErrorRecovery";

/**
 * Red de seguridad para los chunks que fallan fuera de un error boundary:
 * imports dinámicos, prefetch de rutas del router y carga de <script>.
 * React nunca ve esos errores, así que sin esto la app queda a medias sin
 * mostrar nada al usuario.
 */
export default function ChunkErrorRecovery() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error) || isChunkLoadError(event.message)) {
        recoverFromChunkError();
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        recoverFromChunkError();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
