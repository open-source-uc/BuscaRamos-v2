"use client";

import { useEffect } from "react";
import { loadCoursesUnified } from "@/lib/coursesUnifiedClient";

/**
 * Precalienta courses-unified.json apenas se entra al sitio, para que los
 * consumidores (p. ej. ReviewWithCourse) encuentren el mapa ya descargado
 * y parseado. Reutiliza la promesa cacheada de coursesUnifiedClient.
 */
export default function CoursesUnifiedPreloader() {
  useEffect(() => {
    loadCoursesUnified().catch(() => {
      // Silencioso: el consumidor que lo necesite reintentará y logueará
    });
  }, []);

  return null;
}
